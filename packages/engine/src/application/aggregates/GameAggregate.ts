import {
  GameEventType,
  Options,
  PassiveType,
  type PendingChoiceType,
  Phase,
  TargetScope,
  Trigger,
} from '../../domain/enums';
import { ActionCancelledError } from '../../domain/errors/ActionCancelledError';
import type {
  AdvanceEvent,
  CampaignScoreSavedEvent,
  CardAction,
  CardActionEvent,
  CardDef,
  CardProducedEvent,
  ChooseStateEvent,
  ExpansionConfig,
  ExpansionSelectedEvent,
  GameEndedEvent,
  GameEvent,
  GameParameters,
  GameStartedEvent,
  GameState,
  ParchmentCardDiscoveredEvent,
  PurgeCardSelectedEvent,
  PurgeFinalizedEvent,
  PurgeOnTriggeredEvent,
  PurgePermanentSelectedEvent,
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
} from '../../domain/types';
import {
  canAffordCost,
  canAffordTrackAdvanceCost,
  cardIsBlocked,
  getActiveState,
  getEffectiveActionCost,
  getEffectiveGlory,
  getInstancesTriggerEffects,
} from '../cardHelpers';
import { cardSelector } from '../cardSelector';
import { DEFAULT_PARAMETERS } from '../emptyState';
import { GameEventContext } from '../gameEvent/GameEventContext';
import { canUseOptions, computeGameStateDiff } from '../gameStateHelper';
import { CardActionAggregate } from './CardActionAggregate';

export { EMPTY_STATE } from '../emptyState';

/** Events that revealed cards: a normal rewind cannot go back past them. */
export function eventDrewCards(event: GameEvent): boolean {
  if (event.type === GameEventType.TURN_STARTED || event.type === GameEventType.ADVANCE) {
    return true;
  }
  if (event.type !== GameEventType.CARD_ACTION) return false;
  const changes = (event as { gameStateChanges?: Partial<GameState> }).gameStateChanges;
  return !changes || Object.hasOwn(changes, 'drawPile');
}

export class GameAggregate {
  private events: GameEvent[];
  private gameState: GameState;
  private readonly gameEventContext: GameEventContext;
  private currentCardAction: CardActionAggregate | null = null;
  /** State before each event since the last one that drew cards: rewinds without a replay. */
  private undoStates: GameState[] = [];

  private readonly parameters: GameParameters = { ...DEFAULT_PARAMETERS };

  constructor(
    readonly id: string,
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
    const before = this.gameState;
    this.gameState = this.gameEventContext.apply(
      JSON.parse(JSON.stringify(before)) as GameState,
      event,
    );
    this.currentCardAction = null;
    if (eventDrewCards(event)) this.undoStates = [];
    else this.undoStates.push(before);
  }

  /**
   * Removes the last event, restoring the state kept before it. Returns false when no state was
   * kept (the event drew cards): the caller then replays the remaining events.
   */
  public undoLastEvent(): boolean {
    const previous = this.undoStates.pop();
    if (!previous) return false;
    this.gameState = previous;
    this.events = this.events.slice(0, -1);
    this.currentCardAction = null;
    return true;
  }

  public loadFromHistory(events: GameEvent[]): GameState {
    events.forEach(event => this.apply(event));
    this.events = events;
    return this.gameState;
  }

  public gameStarted(
    initialDeck: number[],
    deck: { id: number; cardId: number }[],
    stickerStock: Record<string, number>,
    discoveryPile: number[],
    firstDrawPile?: number[],
  ): GameState {
    const event: GameStartedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.GAME_STARTED,
      timestamp: Date.now(),
      initialDeck,
      deck,
      stickerStock,
      discoveryPile,
    };
    this.apply(event);
    this.events.push(event);
    this.roundStarted(firstDrawPile);
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

  private filterNonPermanentCardIds(cardIds: number[]): number[] {
    return cardIds.filter(cardId => {
      const instance = this.gameState.instances[cardId];
      if (!instance) return false;
      return getActiveState(instance, this.cardDefs)?.permanent !== true;
    });
  }

  private isPurgeEligible(instanceId: number, requirePermanent: boolean): boolean {
    const instance = this.gameState.instances[instanceId];
    if (!instance) return false;

    const state = getActiveState(instance, this.cardDefs);
    if (state.negative === true) return false;
    if (requirePermanent && state.permanent !== true) return false;
    if (!requirePermanent && state.permanent === true) return false;

    // Règle de campagne: une carte portant CANT_BE_DESTROYED est toujours inéligible.
    if (state.passives?.some(passive => passive.type === PassiveType.CANT_BE_DESTROYED)) {
      return false;
    }

    return true;
  }

  private isNegative(instanceId: number): boolean {
    const instance = this.gameState.instances[instanceId];
    return !!instance && getActiveState(instance, this.cardDefs).negative === true;
  }

  /** ON_PURGE_SELECTION triggers of the unselected cards; identical copies trigger once. */
  private getPurgeSelectionTriggers(selectedIds: number[]): TriggerEntry[] {
    const purgeState = this.gameState.purgeState;
    if (!purgeState) return [];
    const unselected = purgeState.shuffledPool
      .filter(id => !selectedIds.includes(id))
      .map(id => this.gameState.instances[id])
      .filter(Boolean);
    const seen = new Set<string>();
    return getInstancesTriggerEffects(
      unselected,
      this.cardDefs,
      this.stickerDefs,
      Trigger.ON_PURGE_SELECTION,
      this.gameState,
    ).filter(({ effectDef }) => {
      const key = JSON.stringify(effectDef.actionEffects);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /** Keeps only the focused cards while the focus is not reached and the batch has some. */
  private applyPurgeFocus(candidates: number[]): number[] {
    const focus = this.gameState.purgeState?.focus;
    if (!focus) return candidates;
    const producers = new Set(
      cardSelector(
        {
          scope: [TargetScope.DECK, TargetScope.DISCARD, TargetScope.BOARD],
          produces: [focus.resource],
        },
        -1,
        this.gameState,
        this.cardDefs,
        this.stickerDefs,
      ),
    );
    const selected = this.gameState.purgeState?.selectedCardIds ?? [];
    if (selected.filter(id => producers.has(id)).length >= focus.count) return candidates;
    const focused = candidates.filter(id => producers.has(id));
    return focused.length > 0 ? focused : candidates;
  }

  private getCurrentBatchStartAndCandidates(): { batchStart: number; candidates: number[] } | null {
    const purgeState = this.gameState.purgeState;
    if (!purgeState) return null;

    let batchStart = 0;
    while (batchStart + purgeState.batchSize <= purgeState.shuffledPool.length) {
      if (purgeState.completedBatchStarts.includes(batchStart)) {
        batchStart += purgeState.batchSize;
        continue;
      }

      const batch = purgeState.shuffledPool.slice(batchStart, batchStart + purgeState.batchSize);
      const candidates = batch.filter(
        id =>
          !purgeState.selectedCardIds.includes(id) &&
          !this.gameState.purgedCards.includes(id) &&
          !this.isNegative(id),
      );

      if (candidates.length > 0) {
        return { batchStart, candidates: this.applyPurgeFocus(candidates) };
      }

      batchStart += purgeState.batchSize;
    }

    return null;
  }

  public getPurgeCandidates(): number[] {
    return this.getCurrentBatchStartAndCandidates()?.candidates ?? [];
  }

  public getPurgePermanentCandidates(): number[] {
    const purgeState = this.gameState.purgeState;
    if (!purgeState) return [];

    return this.gameState.permanents.filter(
      id =>
        !purgeState.selectedPermanentIds.includes(id) &&
        this.isPurgeEligible(id, true) &&
        !this.gameState.purgedCards.includes(id),
    );
  }

  public canSelectPermanentForPurge(): boolean {
    const purgeState = this.gameState.purgeState;
    if (!purgeState) return false;
    return purgeState.selectedPermanentIds.length < purgeState.permanentToPurge;
  }

  public isPurgeSelectionComplete(): boolean {
    const purgeState = this.gameState.purgeState;
    if (!purgeState) return false;

    const noMoreBatches = this.getCurrentBatchStartAndCandidates() === null;
    const noMorePermanents =
      !this.canSelectPermanentForPurge() || this.getPurgePermanentCandidates().length === 0;

    return noMoreBatches && noMorePermanents;
  }

  public getSelectedPurgeIds(): number[] {
    const purgeState = this.gameState.purgeState;
    if (!purgeState) return [];
    return [...purgeState.selectedCardIds, ...purgeState.selectedPermanentIds];
  }

  public saveCampaignScore(openExpansionChoice = true): GameState {
    const segment = this.gameState.activeExpansion ?? 'base';
    const event: CampaignScoreSavedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.CAMPAIGN_SCORE_SAVED,
      timestamp: Date.now(),
      segment,
      score: this.getScore(),
      openExpansionChoice,
    };

    this.apply(event);
    this.events.push(event);

    return this.gameState;
  }

  public selectExpansion(expansionName: string, expansion: ExpansionConfig): GameState {
    const expansionMaxRound =
      expansion.expansionMaxRound && expansion.expansionMaxRound > 0
        ? expansion.expansionMaxRound
        : undefined;

    const purgePool = this.shuffle([
      ...this.gameState.drawPile,
      ...this.gameState.discardPile,
      ...this.gameState.board,
    ]);

    const event: ExpansionSelectedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.EXPANSION_SELECTED,
      timestamp: Date.now(),
      expansionName,
      expansionMaxRound,
      deckEntries: expansion.deck,
      purgeBatchSize: expansion.purge.purge,
      purgePermanentCount: expansion.purge.permanent,
      purgePool,
      parameterOverrides: expansion.parameters,
      onStartDiscoverIds: expansion.onStart?.discover?.ids ?? [],
      addedStickers: expansion.stickers,
      purgeFocus: expansion.purge.focus,
      expansionDiscoveryFirst: true,
    };

    this.apply(event);
    this.events.push(event);

    return this.gameState;
  }

  public selectPurgeCard(instanceId: number): GameState {
    const currentBatch = this.getCurrentBatchStartAndCandidates();
    if (!currentBatch?.candidates.includes(instanceId)) {
      return this.gameState;
    }

    const event: PurgeCardSelectedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.PURGE_CARD_SELECTED,
      timestamp: Date.now(),
      instanceId,
      batchStart: currentBatch.batchStart,
    };

    this.apply(event);
    this.events.push(event);
    return this.gameState;
  }

  public selectPurgePermanent(instanceId: number): GameState {
    if (!this.canSelectPermanentForPurge()) {
      return this.gameState;
    }

    const candidates = this.getPurgePermanentCandidates();
    if (!candidates.includes(instanceId)) {
      return this.gameState;
    }

    const event: PurgePermanentSelectedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.PURGE_PERMANENT_SELECTED,
      timestamp: Date.now(),
      instanceId,
    };

    this.apply(event);
    this.events.push(event);
    return this.gameState;
  }

  public finalizePurge(): GameState {
    const purgeState = this.gameState.purgeState;
    if (!purgeState || !this.isPurgeSelectionComplete()) {
      return this.gameState;
    }

    if (!purgeState.onPurgeTriggered) {
      const selectedIds = this.getSelectedPurgeIds();
      const triggers = [
        ...getInstancesTriggerEffects(
          selectedIds.map(id => this.gameState.instances[id]).filter(Boolean),
          this.cardDefs,
          this.stickerDefs,
          Trigger.ON_PURGE,
          this.gameState,
        ),
        ...this.getPurgeSelectionTriggers(selectedIds),
      ].reduce(
        (acc, { effectDef, sourceInstanceId }) => {
          acc[crypto.randomUUID()] = { effectDef, sourceInstanceId };
          return acc;
        },
        {} as Record<string, TriggerEntry>,
      );

      const triggeredEvent: PurgeOnTriggeredEvent = {
        id: crypto.randomUUID(),
        type: GameEventType.PURGE_ON_TRIGGERED,
        timestamp: Date.now(),
        triggers,
      };

      this.apply(triggeredEvent);
      this.events.push(triggeredEvent);

      if (Object.keys(triggers).length > 0) {
        return this.gameState;
      }
    }

    if (Object.keys(this.gameState.triggerPile).length > 0) {
      return this.gameState;
    }

    const purgedIds = this.getSelectedPurgeIds();
    const glory = purgedIds.reduce((total, id) => {
      const instance = this.gameState.instances[id];
      if (!instance) return total;
      const state = getActiveState(instance, this.cardDefs);
      return (
        total + getEffectiveGlory(state, this.gameState, this.cardDefs, instance, this.stickerDefs)
      );
    }, 0);

    const finalizedEvent: PurgeFinalizedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.PURGE_FINALIZED,
      timestamp: Date.now(),
      purgedIds,
      glory,
      onStartDiscoverIds: purgeState.onStartDiscoverIds,
    };

    this.apply(finalizedEvent);
    this.events.push(finalizedEvent);

    this.roundStarted();
    this.turnStarted();

    return this.gameState;
  }

  public roundEnded(): GameState {
    const allRoundInstances = [...this.gameState.permanents, ...this.gameState.board].map(
      id => this.gameState.instances[id],
    );
    const triggers = getInstancesTriggerEffects(
      allRoundInstances,
      this.cardDefs,
      this.stickerDefs,
      Trigger.END_OF_ROUND,
      this.gameState,
    ).reduce(
      (acc, { effectDef, sourceInstanceId }) => {
        acc[crypto.randomUUID()] = { effectDef, sourceInstanceId };
        return acc;
      },
      {} as Record<string, TriggerEntry>,
    );

    const event: RoundEndedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.ROUND_ENDED,
      timestamp: Date.now(),
      round: this.gameState.round,
      endRoundTriggers: triggers,
    };

    this.apply(event);
    this.events.push(event);

    const hasCards =
      this.gameState.drawPile.length > 0 ||
      this.gameState.discardPile.length > 0 ||
      this.gameState.board.length > 0 ||
      this.gameState.discoveryPile.length > 0;

    if (
      Object.keys(this.gameState.triggerPile).length === 0 &&
      this.gameState.phase === Phase.ROUND_END &&
      hasCards &&
      !this.gameState.isLastRound
    ) {
      return this.roundStarted();
    }

    return this.gameState;
  }

  public endGame(): GameState {
    const event: GameEndedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.GAME_ENDED,
      timestamp: Date.now(),
    };

    this.apply(event);
    this.events.push(event);
    return this.gameState;
  }

  /** `drawPile` replaces the shuffle (tutorial order); it is stored in the event like a shuffle. */
  public roundStarted(drawPile?: number[]): GameState {
    const round = this.gameState.round + 1;
    const cardNumberToDiscover = this.getParameters().discoverPerRound;
    const lastAddedCards: number[] = [];
    if (round > 1) {
      const discoveredCard = this.gameState.discoveryPile.slice(0, cardNumberToDiscover);

      for (const cardId of discoveredCard) {
        const cardInstance = this.gameState.instances[cardId];
        const cardDef = this.cardDefs[cardInstance.cardId];

        if (cardDef.parchmentCard) {
          const parchEvent: ParchmentCardDiscoveredEvent = {
            id: crypto.randomUUID(),
            type: GameEventType.PARCHMENT_CARD_DISCOVERED,
            timestamp: Date.now(),
            cardInstanceId: cardId,
          };
          this.apply(parchEvent);
          this.events.push(parchEvent);
          return this.gameState;
        }

        lastAddedCards.push(cardId);
      }
    }

    const event: RoundStartedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.ROUND_STARTED,
      timestamp: Date.now(),
      round,
      lastAddedCards,
      newDrawPile:
        drawPile ??
        this.shuffle([
          ...this.gameState.drawPile,
          ...this.gameState.discardPile,
          ...this.gameState.board,
          ...this.filterNonPermanentCardIds(lastAddedCards),
        ]),
    };
    this.apply(event);
    this.events.push(event);
    return this.gameState;
  }

  public turnStarted(): GameState {
    if (this.gameState.drawPile.length === 0) {
      return this.roundEnded();
    }

    const turn = this.gameState.turn + 1;
    const turnCards: number[] = this.gameState.drawPile.slice(
      0,
      this.getParameters().turnCardDrawn,
    );

    const event: TurnStartedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.TURN_STARTED,
      timestamp: Date.now(),
      turn,
      turnCards,
    };
    this.apply(event);
    this.events.push(event);
    return this.gameState;
  }

  public turnEnded(): GameState {
    const allRoundInstances = [...this.gameState.permanents, ...this.gameState.board].map(
      id => this.gameState.instances[id],
    );
    const triggers = getInstancesTriggerEffects(
      allRoundInstances,
      this.cardDefs,
      this.stickerDefs,
      Trigger.END_OF_TURN,
      this.gameState,
    ).reduce(
      (acc, { effectDef, sourceInstanceId }) => {
        acc[crypto.randomUUID()] = { effectDef, sourceInstanceId };
        return acc;
      },
      {} as Record<string, TriggerEntry>,
    );

    const event: TurnEndedEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.TURN_ENDED,
      timestamp: Date.now(),
      endTurnTrigger: triggers,
    };
    this.apply(event);
    this.events.push(event);

    if (
      Object.keys(this.gameState.triggerPile).length === 0 &&
      !this.hasAvailableUnlimitedAction()
    ) {
      if (this.gameState.drawPile.length === 0) {
        return this.roundEnded();
      } else {
        return this.turnStarted();
      }
    }

    return this.gameState;
  }

  private hasAvailableUnlimitedAction(): boolean {
    if (!canUseOptions(this.gameState, Options.ACTION)) {
      return false;
    }

    const playableIds = [...new Set([...this.gameState.board, ...this.gameState.permanents])];
    const stateForCostCheck: GameState = {
      ...this.gameState,
      board: [...new Set([...this.gameState.board, ...this.gameState.permanents])],
    };

    return playableIds.some(instanceId => {
      const instance = this.gameState.instances[instanceId];
      if (!instance || cardIsBlocked(instanceId, this.gameState)) {
        return false;
      }

      const state = getActiveState(instance, this.cardDefs);
      return (
        state.actions?.some(action => {
          if (!action.unlimited || action.trigger) return false;

          if (action.limitedTime !== undefined) {
            const usageCount = instance.usedActionIds.filter(id => id === action.id).length;
            if (usageCount >= action.limitedTime) return false;
          }

          const effectiveCost = getEffectiveActionCost(action.cost, instance);
          return (
            canAffordCost(
              effectiveCost,
              instanceId,
              stateForCostCheck,
              this.cardDefs,
              this.stickerDefs,
            ) &&
            canAffordTrackAdvanceCost(
              action,
              instance,
              stateForCostCheck,
              this.cardDefs,
              this.stickerDefs,
            )
          );
        }) ?? false
      );
    });
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

  public getParameters(): GameParameters {
    return Object.values(this.gameState.boardEffects)
      .flat()
      .filter(
        passive =>
          passive.type === PassiveType.SET_GAME_PARAMETER && passive.parameters !== undefined,
      )
      .reduce(
        (params, passive) => {
          return Object.assign(params, passive.parameters);
        },
        { ...this.parameters, ...this.gameState.parameterOverrides },
      );
  }

  public advance(): GameState {
    if (this.gameState.drawPile.length === 0 || !canUseOptions(this.gameState, Options.ADVANCE)) {
      return this.gameState;
    }

    const turnCards: number[] = this.gameState.drawPile.slice(
      0,
      this.getParameters().advanceCardDrawn,
    );

    const event: AdvanceEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.ADVANCE,
      timestamp: Date.now(),
      turnCards,
    };
    this.apply(event);
    this.events.push(event);
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

    const allRoundInstances = [...this.gameState.permanents, ...this.gameState.board].map(
      id => this.gameState.instances[id],
    );
    const triggers = getInstancesTriggerEffects(
      allRoundInstances.filter(instance => instance.id !== cardInstanceId),
      this.cardDefs,
      this.stickerDefs,
      Trigger.END_OF_TURN,
      this.gameState,
    ).reduce(
      (acc, { effectDef, sourceInstanceId }) => {
        acc[crypto.randomUUID()] = { effectDef, sourceInstanceId };
        return acc;
      },
      {} as Record<string, TriggerEntry>,
    );

    const event: UpgradeCardEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.UPGRADE_CARD,
      timestamp: Date.now(),
      cardInstanceId,
      stateId,
      cost,
      discardedCardIds,
      destroyedCardIds,
      endTurnTrigger: triggers,
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

    this.events.push(event);

    return this.gameState;
  }

  public cardAction(
    action: CardAction,
    instanceId: number,
    triggerId?: string,
    amount?: number,
  ): GameState {
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
      amount,
    );
    this.currentCardAction.resolveAction();

    if (this.currentCardAction.isCancelled()) {
      this.currentCardAction = null;
      throw new ActionCancelledError();
    }

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
    if (this.currentCardAction.isCancelled()) {
      this.currentCardAction = null;
      throw new ActionCancelledError();
    }

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
    if (this.currentCardAction.isCancelled()) {
      this.currentCardAction = null;
      throw new ActionCancelledError();
    }

    if (this.currentCardAction.getPendingChoices().length > 0) {
      return this.gameState;
    }

    return this.finalizeCurrentCardAction(this.currentCardAction);
  }

  private finalizeCurrentCardAction(currentCardAction: CardActionAggregate): GameState {
    const newGameState = currentCardAction.getGameState();
    const sourceInstanceId = currentCardAction.getSourceInstanceId();

    let triggers = {};
    // Only generate triggers if this is a normal action with endsTurn flag
    // (not a trigger effect that was already handled by CardActionAggregate)
    if (currentCardAction.isEndTurn() && !currentCardAction.getTriggerId()) {
      const allRoundInstances = [...newGameState.permanents, ...newGameState.board].map(
        id => newGameState.instances[id],
      );
      triggers = getInstancesTriggerEffects(
        allRoundInstances,
        this.cardDefs,
        this.stickerDefs,
        Trigger.END_OF_TURN,
        newGameState,
      ).reduce(
        (acc, { effectDef, sourceInstanceId }) => {
          acc[crypto.randomUUID()] = { effectDef, sourceInstanceId };
          return acc;
        },
        {} as Record<string, TriggerEntry>,
      );
    }

    const event: CardActionEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.CARD_ACTION,
      timestamp: Date.now(),
      gameStateChanges: computeGameStateDiff(this.gameState, newGameState),
      sourceInstanceId: currentCardAction.getSourceInstanceId(),
      actionId: currentCardAction.getActionId(),
      triggers,
      endTurn: currentCardAction.isEndTurn(),
      endRound: currentCardAction.isEndRound(),
    };

    this.apply(event);
    this.events.push(event);
    if (
      this.gameState.phase === Phase.PARCHMENT &&
      this.gameState.onGoingParchment === sourceInstanceId
    ) {
      const event: RoundStartedEvent = {
        id: crypto.randomUUID(),
        type: GameEventType.ROUND_STARTED,
        timestamp: Date.now(),
        round: this.gameState.round,
        lastAddedCards: this.gameState.lastAddedCards,
        newDrawPile: this.shuffle([
          ...this.gameState.drawPile,
          ...this.gameState.discardPile,
          ...this.gameState.board,
        ]),
      };
      this.apply(event);
      this.events.push(event);
    }

    return this.gameState;
  }

  public skipTrigger(triggerId: string): GameState {
    const entry = this.gameState.triggerPile[triggerId];
    if (!entry) {
      throw new Error(`Trigger with id ${triggerId} not found in trigger pile`);
    }
    const event: SkipTriggerEvent = {
      id: crypto.randomUUID(),
      type: GameEventType.SKIP_TRIGGER,
      timestamp: Date.now(),
      triggerId,
      sourceInstanceId: entry.sourceInstanceId,
      actionId: entry.effectDef.id,
      endTurn: entry.effectDef.trigger === Trigger.END_OF_TURN,
      endRound: entry.effectDef.trigger === Trigger.END_OF_ROUND,
    };
    this.apply(event);
    this.events.push(event);

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

  public cancelCurrentCardAction(): void {
    this.currentCardAction = null;
  }

  public getId(): string {
    return this.id;
  }

  public getScore(): number {
    const allIds = [
      ...this.gameState.drawPile,
      ...this.gameState.discardPile,
      ...this.gameState.board,
      ...this.gameState.permanents,
    ];
    const boardScore = allIds.reduce((total, id) => {
      const instance = this.gameState.instances[id];
      if (!instance) return total;
      const cs = getActiveState(instance, this.cardDefs);
      return (
        total + getEffectiveGlory(cs, this.gameState, this.cardDefs, instance, this.stickerDefs)
      );
    }, 0);

    const purgedScore = this.gameState.purgedGlory.reduce((sum, score) => sum + score, 0);

    return boardScore + purgedScore;
  }
}
