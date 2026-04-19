import {
  AddBoardEffectStrategy,
  AddResourceStrategy,
  AddStickerStrategy,
  BlockCardStrategy,
  CardActionContext,
  type CardActionStrategy,
  DestroyCardStrategy,
  DiscardCardStrategy,
  PlaceCardInDrawPileStrategy,
  PlayCardStrategy,
  UpgradeCardStrategy,
} from '@engine/application/cardAction';
import { ChoseStateStrategy } from '@engine/application/cardAction/ChoseStateStrategy';
import { DiscoverCardStrategy } from '@engine/application/cardAction/DiscoverCardStrategy';
import { getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import {
  destroyCards,
  discardCards,
  drawCards,
  endTurn,
  mergeResources,
  spendResources,
} from '@engine/application/gameStateHelper';
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
  round: 0,
  turn: 0,
  phase: Phase.PREGAME,
};

export class GameAggregate {
  private events: GameEvent[];
  private gameState: GameState;
  private saveState: GameState;

  constructor(
    readonly initialState: GameState,
    readonly cardDefs: Record<number, CardDef>,
    readonly eventHistory: GameEvent[] = [],
  ) {
    this.events = eventHistory;
    this.gameState = initialState;
    this.saveState = JSON.parse(JSON.stringify(initialState)) as GameState;
  }

  private apply(event: GameEvent) {
    switch (event.type) {
      case GameEventType.GAME_STARTED: {
        const gameStartedEvent = event as GameStartedEvent;
        this.gameState.instances = Object.fromEntries(
          gameStartedEvent.cardInstances.map(inst => [inst.id, inst]),
        );
        this.gameState.drawPile = gameStartedEvent.initialDeck;
        this.gameState.stickerStock = gameStartedEvent.stickerStock;
        this.gameState.discoveryPile = gameStartedEvent.discoveryPile;
        this.gameState.round = 0;
        this.gameState.turn = 0;
        this.gameState.phase = Phase.PREGAME;
        break;
      }
      case GameEventType.ROUND_STARTED: {
        const roundStartedEvent = event as RoundStartedEvent;
        this.gameState.round = roundStartedEvent.round;
        this.gameState.turn = 0;
        this.gameState.lastAddedIds = roundStartedEvent.newCards;
        this.gameState.drawPile = this.shuffle([
          ...this.gameState.drawPile,
          ...this.gameState.discardPile,
          ...this.gameState.board,
          ...roundStartedEvent.newCards,
        ]);
        this.gameState.triggerPile = roundStartedEvent.onDiscoverEvents.reduce(
          (acc, { effectDef, sourceInstanceId }) => {
            const triggerId = crypto.randomUUID();
            acc[triggerId] = { effectDef, sourceInstanceId };
            return acc;
          },
          {} as Record<string, TriggerEntry>,
        );
        this.gameState.boardEffects = {};
        this.gameState.discardPile = [];
        this.gameState.board = [];
        this.gameState.phase = Phase.START_ROUND;
        break;
      }
      case GameEventType.TURN_STARTED: {
        const turnStartedEvent = event as TurnStartedEvent;
        this.gameState = {
          ...this.gameState,
          ...drawCards(
            endTurn(
              { ...this.gameState, lastAddedIds: [], turn: turnStartedEvent.turn },
              this.cardDefs,
            ),
            turnStartedEvent.turnCards,
          ),
        };
        this.gameState.triggerPile = turnStartedEvent.onPlayEvents.reduce(
          (acc, { effectDef, sourceInstanceId }) => {
            const triggerId = crypto.randomUUID();
            acc[triggerId] = { effectDef, sourceInstanceId };
            return acc;
          },
          {} as Record<string, TriggerEntry>,
        );
        this.gameState.phase = Phase.PLAYING;
        break;
      }
      case GameEventType.CARD_PRODUCED: {
        const cardProducedEvent = event as CardProducedEvent;
        this.gameState.resources = mergeResources(
          this.gameState.resources,
          cardProducedEvent.productions,
        );
        this.gameState = {
          ...this.gameState,
          ...discardCards(this.gameState, [cardProducedEvent.cardInstanceId]),
        };
        break;
      }
      case GameEventType.ADVANCE: {
        const advanceEvent = event as AdvanceEvent;
        this.gameState = {
          ...this.gameState,
          ...drawCards(this.gameState, advanceEvent.turnCards),
        };
        this.gameState.triggerPile = advanceEvent.onPlayEvents.reduce(
          (acc, { effectDef, sourceInstanceId }) => {
            const triggerId = crypto.randomUUID();
            acc[triggerId] = { effectDef, sourceInstanceId };
            return acc;
          },
          {} as Record<string, TriggerEntry>,
        );
        break;
      }
      case GameEventType.UPGRADE_CARD: {
        const upgradeCardEvent = event as UpgradeCardEvent;
        this.gameState.instances[upgradeCardEvent.cardInstanceId].stateId =
          upgradeCardEvent.stateId;
        this.gameState = {
          ...this.gameState,
          ...discardCards(spendResources(this.gameState, upgradeCardEvent.cost), [
            upgradeCardEvent.cardInstanceId,
          ]),
        };
        break;
      }
      case GameEventType.USE_CARD_EFFECT: {
        const useCardEffectEvent = event as UseCardEffectEvent;
        if (useCardEffectEvent.validatedStepId !== undefined) {
          const inst = this.gameState.instances[useCardEffectEvent.sourceInstanceId];
          if (inst) {
            inst.trackProgress = [...inst.trackProgress, useCardEffectEvent.validatedStepId];
          }
        }
        const discardedCardIds = useCardEffectEvent.resolvedCost.discardedCardIds || [];
        const destroyedCardIds = useCardEffectEvent.resolvedCost.destroyedCardIds || [];
        if (useCardEffectEvent.isDiscarded) {
          discardedCardIds.push(useCardEffectEvent.sourceInstanceId);
        } else if (useCardEffectEvent.isDestroyed) {
          destroyedCardIds.push(useCardEffectEvent.sourceInstanceId);
        }
        this.gameState = {
          ...this.gameState,
          ...destroyCards(
            discardCards(
              spendResources(
                useCardEffectEvent.gameState,
                useCardEffectEvent.resolvedCost.resources,
              ),
              discardedCardIds,
            ),
            destroyedCardIds,
          ),
        };
        const { [useCardEffectEvent.triggerId]: _usedTrigger, ...restTriggers } =
          this.gameState.triggerPile;
        this.gameState = { ...this.gameState, triggerPile: restTriggers };
        break;
      }
      case GameEventType.SKIP_TRIGGER: {
        const skipTriggerEvent = event as SkipTriggerEvent;
        const { [skipTriggerEvent.triggerId]: _skippedTrigger, ...restSkipTriggers } =
          this.gameState.triggerPile;
        this.gameState = { ...this.gameState, triggerPile: restSkipTriggers };
        break;
      }
      case GameEventType.TURN_ENDED: {
        const turnEndedEvent = event as TurnEndedEvent;
        this.gameState.triggerPile = turnEndedEvent.onTurnEndedEvents.reduce(
          (acc, { effectDef, sourceInstanceId }) => {
            const triggerId = crypto.randomUUID();
            acc[triggerId] = { effectDef, sourceInstanceId };
            return acc;
          },
          {} as Record<string, TriggerEntry>,
        );
        this.gameState.phase = Phase.END_TURN;
        break;
      }
      default:
        throw new Error(`Unknown event type: ${event.type}`);
    }
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

  public loadFromHistory(events: GameEvent[]): GameState {
    events.forEach(event => this.apply(event));
    this.events = events;
    return this.gameState;
  }

  private save() {
    this.saveState = JSON.parse(JSON.stringify(this.gameState)) as GameState;
    this.events = [];
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
    return event;
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
        ...getInstancesTriggerEffects([cardInstance], this.cardDefs, Trigger.ON_DISCOVER),
      );

      if (!cardDef.parchmentCard) {
        newCards.push(firstDiscoveredCard);
        const secondDiscoveredCard = this.gameState.discoveryPile.slice(1, 2)[0];
        newCards.push(secondDiscoveredCard);
        const cardInstance = this.gameState.instances[secondDiscoveredCard];

        onDiscoverEvents.push(
          ...getInstancesTriggerEffects([cardInstance], this.cardDefs, Trigger.ON_DISCOVER),
        );
      }
    }

    const event: RoundStartedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.ROUND_STARTED,
      timestamp: Date.now(),
      round,
      newCards,
      onDiscoverEvents,
    };
    this.apply(event);
    this.save();
    return this.gameState;
  }

  public turnStarted(): GameState {
    if (this.gameState.drawPile.length === 0) {
      this.roundStarted();
      return this.gameState;
    }

    const turn = this.gameState.turn + 1;
    const turnCards: number[] = this.gameState.drawPile.slice(0, 4);
    const onPlayEvents = getInstancesTriggerEffects(
      turnCards.map(cardId => this.gameState.instances[cardId]),
      this.cardDefs,
      Trigger.ON_PLAY,
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
    this.save();
    return this.gameState;
  }

  public turnEnded(): GameState {
    const onTurnEndedEvents = getInstancesTriggerEffects(
      this.gameState.board.map(cardId => this.gameState.instances[cardId]),
      this.cardDefs,
      Trigger.END_OF_TURN,
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

  public advance(): GameState {
    if (this.gameState.drawPile.length === 0) {
      return this.gameState;
    }

    const turnCards: number[] = this.gameState.drawPile.slice(0, 2);
    const onPlayEvents = getInstancesTriggerEffects(
      turnCards.map(cardId => this.gameState.instances[cardId]),
      this.cardDefs,
      Trigger.ON_PLAY,
    );

    const event: AdvanceEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.ADVANCE,
      timestamp: Date.now(),
      turnCards,
      onPlayEvents,
    };
    this.apply(event);
    this.save();
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
    };
    const strategy = strategies[effectType];
    if (!strategy) {
      throw new Error(`Unknown effect type: ${effectType}`);
    }
    return strategy;
  }

  public applyCardEffect(
    effects: ResolvedAction[],
    resolvedCost: ResolvedCost,
    triggerId: string,
    options: {
      isDiscarded?: boolean;
      isDestroyed?: boolean;
      endsTurn?: boolean;
      validatedStepId?: number;
      explicitSourceInstanceId?: number;
    } = {},
  ): GameState {
    const {
      isDiscarded = false,
      isDestroyed = false,
      endsTurn = false,
      validatedStepId,
      explicitSourceInstanceId,
    } = options;
    const cardActionContext = new CardActionContext();

    const gameState = effects.reduce((gs, effect) => {
      cardActionContext.setStrategy(this.getStrategy(effect.type));
      return cardActionContext.applyEffect(gs, effect);
    }, this.gameState);

    const event: UseCardEffectEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.USE_CARD_EFFECT,
      timestamp: Date.now(),
      gameState,
      resolvedCost,
      sourceInstanceId: explicitSourceInstanceId ?? effects[0]?.sourceInstanceId ?? -1,
      triggerId,
      isDiscarded,
      isDestroyed,
      validatedStepId,
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

  public getSaveState() {
    return this.saveState;
  }
}
