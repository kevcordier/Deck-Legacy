import {
  AddResourceStrategy,
  AddStickerStrategy,
  BlockCardStrategy,
  CardActionContext,
  DestroyCardStrategy,
  DiscardCardStrategy,
  PlaceCardInDrawPileStrategy,
  PlayCardStrategy,
  UpgradeCardStrategy,
} from '@engine/application/cardAction';
import { ActionType, GameEventType, Trigger } from '@engine/domain/enums';
import type {
  CardInstance,
  AdvanceEvent,
  CardProducedEvent,
  GameEvent,
  GameStartedEvent,
  PassEvent,
  RoundStartedEvent,
  TurnStartedEvent,
  UpgradeCardEvent,
  UseCardEffectEvent,
  GameState,
  Resources,
  CardDef,
  ResolvedCost,
  TriggerEntry,
  ResolvedAction,
  SkipTriggerEvent,
} from '@engine/domain/types';
import {
  destroyCards,
  discardCards,
  drawCards,
  endTurn,
  spendResources,
} from '@engine/application/gameStateHelper';
import { mergeResources } from '@engine/application/resourceHelpers';
import { getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import { ChoseStateStrategy } from '@engine/application/cardAction/ChoseStateStrategy';
import { DiscoverCardStrategy } from '@engine/application/cardAction/DiscoverCardStrategy';

export const EMPTY_STATE: GameState = {
  instances: {},
  drawPile: [],
  discardPile: [],
  board: [],
  destroyedPile: [],
  permanents: [],
  blockingCards: {},
  resources: {},
  stickerStock: {},
  discoveryPile: [],
  triggerPile: {},
  lastAddedIds: [],
  round: 0,
  turn: 0,
};

export class GameAggregate {
  private events: GameEvent[];
  private gameState: GameState;
  private saveState: GameState;
  private cardDefs: Record<number, CardDef>;

  constructor(
    eventHistory: GameEvent[] = [],
    initialState: GameState,
    cardDefs: Record<number, CardDef>,
  ) {
    this.events = eventHistory;
    this.gameState = initialState;
    this.saveState = JSON.parse(JSON.stringify(initialState)) as GameState;
    this.cardDefs = cardDefs;
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
        this.gameState.discardPile = [];
        this.gameState.board = [];
        break;
      }
      case GameEventType.TURN_STARTED: {
        const turnStartedEvent = event as TurnStartedEvent;
        this.gameState = {
          ...this.gameState,
          ...drawCards(
            { ...this.gameState, lastAddedIds: [], turn: turnStartedEvent.turn },
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
          ...endTurn(
            discardCards(spendResources(this.gameState, upgradeCardEvent.cost), [
              upgradeCardEvent.cardInstanceId,
            ]),
          ),
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
          ...discardCards(
            destroyCards(
              spendResources(
                useCardEffectEvent.gameState,
                useCardEffectEvent.resolvedCost.resources,
              ),
              destroyedCardIds,
            ),
            discardedCardIds,
          ),
        };
        delete this.gameState.triggerPile[useCardEffectEvent.triggerId];
        break;
      }
      case GameEventType.SKIP_TRIGGER: {
        const skipTriggerEvent = event as SkipTriggerEvent;
        delete this.gameState.triggerPile[skipTriggerEvent.triggerId];
        break;
      }
      case GameEventType.PASS: {
        this.gameState = { ...this.gameState, ...endTurn(this.gameState) };
        break;
      }
      default:
        throw new Error(`Unknown event type: ${event.type}`);
    }
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  public loadFromHistory(events: GameEvent[]) {
    events.forEach(event => this.apply(event));
    this.events = events;
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

  public roundStarted(): RoundStartedEvent {
    const round = this.gameState.round + 1;
    const newCards: number[] = [];
    const onDiscoverEvents: TriggerEntry[] = [];
    if (round > 1) {
      const firstDiscoveredCard = this.gameState.discoveryPile.slice(0, 1)[0];
      newCards.push(firstDiscoveredCard);
      const cardInstance = this.gameState.instances[firstDiscoveredCard];
      const cardDef = this.cardDefs[cardInstance.cardId];

      onDiscoverEvents.push(
        ...getInstancesTriggerEffects([cardInstance], this.cardDefs, Trigger.ON_DISCOVER),
      );

      if (!cardDef.parchmentCard) {
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
    return event;
  }

  public turnStarted(): TurnStartedEvent | undefined {
    if (this.gameState.drawPile.length === 0) {
      this.roundStarted();
      return;
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
    return event;
  }

  public cardProduced(
    cardInstanceId: number,
    productions: Record<string, number>,
  ): CardProducedEvent {
    const event: CardProducedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.CARD_PRODUCED,
      timestamp: Date.now(),
      cardInstanceId,
      productions,
    };
    this.apply(event);
    this.events.push(event);
    return event;
  }

  public advance() {
    if (this.gameState.drawPile.length === 0) {
      return;
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
    return event;
  }

  public upgradeCard(cardInstanceId: number, stateId: number, cost: Resources): UpgradeCardEvent {
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

    this.turnStarted();
    return event;
  }

  public useCardEffect(
    effects: ResolvedAction[],
    resolvedCost: ResolvedCost,
    isDiscarded = false,
    isDestroyed = false,
    triggerId: string,
    validatedStepId?: number,
    explicitSourceInstanceId?: number,
  ): UseCardEffectEvent {
    const cardActionContext = new CardActionContext();

    const gameState = effects.reduce((gameState, effect) => {
      switch (effect.type) {
        case ActionType.ADD_RESOURCES: {
          cardActionContext.setStrategy(new AddResourceStrategy());
          break;
        }
        case ActionType.DISCARD_CARD: {
          cardActionContext.setStrategy(new DiscardCardStrategy());
          break;
        }
        case ActionType.DISCOVER_CARD: {
          cardActionContext.setStrategy(new DiscoverCardStrategy(this.cardDefs));
          break;
        }
        case ActionType.DESTROY_CARD: {
          cardActionContext.setStrategy(new DestroyCardStrategy());
          break;
        }
        case ActionType.UPGRADE_CARD: {
          cardActionContext.setStrategy(new UpgradeCardStrategy());
          break;
        }
        case ActionType.PLACE_CARD_IN_DRAW_PILE: {
          cardActionContext.setStrategy(new PlaceCardInDrawPileStrategy());
          break;
        }
        case ActionType.BLOCK_CARD: {
          cardActionContext.setStrategy(new BlockCardStrategy());
          break;
        }
        case ActionType.PLAY_CARD: {
          cardActionContext.setStrategy(new PlayCardStrategy());
          break;
        }
        case ActionType.ADD_STICKER: {
          cardActionContext.setStrategy(new AddStickerStrategy());
          break;
        }
        case ActionType.CHOOSE_STATE: {
          cardActionContext.setStrategy(new ChoseStateStrategy());
          break;
        }
        default:
          throw new Error(`Unknown effect type: ${effect.type}`);
      }

      return cardActionContext.applyEffect(gameState, effect);
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
      ...(validatedStepId !== undefined ? { validatedStepId } : {}),
    };
    this.apply(event);
    this.events.push(event);
    return event;
  }

  public pass(): PassEvent {
    const event: PassEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.PASS,
      timestamp: Date.now(),
    };
    this.apply(event);
    this.events.push(event);

    this.turnStarted();
    return event;
  }

  public skipTrigger(triggerId: string) {
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
    return event;
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
