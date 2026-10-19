import { GameAggregate } from '../../domain/aggregates/GameAggregate';
import { eventDrewCards } from '../../domain/aggregates/eventDrewCards';
import { type CampaignSegment, getCampaignSegments } from '../../domain/campaignSegments';
import { cardIsBlocked } from '../../domain/cards/cardIsBlocked';
import { getEffectiveUpgradeCost } from '../../domain/cards/getEffectiveUpgradeCost';
import { getProductionChoicesForAction } from '../../domain/cards/getProductionChoicesForAction';
import { getActiveState } from '../../domain/cards/selection/getActiveState';
import { getStateActions } from '../../domain/cards/selection/getStateActions';
import { resolveCost } from '../../domain/costResolver';
import { ActionEffectType, GameEventType, PendingChoiceType, Phase } from '../../domain/enums';
import type { EngineEnvironment } from '../../domain/environment/EngineEnvironment';
import { environment } from '../../domain/environment/environment';
import { ActionCancelledError } from '../../domain/errors/ActionCancelledError';
import { CorruptedGameError } from '../../domain/errors/CorruptedGameError';
import { CostResolutionError } from '../../domain/errors/CostResolutionError';
import { ForbiddenCommandError } from '../../domain/errors/ForbiddenCommandError';
import { UnverifiedGameError } from '../../domain/errors/UnverifiedGameError';
import { mergeResources } from '../../domain/resources/mergeResources';
import { EMPTY_STATE } from '../../domain/state/emptyState';
import { nextRecordedEvent } from '../../domain/state/nextRecordedEvent';
import type {
  CardAction,
  CardDef,
  CheatCommand,
  CommandError,
  GameCatalog,
  GameCheckpoint,
  GameCommand,
  GameEvent,
  GameStartedEvent,
  GameState,
  GameView,
  PendingChoice,
  ResolvedActionEffect,
  ResolvedCost,
} from '../../domain/types';
import { isFlowCommandAllowed } from './input/isFlowCommandAllowed';
import { isInPlay } from './input/isInPlay';
import { sanitizeChoice } from './input/sanitizeChoice';
import { sanitizeCost } from './input/sanitizeCost';
import { systemEnvironment } from './systemEnvironment';

export type GameSessionOptions = {
  /** Development only: rewind any event, even ones that revealed cards. */
  unrestrictedRewind: boolean;
  /** Development only: accept `cheat` commands. */
  allowCheats: boolean;
  /** Clock, ids and randomness of the rules (EDR-058); the system ones by default. */
  environment?: EngineEnvironment;
};

type PendingUpgrade = {
  instanceId: number;
  upgradeTo: number;
  resolvedCost: ResolvedCost;
};

/** Commands that change nothing in the log are not recorded (rewinds remove events instead). */
const UNRECORDED = new Set<GameCommand['type']>(['rewind', 'setCardName']);

const TRIGGER_REF = '@';

/**
 * Trigger keys are random and regenerated on every replay: a recorded command names the trigger
 * by its source card, its action and its rank among identical entries of the trigger pile.
 */
function triggerRef(state: GameState, triggerId: string): string {
  const entry = state.triggerPile[triggerId];
  // Unknown key: kept as is, the action then runs the same way (no matching trigger).
  if (!entry) return triggerId;
  const same = Object.entries(state.triggerPile).filter(
    ([, other]) =>
      other.sourceInstanceId === entry.sourceInstanceId &&
      other.effectDef.id === entry.effectDef.id,
  );
  const rank = same.findIndex(([key]) => key === triggerId);
  return `${TRIGGER_REF}${entry.sourceInstanceId}|${entry.effectDef.id}|${rank}`;
}

function triggerKey(state: GameState, ref: string): string {
  const [source, actionId, rank] = ref.slice(TRIGGER_REF.length).split('|');
  const same = Object.entries(state.triggerPile).filter(
    ([, entry]) => String(entry.sourceInstanceId) === source && entry.effectDef.id === actionId,
  );
  return same[Number(rank)]?.[0] ?? '';
}

function mapTriggerId(command: GameCommand, map: (triggerId: string) => string): GameCommand {
  if (command.type === 'skipTrigger') return { ...command, triggerId: map(command.triggerId) };
  if (command.type === 'resolveAction' && command.triggerId !== undefined) {
    return { ...command, triggerId: map(command.triggerId) };
  }
  return command;
}

/**
 * Events compared without what differs from one run to another: ids, timestamps, recorded
 * commands and the random keys of trigger records (replaced by their sorted values). Key order
 * is ignored too (the database stores events as `jsonb`).
 */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (typeof value === 'string') return UUID.test(value) ? '#' : value;
  if (typeof value !== 'object' || value === null) return value;
  const random: string[] = [];
  const fields: [string, unknown][] = [];
  for (const [key, item] of Object.entries(value)) {
    if (UUID.test(key)) random.push(JSON.stringify(canonical(item)));
    else fields.push([key, canonical(item)]);
  }
  fields.sort(([a], [b]) => (a < b ? -1 : 1));
  random.sort((a, b) => a.localeCompare(b));
  if (random.length > 0) fields.push(['#', random]);
  return Object.fromEntries(fields);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function eventContent(event: GameEvent): string {
  const { id: _id, timestamp: _timestamp, commands: _commands, ...rest } = event;
  return JSON.stringify(canonical(JSON.parse(JSON.stringify(rest))));
}

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
  /** Commands run since the last event, waiting to be set on the next one (EDR-051). */
  private unrecorded: GameCommand[] = [];
  /** State the game was resumed from (EDR-052): rewinds never go back before it. */
  private checkpoint?: GameCheckpoint;

  private constructor(
    readonly id: string,
    readonly tutorial: boolean,
    private readonly catalog: GameCatalog,
    private readonly options: GameSessionOptions,
    cardNames: Record<string, string>,
  ) {
    this.activate();
    this.agg = this.makeAggregate();
    this.cardNames = { ...cardNames };
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
    seed?: string,
  ): GameSession {
    const session = new GameSession(id, mode === 'tutorial', catalog, options, {});
    session.startNewGame(firstDrawPile, seed ?? environment.newId());
    session.finalize();
    return session;
  }

  static restore(
    id: string,
    events: GameEvent[],
    catalog: GameCatalog,
    options: GameSessionOptions,
    cardNames: Record<string, string> = {},
    checkpoint?: GameCheckpoint,
  ): GameSession {
    const session = new GameSession(id, false, catalog, options, cardNames);
    session.checkpoint = checkpoint;
    try {
      if (checkpoint) session.agg = session.makeAggregate(checkpoint, events);
      session.agg.loadFromHistory(events.slice(checkpoint?.seq ?? 0));
    } catch (error) {
      throw new CorruptedGameError(error instanceof Error ? error.message : String(error));
    }
    session.pendingChoices = null;
    return session;
  }

  /**
   * Rebuilds a game by running its recorded commands again (EDR-051), from the seed of its first
   * event, and checks they produce the submitted events. Returns `null` for games without a
   * seed (started before EDR-051), which can only be replayed; throws `UnverifiedGameError` when
   * the log is not what the commands produce. The returned session is the trusted one: its score
   * does not depend on the submitted events. With a `checkpoint` (a state the server already
   * trusts, EDR-052), only the commands recorded after it run again.
   */
  static verify(
    id: string,
    events: GameEvent[],
    catalog: GameCatalog,
    checkpoint?: GameCheckpoint,
  ): GameSession | null {
    const first = events[0] as GameStartedEvent | undefined;
    if (first?.type !== GameEventType.GAME_STARTED || first.seed === undefined) return null;
    const options = { allowCheats: false, unrestrictedRewind: false };
    if (checkpoint) {
      // Commands are recorded on the first event they produce: a checkpoint must end before one.
      if (checkpoint.seq < events.length && !events[checkpoint.seq].commands) {
        throw new UnverifiedGameError(`Event ${checkpoint.seq} does not start a command`);
      }
      const session = new GameSession(id, false, catalog, options, {});
      session.checkpoint = checkpoint;
      session.agg = session.makeAggregate(checkpoint, events);
      return session.runRecorded(events, checkpoint.seq);
    }
    const firstDrawPiles = [undefined, catalog.tutorialDrawOrder];
    for (const firstDrawPile of firstDrawPiles) {
      const session = new GameSession(id, false, catalog, options, {});
      session.startNewGame(firstDrawPile, first.seed);
      session.finalize();
      try {
        session.settle(events, 0);
      } catch (error) {
        if (error instanceof UnverifiedGameError) continue;
        throw error;
      }
      return session.runRecorded(events);
    }
    throw new UnverifiedGameError('The game start does not match its seed');
  }

  private runRecorded(events: GameEvent[], from = 0): GameSession {
    let index = nextRecordedEvent(events, from);
    while (index < events.length) {
      for (const recorded of events[index].commands ?? []) {
        if (UNRECORDED.has(recorded.type) || recorded.type === 'cheat') {
          throw new UnverifiedGameError(`Unexpected recorded command ${recorded.type}`);
        }
        const state = this.agg.getGameState();
        const command = mapTriggerId(recorded, ref =>
          ref.startsWith(TRIGGER_REF) ? triggerKey(state, ref) : ref,
        );
        this.execute(command);
      }
      if (this.agg.getEvents().length <= index) {
        throw new UnverifiedGameError(`The commands of event ${index} produce no event`);
      }
      index = this.settle(events, index);
    }
    return this;
  }

  /**
   * Compares the events produced since `from` with the submitted ones up to the next recorded
   * event; the player may have rewound the last ones. Returns the index of that next event.
   */
  private settle(events: GameEvent[], from: number): number {
    const end = nextRecordedEvent(events, from + 1);
    while (this.agg.getEvents().length > end) {
      const before = this.agg.getEvents().length;
      this.rewind();
      if (this.agg.getEvents().length >= before) {
        throw new UnverifiedGameError(`Event ${end} cannot be rewound`);
      }
    }
    const produced = this.agg.getEvents();
    if (produced.length < end) {
      throw new UnverifiedGameError(`Events ${produced.length} to ${end - 1} were not produced`);
    }
    for (let index = from; index < end; index++) {
      if (eventContent(produced[index]) !== eventContent(events[index])) {
        throw new UnverifiedGameError(`Event ${index} does not match the player's commands`);
      }
    }
    return end;
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

  getScore(): number {
    return this.agg.getScore();
  }

  /** Campaign segment scores in the order they were played. */
  getCampaignSegments(): CampaignSegment[] {
    return getCampaignSegments(this.agg.getEvents());
  }

  toView(): GameView {
    this.activate();
    const gameState = this.agg.getGameState();
    return {
      id: this.id,
      tutorial: this.tutorial,
      gameState,
      pendingChoices: this.pendingChoices,
      score: this.agg.getScore(),
      parameters: this.agg.getParameters(),
      eventCount: this.agg.getEvents().length,
      canRewind: this.canRewind(),
      cardNames: this.getCardNames(),
      purge: {
        batch: this.agg.getPurgeBatch(),
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
   * pending action and are returned so the client can display them.
   */
  execute(command: GameCommand): CommandError | undefined {
    this.activate();
    if (command.type === 'cheat' && !this.options.allowCheats) {
      throw new ForbiddenCommandError('Cheat commands are disabled');
    }
    const from = this.agg.getEvents().length;
    if (!UNRECORDED.has(command.type)) {
      const state = this.agg.getGameState();
      this.unrecorded.push(mapTriggerId(command, triggerId => triggerRef(state, triggerId)));
    }
    try {
      this.dispatch(command);
      return undefined;
    } catch (error) {
      if (error instanceof ForbiddenCommandError) throw error;
      return this.handleActionError(error);
    } finally {
      this.record(from);
    }
  }

  /** Sets the waiting commands on the first new event; drops them when the action ended without one. */
  private record(from: number): void {
    const events = this.agg.getEvents();
    if (events.length > from) {
      events[from].commands = this.unrecorded;
      this.unrecorded = [];
    } else if (!this.pendingChoices && !this.pendingUpgrade) {
      this.unrecorded = [];
    }
  }

  private dispatch(command: GameCommand): void {
    if (!isFlowCommandAllowed(command, this.agg.getGameState(), this.agg.isLastRound())) return;
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
        return this.resolveAction(
          command.instanceId,
          command.actionId,
          command.triggerId,
          command.amount,
        );
      case 'resolveUpgrade':
        return this.resolveUpgrade(command.instanceId, command.upgradeTo);
      case 'resolvePlayerChoice':
        return this.resolvePlayerChoice(command.choice, parseChoiceType(command.choiceType));
      case 'resolvePayCost':
        return this.resolvePayCost(command.resolved);
      case 'skipTrigger':
        // Only optional triggers can be skipped (the UI offers no skip for the others).
        if (!this.agg.getGameState().triggerPile[command.triggerId]?.effectDef.optional) return;
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

  /**
   * Installs this session's environment for the rules: the engine is synchronous, so it stays
   * active for the whole call even when several sessions exist (client viewer, server syncs).
   */
  private activate(): void {
    environment.use(this.options.environment ?? systemEnvironment);
  }

  /** A new game, or one resumed at a checkpoint (its earlier events are kept, not replayed). */
  private makeAggregate(checkpoint?: GameCheckpoint, events: GameEvent[] = []): GameAggregate {
    return new GameAggregate(
      this.id,
      cloneState(checkpoint?.state ?? EMPTY_STATE),
      this.catalog.cards,
      this.catalog.stickers,
      events.slice(0, checkpoint?.seq ?? 0),
    );
  }

  private startNewGame(firstDrawPile: number[] | undefined, seed: string): GameState {
    // The starting deck is the first 10 cards of the campaign pack.
    const campaignEntries = [...this.catalog.campaign].sort((a, b) => a.id - b.id);
    const discoverableEntries = [...this.catalog.discoverable].sort((a, b) => a.id - b.id);
    const initialDeck = campaignEntries.slice(0, 10).map(entry => entry.id);
    const discoveryPile = campaignEntries.slice(10).map(entry => entry.id);
    const discoverablePile = discoverableEntries.map(entry => entry.id);

    if (
      firstDrawPile &&
      (firstDrawPile.length !== initialDeck.length ||
        [...firstDrawPile].sort((a, b) => a - b).some((id, i) => id !== initialDeck[i]))
    ) {
      throw new Error('The first draw pile must hold exactly the starting deck');
    }

    return this.agg.gameStarted(
      initialDeck,
      [...campaignEntries, ...discoverableEntries],
      { ...this.catalog.stickerStock },
      discoveryPile,
      discoverablePile,
      firstDrawPile,
      seed,
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
      if (!Object.hasOwn(state.campaignScores, segment)) {
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
    if (gs.phase === Phase.ROUND_END && this.agg.isLastRound()) {
      this.sync(this.agg.endGame());
      return;
    }
    this.sync(this.agg.roundEnded());
  }

  private continueCampaign(): void {
    const gs = this.agg.getGameState();
    if (gs.phase !== Phase.GAME_OVER) return;
    const available = Object.keys(this.catalog.expansions).filter(
      name => !Object.hasOwn(gs.campaignScores, name),
    );
    this.sync(this.agg.saveCampaignScore(available.length > 0));
  }

  private selectExpansion(name: string): void {
    const expansion = this.catalog.expansions[name];
    if (!expansion) return;
    this.sync(this.agg.selectExpansion(name, expansion));
  }

  /**
   * The state of a card just discovered, among the ones its definition offers: at round start,
   * after an expansion's purge or during a turn (discovered by a card effect).
   */
  private chooseState(instanceId: number, stateId: number): void {
    const gs = this.agg.getGameState();
    const inst = gs.instances[instanceId];
    if (
      gs.phase === Phase.GAME_OVER ||
      !inst ||
      !gs.lastAddedCards.includes(instanceId) ||
      !this.catalog.cards[inst.cardId].chooseState?.includes(stateId)
    ) {
      return;
    }
    this.sync(this.agg.chooseState(instanceId, stateId));
  }

  private resolveProduction(instanceId: number, choiceIndex: number): void {
    if (!this.isPlayable(instanceId) || !isInPlay(this.agg.getGameState(), instanceId)) return;
    const gs = this.agg.getGameState();
    const inst = gs.instances[instanceId];
    const { cards, stickers } = this.catalog;
    const baseProductions = cards[inst.cardId].states.find(s => s.id === inst.stateId)
      ?.productions ?? [{}];
    const productionChoices = baseProductions.flatMap(base =>
      getProductionChoicesForAction(base, gs, cards, inst, stickers),
    );
    const chosen = productionChoices[choiceIndex];
    // Like the UI: only a card with a production that gains something produces (a permanent
    // without production would be discarded while staying a permanent).
    if (!chosen || !productionChoices.some(choice => Object.keys(choice).length > 0)) return;
    this.sync(this.agg.cardProduced(instanceId, chosen));
  }

  private resolveAction(
    instanceId: number,
    actionId: string,
    triggerId?: string,
    amount?: number,
  ): void {
    if (!this.isPlayable(instanceId)) return;
    const gs = this.agg.getGameState();
    const actions = getStateActions(
      gs.instances[instanceId],
      this.catalog.cards,
      this.catalog.stickers,
    );
    const triggerEntry = triggerId ? gs.triggerPile[triggerId] : undefined;
    const isMatchingTrigger =
      triggerEntry?.sourceInstanceId === instanceId && triggerEntry?.effectDef.id === actionId;
    const action =
      (isMatchingTrigger ? triggerEntry?.effectDef : undefined) ??
      actions.find(ce => ce.id === actionId && !ce.trigger);
    if (!action) return;
    // A card action (not a trigger): from a card in play, during the turn unless unlimited.
    if (
      !isMatchingTrigger &&
      (!isInPlay(gs, instanceId) || (gs.phase !== Phase.PLAYING && !action.unlimited))
    ) {
      return;
    }

    const newState = this.agg.cardAction(action, instanceId, triggerId, amount);
    if (this.syncAggregatePending()) return;
    this.sync(newState);
  }

  private resolveUpgrade(instanceId: number, upgradeTo: number): void {
    if (!this.isPlayable(instanceId) || !isInPlay(this.agg.getGameState(), instanceId)) return;
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
    const sanitized = sanitizeChoice(choice, choiceType, this.pendingChoices?.[0]);
    if (!sanitized) throw new ActionCancelledError();
    const newState = this.agg.resolveCardActionChoice(sanitized, choiceType);
    if (this.syncAggregatePending()) return;
    this.sync(newState);
  }

  /** Called when the player made a choice needed to pay an action or upgrade cost. */
  private resolvePayCost(input: ResolvedCost): void {
    const resolved = sanitizeCost(input, this.pendingChoices?.[0]);
    if (!resolved) throw new ActionCancelledError();
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

  canRewind(): boolean {
    if (this.tutorial) return false;
    const lastEvent = this.agg.getEvents().at(-1);
    if (!lastEvent) return false;
    if (this.checkpoint && this.agg.getEvents().length <= this.checkpoint.seq) return false;
    if (this.options.unrestrictedRewind) return true;
    return !eventDrewCards(lastEvent);
  }

  private rewind(): void {
    if (!this.canRewind()) return;
    if (!this.agg.undoLastEvent()) {
      // Only an unrestricted (development) rewind goes back past a draw: replay the log.
      const events = this.agg.getEvents().slice(0, -1);
      const agg = this.makeAggregate(this.checkpoint, events);
      agg.loadFromHistory(events.slice(this.checkpoint?.seq ?? 0));
      this.agg = agg;
    }
    this.pendingUpgrade = null;
    this.pendingChoices = null;
    this.finalize();
  }

  // ─── Development cheats ───────────────────────────────────────────────────

  private cheat(command: CheatCommand): void {
    const from = this.agg.getEvents().length;
    this.runCheat(command);
    for (const event of this.agg.getEvents().slice(from)) event.cheat = true;
  }

  private runCheat(command: CheatCommand): void {
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
