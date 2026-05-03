import { CardActionAggregate } from '@engine/application/aggregates/CardActionAggregate';
import { GameEventContext } from '@engine/application/gameEvent/GameEventContext';
import { canUseOptions, computeGameStateDiff } from '@engine/application/gameStateHelper';
import {
  GameEventType,
  Options,
  PassiveType,
  type PendingChoiceType,
  Trigger,
} from '@engine/domain/enums';
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
  lastAddedCards: [],
  lastDrawnCards: [],
  lastDiscardedCards: [],
  round: 0,
  turn: 0,
  phase: Phase.PREGAME,
};

function getAdvanceCardsToDraw(gameState: GameState): number {
  const baseDrawCount = 2;
  const bonusDrawCount = Object.values(gameState.boardEffects)
    .flat()
    .filter(passive => passive.type === PassiveType.ADJUST_ADVANCE_CARDS)
    .reduce((total, passive) => total + (passive.amount ?? 0), 0);

  return Math.max(0, baseDrawCount + bonusDrawCount);
}

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
    this.gameEventContext = new GameEventContext(cardDefs, stickerDefs);
  }

  private apply(event: GameEvent) {
    this.gameState = this.gameEventContext.apply(this.gameState, event);
    this.currentCardAction = null;
  }

  private autoTrigger(): GameState {
    let changed = true;
    while (changed) {
      changed = false;
      for (const [triggerId, trigger] of Object.entries(this.gameState.triggerPile)) {
        if (trigger.effectDef.trigger !== Trigger.ON_DISCOVER || trigger.effectDef.optional) {
          continue;
        }
        const sourceInstance = this.gameState.instances[trigger.sourceInstanceId];
        if (
          trigger.effectDef.trigger === Trigger.ON_DISCOVER &&
          sourceInstance &&
          this.cardDefs[sourceInstance.cardId]?.parchmentCard === true
        ) {
          continue;
        }
        this.gameState = this.cardAction(trigger.effectDef, trigger.sourceInstanceId, triggerId);
        changed = true;
        break;
      }
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
    const event: RoundEndedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.ROUND_ENDED,
      timestamp: Date.now(),
      round: this.gameState.round,
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

    const event: TurnStartedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.TURN_STARTED,
      timestamp: Date.now(),
      turn,
      turnCards,
    };
    this.apply(event);
    this.events.push(event);
    this.autoTrigger();
    return this.gameState;
  }

  public turnEnded(): GameState {
    const event: TurnEndedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.TURN_ENDED,
      timestamp: Date.now(),
    };
    this.apply(event);
    this.events.push(event);

    if (Object.keys(this.gameState.triggerPile).length === 0) {
      if (this.gameState.drawPile.length === 0) {
        return this.roundEnded();
      }
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
    if (this.gameState.drawPile.length === 0 || !canUseOptions(this.gameState, Options.ADVANCE)) {
      return this.gameState;
    }

    const turnCards: number[] = this.gameState.drawPile.slice(
      0,
      getAdvanceCardsToDraw(this.gameState),
    );

    const event: AdvanceEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.ADVANCE,
      timestamp: Date.now(),
      turnCards,
    };
    this.apply(event);
    this.events.push(event);
    this.autoTrigger();
    return this.gameState;
  }

  public upgradeCard(
    cardInstanceId: number,
    stateId: number,
    cost: Resources,
    discardedCardIds: number[] = [],
    destroyedCardIds: number[] = [],
  ): GameState {
    if (!canUseOptions(this.gameState, Options.UPGRADE)) {
      return this.gameState;
    }

    const event: UpgradeCardEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.UPGRADE_CARD,
      timestamp: Date.now(),
      cardInstanceId,
      stateId,
      cost,
      discardedCardIds,
      destroyedCardIds,
    };
    this.apply(event);
    this.events.push(event);
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
    if (
      !canUseOptions(this.gameState, action.endsTurn ? Options.END_TURN_ACTION : Options.ACTION)
    ) {
      return this.gameState;
    }

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
      endsTurn: currentCardAction.isEndTurn(),
    };

    this.apply(event);
    this.events.push(event);
    this.autoTrigger();

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
