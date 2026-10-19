import { canAffordCost } from '../cards/canAffordCost';
import { canAffordTrackAdvanceCost } from '../cards/canAffordTrackAdvanceCost';
import { cardIsBlocked } from '../cards/cardIsBlocked';
import { getEffectiveActionCost } from '../cards/getEffectiveActionCost';
import { getInstancesTriggerEffects } from '../cards/getInstancesTriggerEffects';
import { cardSelector } from '../cards/selection/cardSelector';
import { getActiveState } from '../cards/selection/getActiveState';
import { getEffectiveGlory } from '../cards/selection/getEffectiveGlory';
import { isPermanent } from '../cards/selection/isPermanent';
import {
  GameEventType,
  Options,
  PassiveType,
  type PendingChoiceType,
  Phase,
  TargetScope,
  Trigger,
} from '../enums';
import { environment } from '../environment/environment';
import { ActionCancelledError } from '../errors/ActionCancelledError';
import { GameEventContext } from '../gameEvent/GameEventContext';
import { shuffle } from '../random';
import { canUseOptions } from '../state/canUseOptions';
import { computeGameStateDiff } from '../state/computeGameStateDiff';
import { DEFAULT_PARAMETERS } from '../state/defaultParameters';
import { isLastRound } from '../state/isLastRound';
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
  StoryAdvancedEvent,
  TriggerEntry,
  TurnEndedEvent,
  TurnStartedEvent,
  UpgradeCardEvent,
} from '../types';
import { CardActionAggregate } from './CardActionAggregate';
import { eventDrewCards } from './eventDrewCards';

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

  /** Replays events after the ones already in the log. */
  public loadFromHistory(events: GameEvent[]): GameState {
    events.forEach(event => this.apply(event));
    this.events = [...this.events, ...events];
    return this.gameState;
  }

  public gameStarted(
    initialDeck: number[],
    deck: { id: number; cardId: number }[],
    stickerStock: Record<string, number>,
    discoveryPile: number[],
    discoverablePile: number[],
    firstDrawPile?: number[],
    seed?: string,
  ): GameState {
    const event: GameStartedEvent = {
      id: environment.newId(),
      type: GameEventType.GAME_STARTED,
      timestamp: environment.now(),
      initialDeck,
      deck,
      stickerStock,
      discoveryPile,
      discoverablePile,
      ...(seed === undefined ? {} : { seed }),
    };
    this.apply(event);
    this.events.push(event);
    this.roundStarted(firstDrawPile);
    this.turnStarted();
    return this.gameState;
  }

  /** Seeded by the game and the position in the log: a rewound shuffle comes out the same. */
  private shuffle(arr: number[]): number[] {
    return shuffle(arr, this.gameState.seed, String(this.events.length));
  }

  private filterNonPermanentCardIds(cardIds: number[]): number[] {
    return cardIds.filter(cardId => {
      const instance = this.gameState.instances[cardId];
      if (!instance) return false;
      return !isPermanent(getActiveState(instance, this.cardDefs));
    });
  }

  private isPurgeEligible(instanceId: number, requirePermanent: boolean): boolean {
    const instance = this.gameState.instances[instanceId];
    if (!instance) return false;

    const state = getActiveState(instance, this.cardDefs);
    if (state.negative === true) return false;
    if (requirePermanent !== isPermanent(state)) return false;

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

  private getCurrentBatchStartAndCandidates(): {
    batchStart: number;
    batch: number[];
    candidates: number[];
  } | null {
    const purgeState = this.gameState.purgeState;
    if (!purgeState) return null;

    let batchStart = 0;
    while (batchStart + purgeState.batchSize <= purgeState.shuffledPool.length) {
      if (purgeState.completedBatchStarts.includes(batchStart)) {
        batchStart += purgeState.batchSize;
        continue;
      }

      const batch = purgeState.shuffledPool
        .slice(batchStart, batchStart + purgeState.batchSize)
        .filter(
          id =>
            !purgeState.selectedCardIds.includes(id) && !this.gameState.purgedCards.includes(id),
        );
      const candidates = batch.filter(id => !this.isNegative(id));

      if (candidates.length > 0) {
        return { batchStart, batch, candidates: this.applyPurgeFocus(candidates) };
      }

      batchStart += purgeState.batchSize;
    }

    return null;
  }

  public getPurgeCandidates(): number[] {
    return this.getCurrentBatchStartAndCandidates()?.candidates ?? [];
  }

  /** Unselected cards of the current batch, including those the player cannot pick. */
  public getPurgeBatch(): number[] {
    return this.getCurrentBatchStartAndCandidates()?.batch ?? [];
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
      id: environment.newId(),
      type: GameEventType.CAMPAIGN_SCORE_SAVED,
      timestamp: environment.now(),
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
      id: environment.newId(),
      type: GameEventType.EXPANSION_SELECTED,
      timestamp: environment.now(),
      expansionName,
      expansionMaxRound,
      deckEntries: [...expansion.campaign, ...(expansion.discoverable ?? [])],
      discoverableIds: expansion.discoverable?.map(entry => entry.id) ?? [],
      expansion: expansion.expansion,
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
      id: environment.newId(),
      type: GameEventType.PURGE_CARD_SELECTED,
      timestamp: environment.now(),
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
      id: environment.newId(),
      type: GameEventType.PURGE_PERMANENT_SELECTED,
      timestamp: environment.now(),
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
          acc[environment.newId()] = { effectDef, sourceInstanceId };
          return acc;
        },
        {} as Record<string, TriggerEntry>,
      );

      const triggeredEvent: PurgeOnTriggeredEvent = {
        id: environment.newId(),
        type: GameEventType.PURGE_ON_TRIGGERED,
        timestamp: environment.now(),
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
      id: environment.newId(),
      type: GameEventType.PURGE_FINALIZED,
      timestamp: environment.now(),
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
        acc[environment.newId()] = { effectDef, sourceInstanceId };
        return acc;
      },
      {} as Record<string, TriggerEntry>,
    );

    const event: RoundEndedEvent = {
      id: environment.newId(),
      type: GameEventType.ROUND_ENDED,
      timestamp: environment.now(),
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
      !this.isLastRound()
    ) {
      return this.roundStarted();
    }

    return this.gameState;
  }

  public endGame(): GameState {
    const event: GameEndedEvent = {
      id: environment.newId(),
      type: GameEventType.GAME_ENDED,
      timestamp: environment.now(),
    };

    this.apply(event);
    this.events.push(event);
    return this.gameState;
  }

  /** `drawPile` replaces the shuffle (tutorial order); it is stored in the event like a shuffle. */
  public roundStarted(drawPile?: number[]): GameState {
    const round = this.gameState.round + 1;
    const cardNumberToDiscover = round > 1 ? this.getParameters().discoverPerRound : 0;
    // A game started with a single discovery pile keeps the former rules (EDR-045).
    const twoPacks = this.gameState.discoverablePile !== undefined;
    if (twoPacks && this.gameState.discoveryPile.length < cardNumberToDiscover) {
      // Not enough cards left to discover in the campaign pile: the campaign ends.
      return this.endGame();
    }
    const lastAddedCards: number[] = [];
    const discoveredCard = this.gameState.discoveryPile.slice(0, cardNumberToDiscover);

    for (const cardId of discoveredCard) {
      const cardInstance = this.gameState.instances[cardId];
      const cardDef = this.cardDefs[cardInstance.cardId];

      if (cardDef.parchmentCard) {
        const parchEvent: ParchmentCardDiscoveredEvent = {
          id: environment.newId(),
          type: GameEventType.PARCHMENT_CARD_DISCOVERED,
          timestamp: environment.now(),
          cardInstanceId: cardId,
        };
        this.apply(parchEvent);
        this.events.push(parchEvent);
        return this.gameState;
      }

      lastAddedCards.push(cardId);
    }

    const event: RoundStartedEvent = {
      id: environment.newId(),
      type: GameEventType.ROUND_STARTED,
      timestamp: environment.now(),
      round,
      // With two packs, the discovery is its own event (STORY_ADVANCED) below.
      lastAddedCards: twoPacks ? [] : lastAddedCards,
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

    if (twoPacks && lastAddedCards.length > 0) {
      const storyEvent: StoryAdvancedEvent = {
        id: environment.newId(),
        type: GameEventType.STORY_ADVANCED,
        timestamp: environment.now(),
        discoveredIds: lastAddedCards,
      };
      this.apply(storyEvent);
      this.events.push(storyEvent);
    }
    return this.gameState;
  }

  public turnStarted(): GameState {
    if (this.gameState.drawPile.length === 0) {
      return this.roundEnded();
    }

    const turn = this.gameState.turn + 1;
    // "Starts in play" cards begin the round in play: they join the first draw of the round.
    const startingCards =
      turn === 1 ? this.gameState.drawPile.filter(id => this.startsInPlay(id)) : [];
    const turnCards: number[] = [
      ...startingCards,
      ...this.gameState.drawPile
        .filter(id => !startingCards.includes(id))
        .slice(0, this.getParameters().turnCardDrawn),
    ];

    const event: TurnStartedEvent = {
      id: environment.newId(),
      type: GameEventType.TURN_STARTED,
      timestamp: environment.now(),
      turn,
      turnCards,
    };
    this.apply(event);
    this.events.push(event);
    return this.gameState;
  }

  private startsInPlay(instanceId: number): boolean {
    const instance = this.gameState.instances[instanceId];
    return (instance?.stickers[instance.stateId] ?? []).some(
      stickerId => this.stickerDefs[stickerId]?.effectId === 'starts_in_play',
    );
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
        acc[environment.newId()] = { effectDef, sourceInstanceId };
        return acc;
      },
      {} as Record<string, TriggerEntry>,
    );

    const event: TurnEndedEvent = {
      id: environment.newId(),
      type: GameEventType.TURN_ENDED,
      timestamp: environment.now(),
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
      id: environment.newId(),
      type: GameEventType.CARD_PRODUCED,
      timestamp: environment.now(),
      cardInstanceId,
      productions,
    };
    this.apply(event);
    this.events.push(event);
    return this.gameState;
  }

  public isLastRound(): boolean {
    return isLastRound(this.gameState, this.getParameters());
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
      id: environment.newId(),
      type: GameEventType.ADVANCE,
      timestamp: environment.now(),
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
    if (!canUseOptions(this.gameState, Options.UPGRADE, cardInstanceId)) {
      return this.gameState;
    }

    const allRoundInstances = [...this.gameState.permanents, ...this.gameState.board].map(
      id => this.gameState.instances[id],
    );
    // Cards paid for the upgrade leave play before the turn ends: their triggers do not fire.
    const leavingIds = new Set([cardInstanceId, ...discardedCardIds, ...destroyedCardIds]);
    const triggers = getInstancesTriggerEffects(
      allRoundInstances.filter(instance => !leavingIds.has(instance.id)),
      this.cardDefs,
      this.stickerDefs,
      Trigger.END_OF_TURN,
      this.gameState,
    ).reduce(
      (acc, { effectDef, sourceInstanceId }) => {
        acc[environment.newId()] = { effectDef, sourceInstanceId };
        return acc;
      },
      {} as Record<string, TriggerEntry>,
    );

    const event: UpgradeCardEvent = {
      id: environment.newId(),
      type: GameEventType.UPGRADE_CARD,
      timestamp: environment.now(),
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
      id: environment.newId(),
      type: GameEventType.CHOOSE_STATE,
      timestamp: environment.now(),
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
      !canUseOptions(
        this.gameState,
        action.endsTurn ? Options.END_TURN_ACTION : Options.ACTION,
        instanceId,
      )
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
          acc[environment.newId()] = { effectDef, sourceInstanceId };
          return acc;
        },
        {} as Record<string, TriggerEntry>,
      );
    }

    const event: CardActionEvent = {
      id: environment.newId(),
      type: GameEventType.CARD_ACTION,
      timestamp: environment.now(),
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
        id: environment.newId(),
        type: GameEventType.ROUND_STARTED,
        timestamp: environment.now(),
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
      id: environment.newId(),
      type: GameEventType.SKIP_TRIGGER,
      timestamp: environment.now(),
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
