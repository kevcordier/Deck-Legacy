import {
  AddBoardEffectStrategy,
  AddCumulatedStrategy,
  AddResourceStrategy,
  AddStickerStrategy,
  BlockCardStrategy,
  CardActionContext,
  type CardActionStrategy,
  DestroyCardStrategy,
  DiscardCardStrategy,
  PlaceCardInDrawPileStrategy,
  PlayCardStrategy,
  SetCumulatedStrategy,
  UpgradeCardStrategy,
} from '@engine/application/cardAction';
import { ChoseStateStrategy } from '@engine/application/cardAction/ChoseStateStrategy';
import { DiscoverCardStrategy } from '@engine/application/cardAction/DiscoverCardStrategy';
import { TrackAdvanceStrategy } from '@engine/application/cardAction/TrackAdvanceStrategy';
import { getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import { GameEventContext } from '@engine/application/gameEvent/GameEventContext';
import { computeGameStateDiff } from '@engine/application/gameStateHelper';
import { ActionType, GameEventType, Trigger } from '@engine/domain/enums';
import type {
  AdvanceEvent,
  CardDef,
  CardInstance,
  CardProducedEvent,
  GameEvent,
  GameStartedEvent,
  GameState,
  ResolvedAction,
  ResolvedCost,
  Resources,
  RoundStartedEvent,
  SkipTriggerEvent,
  TriggerEntry,
  TurnEndedEvent,
  TurnStartedEvent,
  UpgradeCardEvent,
  UseCardEffectEvent,
} from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export const EMPTY_STATE: GameState = {
  instances: {},
  drawPile: [],
  discardPile: [],
  board: [],
  destroyedPile: [],
  permanents: [],
  resources: {},
  stickerStock: {},
  discoveryPile: [],
  boardEffects: {},
  triggerPile: {},
  lastAddedIds: [],
  lastDrawnCards: [],
  round: 0,
  turn: 0,
  phase: Phase.PREGAME,
};

export class GameAggregate {
  private events: GameEvent[];
  private gameState: GameState;
  private readonly gameEventContext: GameEventContext;

  constructor(
    readonly initialState: GameState,
    readonly cardDefs: Record<number, CardDef>,
    readonly eventHistory: GameEvent[] = [],
  ) {
    this.events = eventHistory;
    this.gameState = initialState;
    this.gameEventContext = new GameEventContext(cardDefs);
  }

  private apply(event: GameEvent) {
    this.gameState = this.gameEventContext.apply(this.gameState, event);
  }

  private withConsumedAction(
    gameState: GameState,
    sourceInstanceId: number,
    actionId: string,
  ): GameState {
    const sourceInstance = gameState.instances[sourceInstanceId];
    if (!sourceInstance || sourceInstance.usedActionIds.includes(actionId)) {
      return gameState;
    }

    return {
      ...gameState,
      instances: {
        ...gameState.instances,
        [sourceInstanceId]: {
          ...sourceInstance,
          usedActionIds: [...sourceInstance.usedActionIds, actionId],
        },
      },
    };
  }

  public loadFromHistory(events: GameEvent[]): GameState {
    events.forEach(event => this.apply(event));
    this.events = events;
    return this.gameState;
  }

  public gameStarted(
    cardInstances: CardInstance[],
    initialDeck: number[],
    stickerStock: Record<string, number>,
    discoveryPile: number[],
  ): GameStartedEvent {
    const event: GameStartedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.GAME_STARTED,
      timestamp: Date.now(),
      cardInstances,
      initialDeck,
      stickerStock,
      discoveryPile,
    };
    this.apply(event);
    this.events.push(event);
    return event;
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      // eslint-disable-next-line sonarjs/pseudo-random
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  public roundStarted(): GameState {
    const round = this.gameState.round + 1;
    const newCards: number[] = [];
    const onDiscoverEvents: TriggerEntry[] = [];
    if (round > 1) {
      const firstDiscoveredCard = this.gameState.discoveryPile.slice(0, 1)[0];
      const cardInstance = this.gameState.instances[firstDiscoveredCard];
      const cardDef = this.cardDefs[cardInstance.cardId];

      onDiscoverEvents.push(
        ...getInstancesTriggerEffects(
          [cardInstance],
          this.cardDefs,
          Trigger.ON_DISCOVER,
          this.gameState,
        ),
      );

      if (!cardDef.parchmentCard) {
        newCards.push(firstDiscoveredCard);
        const secondDiscoveredCard = this.gameState.discoveryPile.slice(1, 2)[0];
        newCards.push(secondDiscoveredCard);
        const cardInstance = this.gameState.instances[secondDiscoveredCard];

        onDiscoverEvents.push(
          ...getInstancesTriggerEffects(
            [cardInstance],
            this.cardDefs,
            Trigger.ON_DISCOVER,
            this.gameState,
          ),
        );
      }
    }

    const event: RoundStartedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.ROUND_STARTED,
      timestamp: Date.now(),
      round,
      newCards,
      newDrawPile: this.shuffle([
        ...this.gameState.drawPile,
        ...this.gameState.discardPile,
        ...this.gameState.board,
        ...newCards,
      ]),
      onDiscoverEvents,
    };
    this.apply(event);
    this.events.push(event);
    return this.gameState;
  }

  public turnStarted(): GameState {
    if (this.gameState.drawPile.length === 0) {
      return this.roundStarted();
    }

    const turn = this.gameState.turn + 1;
    const turnCards: number[] = this.gameState.drawPile.slice(0, 4);
    this.gameState.lastDrawnCards = turnCards; // Should be set by the PlayCardStrategy, but setting it here to make sure it's available for triggers on turn start
    const onPlayEvents = getInstancesTriggerEffects(
      turnCards.map(cardId => this.gameState.instances[cardId]),
      this.cardDefs,
      Trigger.ON_PLAY,
      this.gameState,
    );

    const event: TurnStartedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.TURN_STARTED,
      timestamp: Date.now(),
      turn,
      turnCards,
      onPlayEvents,
    };
    this.apply(event);
    this.events.push(event);
    return this.gameState;
  }

  public turnEnded(): GameState {
    const onTurnEndedEvents = getInstancesTriggerEffects(
      this.gameState.board.map(cardId => this.gameState.instances[cardId]),
      this.cardDefs,
      Trigger.END_OF_TURN,
      this.gameState,
    );

    const event: TurnEndedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.TURN_ENDED,
      timestamp: Date.now(),
      onTurnEndedEvents,
    };
    this.apply(event);
    this.events.push(event);

    if (onTurnEndedEvents.length === 0) {
      return this.turnStarted();
    }
    return this.gameState;
  }

  public cardProduced(cardInstanceId: number, productions: Record<string, number>): GameState {
    const event: CardProducedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.CARD_PRODUCED,
      timestamp: Date.now(),
      cardInstanceId,
      productions,
    };
    this.apply(event);
    this.events.push(event);
    return this.gameState;
  }

  public setCardName(cardInstanceId: number, chosenName: string): GameState {
    const instance = this.gameState.instances[cardInstanceId];
    if (!instance) return this.gameState;
    if ((instance.chosenName ?? '') === chosenName) return this.gameState;

    const prevState = this.gameState;
    const nextState: GameState = {
      ...this.gameState,
      instances: {
        ...this.gameState.instances,
        [cardInstanceId]: {
          ...instance,
          chosenName,
        },
      },
    };

    const event: UseCardEffectEvent = {
      id: crypto.randomUUID(),
      actionId: `set-card-name-${cardInstanceId}`,
      type: GameEventType.USE_CARD_EFFECT,
      timestamp: Date.now(),
      gameStateChanges: computeGameStateDiff(prevState, nextState),
      resolvedCost: { resources: {}, discardedCardIds: [], destroyedCardIds: [] },
      sourceInstanceId: cardInstanceId,
      triggerId: `set-card-name-${cardInstanceId}`,
      isDiscarded: false,
      isDestroyed: false,
    };

    this.apply(event);
    this.events.push(event);
    return this.gameState;
  }

  public advance(): GameState {
    if (this.gameState.drawPile.length === 0) {
      return this.gameState;
    }

    const turnCards: number[] = this.gameState.drawPile.slice(0, 2);
    this.gameState.lastDrawnCards = turnCards; // Should be set by the PlayCardStrategy, but setting it here to make sure it's available for triggers on advance
    const onPlayEvents = getInstancesTriggerEffects(
      turnCards.map(cardId => this.gameState.instances[cardId]),
      this.cardDefs,
      Trigger.ON_PLAY,
      this.gameState,
    );

    const event: AdvanceEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.ADVANCE,
      timestamp: Date.now(),
      turnCards,
      onPlayEvents,
    };
    this.apply(event);
    this.events.push(event);
    return this.gameState;
  }

  public upgradeCard(cardInstanceId: number, stateId: number, cost: Resources): GameState {
    const event: UpgradeCardEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.UPGRADE_CARD,
      timestamp: Date.now(),
      cardInstanceId,
      stateId,
      cost,
    };
    this.apply(event);
    this.events.push(event);

    this.turnEnded();
    return this.gameState;
  }

  private getStrategy(effectType: ActionType): CardActionStrategy {
    const strategies: Partial<Record<ActionType, CardActionStrategy>> = {
      [ActionType.ADD_RESOURCES]: new AddResourceStrategy(),
      [ActionType.DISCARD_CARD]: new DiscardCardStrategy(),
      [ActionType.DISCOVER_CARD]: new DiscoverCardStrategy(this.cardDefs),
      [ActionType.DESTROY_CARD]: new DestroyCardStrategy(),
      [ActionType.UPGRADE_CARD]: new UpgradeCardStrategy(),
      [ActionType.PLACE_CARD_IN_DRAW_PILE]: new PlaceCardInDrawPileStrategy(),
      [ActionType.BLOCK_CARD]: new BlockCardStrategy(),
      [ActionType.ADD_BOARD_EFFECT]: new AddBoardEffectStrategy(),
      [ActionType.PLAY_CARD]: new PlayCardStrategy(this.cardDefs),
      [ActionType.BOOST_CARD]: new AddStickerStrategy(),
      [ActionType.ADD_STICKER]: new AddStickerStrategy(),
      [ActionType.CHOOSE_STATE]: new ChoseStateStrategy(),
      [ActionType.TRACK_ADVANCE]: new TrackAdvanceStrategy(this.cardDefs),
      [ActionType.SET_CUMULATED]: new SetCumulatedStrategy(),
      [ActionType.ADD_CUMULATED]: new AddCumulatedStrategy(),
    };
    const strategy = strategies[effectType];
    if (!strategy) {
      throw new Error(`Unknown effect type: ${effectType}`);
    }
    return strategy;
  }

  public applyCardEffect(
    actionId: string,
    effects: ResolvedAction[],
    resolvedCost: ResolvedCost,
    triggerId: string,
    options: {
      isDiscarded?: boolean;
      isDestroyed?: boolean;
      endsTurn?: boolean;
      explicitSourceInstanceId?: number;
      consumeAction?: boolean;
    } = {},
  ): GameState {
    const {
      isDiscarded = false,
      isDestroyed = false,
      endsTurn = false,
      explicitSourceInstanceId,
      consumeAction = false,
    } = options;
    const cardActionContext = new CardActionContext();

    const prevState = this.gameState;
    const sourceInstanceId = explicitSourceInstanceId ?? effects[0]?.sourceInstanceId ?? -1;
    const resolvedState = effects.reduce((gs, effect) => {
      cardActionContext.setStrategy(this.getStrategy(effect.type));
      return cardActionContext.applyEffect(gs, effect);
    }, this.gameState);
    const gameState =
      consumeAction && sourceInstanceId !== -1
        ? this.withConsumedAction(resolvedState, sourceInstanceId, actionId)
        : resolvedState;

    const event: UseCardEffectEvent = {
      id: crypto.randomUUID(),
      actionId,
      type: GameEventType.USE_CARD_EFFECT,
      timestamp: Date.now(),
      gameStateChanges: computeGameStateDiff(prevState, gameState),
      resolvedCost,
      sourceInstanceId,
      triggerId,
      isDiscarded,
      isDestroyed,
    };
    this.apply(event);
    this.events.push(event);
    if (this.gameState.phase === Phase.END_TURN) {
      if (Object.keys(this.gameState.triggerPile).length === 0) {
        return this.turnStarted();
      }
    } else if (endsTurn) {
      return this.turnEnded();
    }
    return this.gameState;
  }

  public skipTrigger(triggerId: string): GameState {
    if (!this.gameState.triggerPile[triggerId]) {
      throw new Error(`Trigger with id ${triggerId} not found in trigger pile`);
    }
    const event: SkipTriggerEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.SKIP_TRIGGER,
      timestamp: Date.now(),
      triggerId,
    };
    this.apply(event);
    this.events.push(event);
    if (
      this.gameState.phase === Phase.END_TURN &&
      Object.keys(this.gameState.triggerPile).length === 0
    ) {
      return this.turnStarted();
    }
    return this.gameState;
  }

  public getGameState() {
    return this.gameState;
  }

  public getEvents(): GameEvent[] {
    return this.events;
  }
}
