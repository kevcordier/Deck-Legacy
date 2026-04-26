import { CardActionAggregate } from '@engine/application/aggregates/CardActionAggregate';
import { getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import { GameEventContext } from '@engine/application/gameEvent/GameEventContext';
import { computeGameStateDiff } from '@engine/application/gameStateHelper';
import { GameEventType, type PendingChoiceType, Trigger } from '@engine/domain/enums';
import type {
  AdvanceEvent,
  CardAction,
  CardActionEvent,
  CardDef,
  CardInstance,
  CardProducedEvent,
  ChooseStateEvent,
  GameEvent,
  GameStartedEvent,
  GameState,
  ResolvedActionEffect,
  ResolvedCost,
  Resources,
  RoundEndedEvent,
  RoundStartedEvent,
  SkipTriggerEvent,
  Sticker,
  TriggerEntry,
  TurnEndedEvent,
  TurnStartedEvent,
  UpgradeCardEvent,
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
  private currentCardAction: CardActionAggregate | null = null;

  constructor(
    readonly initialState: GameState,
    readonly cardDefs: Record<number, CardDef>,
    readonly stickerDefs: Record<number, Sticker>,
    readonly eventHistory: GameEvent[] = [],
  ) {
    this.events = eventHistory;
    this.gameState = initialState;
    this.gameEventContext = new GameEventContext(cardDefs);
  }

  private apply(event: GameEvent) {
    this.gameState = this.gameEventContext.apply(this.gameState, event);
    this.currentCardAction = null;
  }

  private autoTrigger(): GameState {
    const newTriggers = this.gameState.triggerPile;

    const firstTriggerEntry = newTriggers[Object.keys(newTriggers)[0]];
    const sourceInstance =
      firstTriggerEntry && this.gameState.instances[firstTriggerEntry.sourceInstanceId];

    if (
      Object.entries(newTriggers).length === 1 &&
      firstTriggerEntry.effectDef.optional !== true &&
      sourceInstance &&
      this.cardDefs[sourceInstance.cardId]?.parchmentCard !== true
    ) {
      const [triggerId, trigger] = Object.entries(this.gameState.triggerPile)[0];
      this.gameState = this.cardAction(trigger.effectDef, trigger.sourceInstanceId, triggerId);
    }

    return this.gameState;
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
  ): GameState {
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
    this.roundStarted();
    this.turnStarted();
    return this.gameState;
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

  public roundEnded(): GameState {
    const newCards: number[] = [];
    const onDiscoverEvents: TriggerEntry[] = [];
    const firstDiscoveredCard = this.gameState.discoveryPile.slice(0, 1)[0];
    const cardInstance = this.gameState.instances[firstDiscoveredCard];
    const cardDef = this.cardDefs[cardInstance.cardId];

    onDiscoverEvents.push(
      ...getInstancesTriggerEffects(
        [cardInstance],
        this.cardDefs,
        this.stickerDefs,
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
          this.stickerDefs,
          Trigger.ON_DISCOVER,
          this.gameState,
        ),
      );
    }

    const event: RoundEndedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.ROUND_ENDED,
      timestamp: Date.now(),
      newCards,
      onDiscoverEvents,
    };

    this.apply(event);
    this.events.push(event);
    this.autoTrigger();
    return this.gameState;
  }

  public roundStarted(): GameState {
    const round = this.gameState.round + 1;

    const event: RoundStartedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.ROUND_STARTED,
      timestamp: Date.now(),
      round,
      newDrawPile: this.shuffle([
        ...this.gameState.drawPile,
        ...this.gameState.discardPile,
        ...this.gameState.board,
      ]),
    };
    this.apply(event);
    this.events.push(event);
    this.autoTrigger();
    this.turnStarted();
    return this.gameState;
  }

  public turnStarted(): GameState {
    if (this.gameState.drawPile.length === 0) {
      return this.roundEnded();
    }

    const turn = this.gameState.turn + 1;
    const turnCards: number[] = this.gameState.drawPile.slice(0, 4);
    this.gameState.lastDrawnCards = turnCards; // Should be set by the PlayCardStrategy, but setting it here to make sure it's available for triggers on turn start
    const onPlayEvents = getInstancesTriggerEffects(
      turnCards.map(cardId => this.gameState.instances[cardId]),
      this.cardDefs,
      this.stickerDefs,
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
    this.autoTrigger();
    return this.gameState;
  }

  public turnEnded(): GameState {
    const onTurnEndedEvents = getInstancesTriggerEffects(
      this.gameState.board.map(cardId => this.gameState.instances[cardId]),
      this.cardDefs,
      this.stickerDefs,
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

  public advance(): GameState {
    if (this.gameState.drawPile.length === 0) {
      return this.gameState;
    }

    const turnCards: number[] = this.gameState.drawPile.slice(0, 2);
    this.gameState.lastDrawnCards = turnCards; // Should be set by the PlayCardStrategy, but setting it here to make sure it's available for triggers on advance
    const onPlayEvents = getInstancesTriggerEffects(
      turnCards.map(cardId => this.gameState.instances[cardId]),
      this.cardDefs,
      this.stickerDefs,
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
    this.autoTrigger();
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

  public chooseState(cardInstanceId: number, stateId: number): GameState {
    const event: ChooseStateEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.CHOOSE_STATE,
      timestamp: Date.now(),
      cardInstanceId,
      stateId,
    };
    this.apply(event);

    const oldEvent = this.events.findIndex(
      e =>
        e.type === GameEventType.CHOOSE_STATE &&
        (e as ChooseStateEvent).cardInstanceId === cardInstanceId,
    );
    if (oldEvent >= 0) {
      this.events[oldEvent] = event;
    } else {
      this.events.push(event);
    }

    return this.gameState;
  }

  public cardAction(action: CardAction, instanceId: number, triggerId?: string): GameState {
    this.currentCardAction = new CardActionAggregate(
      this.cardDefs,
      this.stickerDefs,
      this.gameState,
      this.gameState.instances[instanceId],
      action,
      triggerId,
    );

    this.currentCardAction.resolveAction();

    if (this.currentCardAction.getPendingChoices().length > 0) {
      return this.gameState;
    }

    return this.finalizeCurrentCardAction(this.currentCardAction);
  }

  public resolveCardActionChoice(
    choice: ResolvedActionEffect,
    choiceType?: PendingChoiceType,
  ): GameState {
    if (!this.currentCardAction) {
      return this.gameState;
    }

    this.currentCardAction.resolvePlayerChoice(choice, choiceType);
    if (this.currentCardAction.getPendingChoices().length > 0) {
      return this.gameState;
    }

    return this.finalizeCurrentCardAction(this.currentCardAction);
  }

  public resolveCardActionCost(resolvedCost: ResolvedCost): GameState {
    if (!this.currentCardAction) {
      return this.gameState;
    }

    this.currentCardAction.resolveCostChoice(resolvedCost);
    if (this.currentCardAction.getPendingChoices().length > 0) {
      return this.gameState;
    }

    return this.finalizeCurrentCardAction(this.currentCardAction);
  }

  private finalizeCurrentCardAction(currentCardAction: CardActionAggregate): GameState {
    const newGameState = currentCardAction.getGameState();

    const event: CardActionEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.CARD_ACTION,
      timestamp: Date.now(),
      gameStateChanges: computeGameStateDiff(this.gameState, newGameState),
      sourceInstanceId: currentCardAction.getSourceInstanceId(),
      actionId: currentCardAction.getActionId(),
    };

    const isEndTurn = currentCardAction.isEndTurn();

    this.apply(event);
    this.events.push(event);
    this.autoTrigger();
    if (isEndTurn) {
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
      this.gameState.phase === Phase.PRETURN &&
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

  public getCurrentCardAction(): CardActionAggregate | null {
    return this.currentCardAction;
  }
}
