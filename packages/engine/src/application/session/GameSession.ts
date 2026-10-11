import { ActionEffectType, GameEventType, PendingChoiceType, Phase } from '../../domain/enums';
import { ActionCancelledError } from '../../domain/errors/ActionCancelledError';
import { CostResolutionError } from '../../domain/errors/CostResolutionError';
import type {
  CardAction,
  CardDef,
  CheatCommand,
  CommandError,
  GameCatalog,
  GameCommand,
  GameEvent,
  GameState,
  GameView,
  PendingChoice,
  ResolvedActionEffect,
  ResolvedCost,
} from '../../domain/types';
import { GameAggregate } from '../aggregates/GameAggregate';
import { type CampaignSegment, getCampaignSegments } from '../campaignSegments';
import {
  cardIsBlocked,
  getActiveState,
  getEffectiveUpgradeCost,
  getProductionChoicesForAction,
} from '../cardHelpers';
import { resolveCost } from '../costResolver';
import { EMPTY_STATE } from '../emptyState';
import { createInstance } from '../factory';
import { mergeResources } from '../gameStateHelper';

export type GameSessionOptions = {
  /** Development only: rewind any event, even ones that revealed cards. */
  unrestrictedRewind: boolean;
  /** Development only: accept `cheat` commands. */
  allowCheats: boolean;
};

type PendingUpgrade = {
  instanceId: number;
  upgradeTo: number;
  resolvedCost: ResolvedCost;
};

/** Thrown when the session cannot be rebuilt from its persisted events. */
export class CorruptedGameError extends Error {}

/** Thrown for commands that are not allowed in the current context. */
export class ForbiddenCommandError extends Error {}

const CHOICE_TYPES = new Set<string>(Object.values(PendingChoiceType));

function parseChoiceType(value: string): PendingChoiceType {
  if (!CHOICE_TYPES.has(value)) {
    throw new ActionCancelledError();
  }
  return value as PendingChoiceType;
}

function cloneState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state)) as GameState;
}

function cheatAction(id: string, effect: CardAction['actionEffects'][number]): CardAction {
  return { id, unlimited: true, actionEffects: [effect] };
}

/**
 * A game being played: owns the `GameAggregate` and turns player commands into events.
 *
 * It holds the command flow (guards, multi-step cost payment, parchment cards, automatic
 * campaign score on game over, rewind, development cheats). The client runs it for play,
 * including offline; the server rebuilds it from synced events to validate games and
 * compute scores. Mid-action state (pending choices) lives only in memory: it is never part
 * of the event log.
 */
export class GameSession {
  private agg: GameAggregate;
  private pendingUpgrade: PendingUpgrade | null = null;
  private pendingChoices: PendingChoice[] | null = null;
  private cardNames: Record<string, string>;
  private version: number;

  private constructor(
    readonly id: string,
    readonly tutorial: boolean,
    private readonly catalog: GameCatalog,
    private readonly options: GameSessionOptions,
    cardNames: Record<string, string>,
    version: number,
  ) {
    this.agg = this.makeAggregate();
    this.cardNames = { ...cardNames };
    this.version = version;
  }

  // ─── Factories ────────────────────────────────────────────────────────────

  /**
   * `firstDrawPile` replaces the first shuffle (the tutorial's scripted round): it must hold
   * exactly the starting deck. It is stored in the events, so the game replays like any other.
   */
  static start(
    id: string,
    catalog: GameCatalog,
    options: GameSessionOptions,
    mode: 'standard' | 'tutorial' = 'standard',
    firstDrawPile?: number[],
  ): GameSession {
    const session = new GameSession(id, mode === 'tutorial', catalog, options, {}, 0);
    session.startNewGame(firstDrawPile);
    session.finalize();
    return session;
  }

  static restore(
    id: string,
    events: GameEvent[],
    catalog: GameCatalog,
    options: GameSessionOptions,
    cardNames: Record<string, string> = {},
    version = 0,
  ): GameSession {
    const session = new GameSession(id, false, catalog, options, cardNames, version);
    try {
      session.agg.loadFromHistory([...events]);
    } catch (error) {
      throw new CorruptedGameError(error instanceof Error ? error.message : String(error));
    }
    session.pendingChoices = null;
    return session;
  }

  // ─── Read model ───────────────────────────────────────────────────────────

  getEvents(): GameEvent[] {
    return this.agg.getEvents();
  }

  getState(): GameState {
    return this.agg.getGameState();
  }

  getCardNames(): Record<string, string> {
    return { ...this.cardNames };
  }

  getVersion(): number {
    return this.version;
  }

  getScore(): number {
    return this.agg.getScore();
  }

  /** Campaign segment scores in the order they were played. */
  getCampaignSegments(): CampaignSegment[] {
    return getCampaignSegments(this.agg.getEvents());
  }

  toView(): GameView {
    const gameState = this.agg.getGameState();
    return {
      id: this.id,
      version: this.version,
      tutorial: this.tutorial,
      gameState,
      pendingChoices: this.pendingChoices,
      score: this.agg.getScore(),
      parameters: this.agg.getParameters(),
      eventCount: this.agg.getEvents().length,
      canRewind: this.canRewind(),
      cardNames: this.getCardNames(),
      purge: {
        candidates: this.agg.getPurgeCandidates(),
        permanentCandidates: this.agg.getPurgePermanentCandidates(),
        selectedIds: this.agg.getSelectedPurgeIds(),
        canSelectPermanent: this.agg.canSelectPermanentForPurge(),
        isSelectionComplete: this.agg.isPurgeSelectionComplete(),
      },
    };
  }

  // ─── Command dispatch ─────────────────────────────────────────────────────

  /**
   * Executes a command. Engine rule errors (cancelled action, unpayable cost…) cancel the
   * pending action and are returned so the client can display them; the version is bumped
   * in every case because the in-memory state may have changed.
   */
  execute(command: GameCommand): CommandError | undefined {
    if (command.type === 'cheat' && !this.options.allowCheats) {
      throw new ForbiddenCommandError('Cheat commands are disabled');
    }
    try {
      this.dispatch(command);
      return undefined;
    } catch (error) {
      if (error instanceof ForbiddenCommandError) throw error;
      return this.handleActionError(error);
    } finally {
      this.version += 1;
    }
  }

  private dispatch(command: GameCommand): void {
    switch (command.type) {
      case 'startRound':
        return this.sync(this.agg.roundStarted());
      case 'endRound':
        return this.endRound();
      case 'startTurn':
        return this.sync(this.agg.turnStarted());
      case 'progress':
        return this.sync(this.agg.advance());
      case 'endTurn':
        return this.sync(this.agg.turnEnded());
      case 'chooseState':
        return this.chooseState(command.instanceId, command.stateId);
      case 'resolveProduction':
        return this.resolveProduction(command.instanceId, command.choiceIndex);
      case 'resolveAction':
        return this.resolveAction(command.instanceId, command.actionId, command.triggerId);
      case 'resolveUpgrade':
        return this.resolveUpgrade(command.instanceId, command.upgradeTo);
      case 'resolvePlayerChoice':
        return this.resolvePlayerChoice(command.choice, parseChoiceType(command.choiceType));
      case 'resolvePayCost':
        return this.resolvePayCost(command.resolved);
      case 'skipTrigger':
        return this.sync(this.agg.skipTrigger(command.triggerId));
      case 'skipChoice':
        return this.cancelPendingAction();
      case 'dismissParchment':
        return this.dismissParchment();
      case 'rewind':
        return this.rewind();
      case 'continueCampaign':
        return this.continueCampaign();
      case 'selectExpansion':
        return this.selectExpansion(command.name);
      case 'selectPurgeCard':
        return this.sync(this.agg.selectPurgeCard(command.instanceId));
      case 'selectPurgePermanent':
        return this.sync(this.agg.selectPurgePermanent(command.instanceId));
      case 'finalizePurge':
        return this.sync(this.agg.finalizePurge());
      case 'setCardName':
        return this.setCardName(command.instanceId, command.name);
      case 'cheat':
        return this.cheat(command.cheat);
    }
  }

  // ─── Game start ───────────────────────────────────────────────────────────

  private makeAggregate(): GameAggregate {
    return new GameAggregate(
      this.id,
      cloneState(EMPTY_STATE),
      this.catalog.cards,
      this.catalog.stickers,
    );
  }

  private startNewGame(firstDrawPile?: number[]): GameState {
    const deckEntries = [...this.catalog.deck].sort((a, b) => a.id - b.id);
    const starterEntries = deckEntries.slice(0, 10);
    const discoveryEntries = deckEntries.filter(e => e.id > 10);
    const allInstances = [...starterEntries, ...discoveryEntries].map(entry =>
      createInstance(
        entry.id,
        entry.cardId,
        this.catalog.cards[entry.cardId].states[0].id,
        this.catalog.cards,
      ),
    );
    const initialDeck = starterEntries.map((_, i) => allInstances[i].id);
    const discoveryPile = discoveryEntries.map(
      (_, i) => allInstances[starterEntries.length + i].id,
    );

    if (
      firstDrawPile &&
      (firstDrawPile.length !== initialDeck.length ||
        [...firstDrawPile].sort((a, b) => a - b).some((id, i) => id !== initialDeck[i]))
    ) {
      throw new Error('The first draw pile must hold exactly the starting deck');
    }

    return this.agg.gameStarted(
      initialDeck,
      deckEntries,
      { ...this.catalog.stickerStock },
      discoveryPile,
      firstDrawPile,
    );
  }

  // ─── Sync helpers ─────────────────────────────────────────────────────────

  /** Returns true when the current card action still waits for player input. */
  private syncAggregatePending(): boolean {
    const choices = this.agg.getCurrentCardAction()?.getPendingChoices() ?? [];
    this.pendingChoices = choices.length > 0 ? choices : null;
    return choices.length > 0;
  }

  /** Accepts the state returned by an aggregate command, then runs the post-command steps. */
  private sync(_newState: GameState): void {
    this.finalize();
  }

  /** Post-command bookkeeping: automatic campaign score at game over, pending choices. */
  private finalize(): void {
    const state = this.agg.getGameState();
    if (state.phase === Phase.GAME_OVER) {
      const segment = state.activeExpansion ?? 'base';
      if (!Object.prototype.hasOwnProperty.call(state.campaignScores, segment)) {
        this.agg.saveCampaignScore(false);
      }
    }
    if (this.parchmentCardDef(this.agg.getGameState())) {
      return;
    }
    const choices = this.agg.getCurrentCardAction()?.getPendingChoices();
    this.pendingChoices = choices && choices.length > 0 ? choices : null;
  }

  private parchmentCardDef(state: GameState): CardDef | null {
    if (state.phase !== Phase.PARCHMENT || !state.onGoingParchment) return null;
    const inst = state.instances[state.onGoingParchment];
    return this.catalog.cards[inst.cardId];
  }

  private cancelPendingAction(): void {
    this.agg.cancelCurrentCardAction();
    this.pendingUpgrade = null;
    this.pendingChoices = null;
  }

  private handleActionError(error: unknown): CommandError {
    this.cancelPendingAction();
    if (error instanceof ActionCancelledError) {
      return { code: 'ACTION_CANCELLED', message: error.message };
    }
    if (error instanceof CostResolutionError) {
      return { code: 'COST_RESOLUTION', message: error.message };
    }
    const message = error instanceof Error ? error.message : 'errors.unknown';
    return { code: 'ENGINE_ERROR', message };
  }

  private isPlayable(instanceId: number): boolean {
    const gs = this.agg.getGameState();
    return Boolean(gs.instances[instanceId]) && !cardIsBlocked(instanceId, gs);
  }

  // ─── Commands ─────────────────────────────────────────────────────────────

  private endRound(): void {
    const gs = this.agg.getGameState();
    if (gs.phase === Phase.ROUND_END && gs.isLastRound) {
      this.sync(this.agg.endGame());
      return;
    }
    this.sync(this.agg.roundEnded());
  }

  private continueCampaign(): void {
    const gs = this.agg.getGameState();
    if (gs.phase !== Phase.GAME_OVER) return;
    const available = Object.keys(this.catalog.expansions).filter(
      name => !Object.prototype.hasOwnProperty.call(gs.campaignScores, name),
    );
    this.sync(this.agg.saveCampaignScore(available.length > 0));
  }

  private selectExpansion(name: string): void {
    const expansion = this.catalog.expansions[name];
    if (!expansion) return;
    this.sync(this.agg.selectExpansion(name, expansion));
  }

  private chooseState(instanceId: number, stateId: number): void {
    if (!this.isPlayable(instanceId)) return;
    this.sync(this.agg.chooseState(instanceId, stateId));
  }

  private resolveProduction(instanceId: number, choiceIndex: number): void {
    if (!this.isPlayable(instanceId)) return;
    const gs = this.agg.getGameState();
    const inst = gs.instances[instanceId];
    const { cards, stickers } = this.catalog;
    const baseProductions = cards[inst.cardId].states.find(s => s.id === inst.stateId)
      ?.productions ?? [{}];
    const productionChoices = baseProductions.flatMap(base =>
      getProductionChoicesForAction(base, gs, cards, inst, stickers),
    );
    const resourcesGained = (productionChoices[choiceIndex] ?? {}) as Record<string, number>;
    this.sync(this.agg.cardProduced(instanceId, resourcesGained));
  }

  private resolveAction(instanceId: number, actionId: string, triggerId?: string): void {
    if (!this.isPlayable(instanceId)) return;
    const gs = this.agg.getGameState();
    const cs = getActiveState(gs.instances[instanceId], this.catalog.cards);
    const triggerEntry = triggerId ? gs.triggerPile[triggerId] : undefined;
    const isMatchingTrigger =
      triggerEntry?.sourceInstanceId === instanceId && triggerEntry?.effectDef.id === actionId;
    const action =
      (isMatchingTrigger ? triggerEntry?.effectDef : undefined) ??
      cs.actions?.find(ce => ce.id === actionId);
    if (!action) return;

    const newState = this.agg.cardAction(action, instanceId, triggerId);
    if (this.syncAggregatePending()) return;
    this.sync(newState);
  }

  private resolveUpgrade(instanceId: number, upgradeTo: number): void {
    if (!this.isPlayable(instanceId)) return;
    const gs = this.agg.getGameState();
    const cs = getActiveState(gs.instances[instanceId], this.catalog.cards);
    const upgrade = (cs.upgrade ?? []).find(u => u.upgradeTo === upgradeTo);
    if (!upgrade) return;

    const effectiveCost = getEffectiveUpgradeCost(
      upgrade.cost,
      gs,
      this.catalog.cards,
      this.catalog.stickers,
      instanceId,
    );
    const [resolvedCost, costPendingChoices] = resolveCost(
      effectiveCost,
      instanceId,
      gs,
      this.catalog.cards,
      this.catalog.stickers,
      true,
    );

    if (costPendingChoices.length > 0) {
      this.pendingUpgrade = { instanceId, upgradeTo: upgrade.upgradeTo, resolvedCost };
      this.pendingChoices = costPendingChoices;
      return;
    }

    this.sync(
      this.agg.upgradeCard(
        instanceId,
        upgrade.upgradeTo,
        resolvedCost.resources,
        resolvedCost.discardedCardIds,
        resolvedCost.destroyedCardIds,
      ),
    );
  }

  private resolvePlayerChoice(choice: ResolvedActionEffect, choiceType: PendingChoiceType): void {
    const newState = this.agg.resolveCardActionChoice(choice, choiceType);
    if (this.syncAggregatePending()) return;
    this.sync(newState);
  }

  /** Called when the player made a choice needed to pay an action or upgrade cost. */
  private resolvePayCost(resolved: ResolvedCost): void {
    if (this.pendingUpgrade) {
      const pending = this.pendingUpgrade;
      const merged: ResolvedCost = {
        resources: mergeResources(pending.resolvedCost.resources, resolved.resources),
        discardedCardIds: [...pending.resolvedCost.discardedCardIds, ...resolved.discardedCardIds],
        destroyedCardIds: [...pending.resolvedCost.destroyedCardIds, ...resolved.destroyedCardIds],
      };

      const remainingChoices = (this.pendingChoices ?? []).slice(1);
      if (remainingChoices.length > 0) {
        this.pendingUpgrade = { ...pending, resolvedCost: merged };
        this.pendingChoices = remainingChoices;
        return;
      }

      const newState = this.agg.upgradeCard(
        pending.instanceId,
        pending.upgradeTo,
        merged.resources,
        merged.discardedCardIds,
        merged.destroyedCardIds,
      );
      this.pendingUpgrade = null;
      this.pendingChoices = null;
      this.sync(newState);
      return;
    }

    const newState = this.agg.resolveCardActionCost(resolved);
    if (this.syncAggregatePending()) return;
    this.sync(newState);
  }

  private dismissParchment(): void {
    const gs = this.agg.getGameState();
    const parchment = this.parchmentCardDef(gs);
    const action = parchment?.states[0].actions?.[0];
    if (!gs.onGoingParchment || !action) return;

    const newState = this.agg.cardAction(action, gs.onGoingParchment);
    if (this.syncAggregatePending()) return;
    this.sync(newState);
  }

  private setCardName(instanceId: number, name: string): void {
    const key = String(instanceId);
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      const { [key]: _removed, ...others } = this.cardNames;
      this.cardNames = others;
      return;
    }
    this.cardNames[key] = trimmed;
  }

  // ─── Rewind ───────────────────────────────────────────────────────────────

  private static lastEventDrewCards(event: GameEvent): boolean {
    if (event.type === GameEventType.TURN_STARTED || event.type === GameEventType.ADVANCE) {
      return true;
    }
    if (event.type !== GameEventType.CARD_ACTION) return false;
    const changes = (event as { gameStateChanges?: Partial<GameState> }).gameStateChanges;
    return !changes || Object.prototype.hasOwnProperty.call(changes, 'drawPile');
  }

  canRewind(): boolean {
    if (this.tutorial) return false;
    const events = this.agg.getEvents();
    if (events.length === 0) return false;
    if (this.options.unrestrictedRewind) return true;
    return !GameSession.lastEventDrewCards(events[events.length - 1]);
  }

  private rewind(): void {
    if (!this.canRewind()) return;
    const events = this.agg.getEvents();
    const agg = this.makeAggregate();
    agg.loadFromHistory(events.slice(0, -1));
    this.agg = agg;
    this.pendingUpgrade = null;
    this.pendingChoices = null;
    this.finalize();
  }

  // ─── Development cheats ───────────────────────────────────────────────────

  private cheat(command: CheatCommand): void {
    switch (command.op) {
      case 'addResources':
        return this.sync(this.agg.cardProduced(1, command.resources));
      case 'chooseState':
        return this.sync(this.agg.chooseState(command.instanceId, command.stateId));
      case 'addSticker':
        return this.runCheatAction(
          cheatAction('cheat_add_sticker', {
            id: 1,
            type: ActionEffectType.ADD_STICKER,
            cards: { ids: [command.instanceId] },
            stickers: { ids: [command.stickerId] },
          }),
        );
      case 'drawCard':
      case 'discardCard':
      case 'destroyCard':
      case 'discoverCard': {
        const types = {
          drawCard: ActionEffectType.PLAY_CARD,
          discardCard: ActionEffectType.DISCARD_CARD,
          destroyCard: ActionEffectType.DESTROY_CARD,
          discoverCard: ActionEffectType.DISCOVER_CARD,
        } as const;
        return this.runCheatAction(
          cheatAction(`cheat_${command.op}`, {
            id: 1,
            type: types[command.op],
            cards: { ids: command.instanceIds, pickNumber: command.instanceIds.length },
          }),
        );
      }
    }
  }

  private runCheatAction(action: CardAction): void {
    const newState = this.agg.cardAction(action, 1);
    if (this.syncAggregatePending()) return;
    this.sync(newState);
  }
}
