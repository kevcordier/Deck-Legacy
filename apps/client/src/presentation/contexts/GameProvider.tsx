import { GameContext, type GameContextType } from './GameContext';
import { summarizeSession } from '@application/kingdom/summarizeSession';
import { kingdomStore } from '@composition/kingdomStore';
import { syncService } from '@composition/syncService';
import { DEFAULT_PARAMETERS, EMPTY_STATE } from '@deck-legacy/engine/application/emptyState';
import {
  GameSession,
  type GameSessionOptions,
} from '@deck-legacy/engine/application/session/GameSession';
import { Phase } from '@deck-legacy/engine/domain/enums';
import { CorruptedGameError } from '@deck-legacy/engine/domain/errors/CorruptedGameError';
import { CorruptedSaveError } from '@deck-legacy/engine/domain/errors/CorruptedSaveError';
import type {
  CardDef,
  CheatCommand,
  GameCommand,
  GameState,
  GameView,
} from '@deck-legacy/engine/domain/types';
import { TUTORIAL_DRAW_ORDER } from '@deck-legacy/game-data';
import { findDrawnCards } from '@domain/card/findDrawnCards';
import { type UpgradeReveal, findUpgradeReveal } from '@domain/card/findUpgradeReveal';
import type { SaveData } from '@domain/kingdom/SaveData';
import { catalog } from '@infrastructure/catalog/catalog';
import { toast } from '@infrastructure/toast/toast';
import { randomUUID } from 'expo-crypto';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const EMPTY_PURGE: GameView['purge'] = {
  batch: [],
  candidates: [],
  permanentCandidates: [],
  selectedIds: [],
  canSelectPermanent: false,
  isSelectionComplete: false,
};

/** Development builds may rewind anything and use the cheat panel. */
const SESSION_OPTIONS: GameSessionOptions = {
  allowCheats: __DEV__,
  unrestrictedRewind: __DEV__,
};

function parchmentCardDef(state: GameState, defs: Record<number, CardDef>): CardDef | null {
  if (state.phase !== Phase.PARCHMENT || !state.onGoingParchment) return null;
  const inst = state.instances[state.onGoingParchment];
  return inst ? (defs[inst.cardId] ?? null) : null;
}

/** Identifies what was last written to the local save. */
function signatureOf(session: GameSession): string {
  const events = session.getEvents();
  return `${session.id}:${events.length}:${events.at(-1)?.id}:${JSON.stringify(session.getCardNames())}`;
}

/**
 * Rebuilds the session of a saved game, opens the tutorial (a scripted first round, saved only
 * when the player keeps it) or starts the kingdom's first game.
 */
function initialSession(
  kingdomId: string | undefined,
  save: SaveData | null | undefined,
  tutorial: boolean,
  seed: string | undefined,
): GameSession | null {
  if (tutorial) {
    return GameSession.start(
      kingdomId ?? randomUUID(),
      catalog,
      SESSION_OPTIONS,
      'tutorial',
      TUTORIAL_DRAW_ORDER,
      seed,
    );
  }
  if (!save) {
    return kingdomId
      ? GameSession.start(kingdomId, catalog, SESSION_OPTIONS, 'standard', undefined, seed)
      : null;
  }
  try {
    return GameSession.restore(
      save.id,
      save.events,
      catalog,
      SESSION_OPTIONS,
      save.cardNames,
      save.checkpoint,
    );
  } catch (error) {
    if (error instanceof CorruptedGameError) throw new CorruptedSaveError(error.message);
    throw error;
  }
}

/**
 * Runs the game on the device, so it can be played offline.
 *
 * Each player action is executed by the engine's `GameSession`; the resulting event log is
 * saved locally as the kingdom's save and synced to the server in the background
 * (`services/sync.ts`).
 *
 * `initialState` renders a static board without a session (Storybook).
 */
export function GameProvider({
  children,
  kingdomId,
  initialSave,
  startTutorial: tutorialAtStart = false,
  initialState,
  seed,
}: {
  readonly children: ReactNode;
  /** Kingdom being played: its id is the game id. Without a save, its first game starts. */
  readonly kingdomId?: string;
  readonly initialSave?: SaveData | null;
  /** Open the tutorial first (new kingdom created with the tutorial). */
  readonly startTutorial?: boolean;
  readonly initialState?: GameState;
  /** Seed of a new kingdom's games (chosen by the player); a random one when absent. */
  readonly seed?: string;
}) {
  const { t } = useTranslation();
  const { cards: defs, stickers: stickerDefs, expansions } = catalog;
  const [firstSession] = useState(() =>
    initialSession(kingdomId, initialSave, tutorialAtStart, seed),
  );
  const sessionRef = useRef<GameSession | null>(firstSession);
  const [view, setView] = useState<GameView | null>(() => firstSession?.toView() ?? null);
  const viewRef = useRef<GameView | null>(view);
  const [displayNewCards, setDisplayNewCards] = useState(false);
  const [upgradeReveal, setUpgradeReveal] = useState<UpgradeReveal | null>(null);
  const [drawnCardIds, setDrawnCardIds] = useState<number[]>([]);
  // Opening a saved game must not re-sync it; a kingdom's first game is saved at once.
  const persistedRef = useRef(
    firstSession && !firstSession.tutorial && initialSave ? signatureOf(firstSession) : '',
  );

  const gameState = view?.gameState ?? initialState ?? EMPTY_STATE;

  // ─── Session plumbing ─────────────────────────────────────────────────────

  /** Saves locally when the event log or card names changed, then schedules a sync. */
  const persist = useCallback((session: GameSession) => {
    if (session.tutorial) return;
    const signature = signatureOf(session);
    if (signature === persistedRef.current) return;
    persistedRef.current = signature;
    kingdomStore.saveGame(
      session.id,
      session.getEvents(),
      session.getCardNames(),
      summarizeSession(session),
    );
    syncService.schedule();
  }, []);

  useEffect(() => {
    if (firstSession) persist(firstSession);
  }, [firstSession, persist]);

  const publish = useCallback(
    (session: GameSession | null) => {
      const next = session?.toView() ?? null;
      const previousCards = viewRef.current?.gameState.lastAddedCards ?? [];
      if (next?.gameState.lastAddedCards.some(id => !previousCards.includes(id))) {
        setDisplayNewCards(true);
      }
      viewRef.current = next;
      setView(next);
      if (session) persist(session);
    },
    [persist],
  );

  const send = useCallback(
    (command: GameCommand) => {
      const session = sessionRef.current;
      if (!session) return;
      const previousState = session.getState();
      const eventCount = session.getEvents().length;
      const error = session.execute(command);
      // A rewind shortens the log: no new event, so nothing to reveal.
      const reveal = findUpgradeReveal(
        previousState,
        session.getState(),
        session.getEvents().slice(eventCount),
      );
      if (reveal) setUpgradeReveal(reveal);
      // Reset by every command: a later re-render of the board must not replay the draw.
      const drawn = findDrawnCards(previousState, session.getState());
      setDrawnCardIds(current => (drawn.length === 0 && current.length === 0 ? current : drawn));
      publish(session);
      if (error) {
        if (error.code === 'ENGINE_ERROR') console.error(error.message);
        toast.error(t(error.message));
      }
    },
    [publish, t],
  );

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  /** Starts the kingdom's game (after the tutorial), replacing its save. */
  const startGame = useCallback(() => {
    if (!kingdomId) return;
    const session = GameSession.start(
      kingdomId,
      catalog,
      SESSION_OPTIONS,
      'standard',
      undefined,
      seed,
    );
    sessionRef.current = session;
    publish(session);
  }, [kingdomId, publish, seed]);

  /** Keeps the tutorial game: replayed as a standard session, so it is saved and synced. */
  const continueGame = useCallback(() => {
    const tutorial = sessionRef.current;
    if (!kingdomId || !tutorial) return;
    const session = GameSession.restore(
      kingdomId,
      tutorial.getEvents(),
      catalog,
      SESSION_OPTIONS,
      tutorial.getCardNames(),
    );
    sessionRef.current = session;
    publish(session);
  }, [kingdomId, publish]);

  // ─── Development tools ────────────────────────────────────────────────────

  useEffect(() => {
    if (!__DEV__) return;
    const cheat = (command: CheatCommand) => send({ type: 'cheat', cheat: command });
    (globalThis as unknown as Record<string, unknown>).__cheat = {
      addResources: (resources: Record<string, number>) => cheat({ op: 'addResources', resources }),
      drawCard: (...instanceIds: number[]) => cheat({ op: 'drawCard', instanceIds }),
      discardCard: (...instanceIds: number[]) => cheat({ op: 'discardCard', instanceIds }),
      destroyCard: (...instanceIds: number[]) => cheat({ op: 'destroyCard', instanceIds }),
      discoverCard: (...instanceIds: number[]) => cheat({ op: 'discoverCard', instanceIds }),
      chooseState: (instanceId: number, stateId: number) =>
        cheat({ op: 'chooseState', instanceId, stateId }),
      addSticker: (instanceId: number, stickerId: number) =>
        cheat({ op: 'addSticker', instanceId, stickerId }),
      getState: () => sessionRef.current?.getState(),
      getEvents: () => sessionRef.current?.getEvents(),
    };
    return () => {
      delete (globalThis as unknown as Record<string, unknown>).__cheat;
    };
  }, [send]);

  // ─── Context value ────────────────────────────────────────────────────────

  const parchmentTextPending = useMemo(() => parchmentCardDef(gameState, defs), [gameState, defs]);

  const availableExpansions = useMemo(
    () => Object.keys(expansions).filter(name => !Object.hasOwn(gameState.campaignScores, name)),
    [expansions, gameState.campaignScores],
  );

  const value = useMemo<GameContextType>(() => {
    const purge = view?.purge ?? EMPTY_PURGE;
    return {
      id: view?.id,
      gameState,
      defs,
      stickerDefs,
      pendingChoices: view?.pendingChoices ?? null,
      triggerPile: parchmentTextPending ? null : gameState.triggerPile,
      isTutorial: view?.tutorial ?? false,
      startGame,
      continueGame,
      endRound: () => send({ type: 'endRound' }),
      startRound: () => send({ type: 'startRound' }),
      startTurn: () => send({ type: 'startTurn' }),
      chooseState: (instanceId, stateId) => send({ type: 'chooseState', instanceId, stateId }),
      resolveProduction: (instanceId, choiceIndex) =>
        send({ type: 'resolveProduction', instanceId, choiceIndex }),
      resolveAction: (instanceId, actionId, triggerId, amount) =>
        send({ type: 'resolveAction', instanceId, actionId, triggerId, amount }),
      resolveUpgrade: (instanceId, upgradeTo) => {
        if (upgradeTo === undefined) return;
        send({ type: 'resolveUpgrade', instanceId, upgradeTo });
      },
      getCardName: instanceId => view?.cardNames[String(instanceId)],
      setCardName: (instanceId, name) => send({ type: 'setCardName', instanceId, name }),
      progress: () => send({ type: 'progress' }),
      endTurnVoluntary: () => send({ type: 'endTurn' }),
      resolvePlayerChoice: (choice, choiceType) =>
        send({ type: 'resolvePlayerChoice', choice, choiceType }),
      resolvePayCost: resolved => send({ type: 'resolvePayCost', resolved }),
      skipTrigger: triggerId => send({ type: 'skipTrigger', triggerId }),
      skipChoice: () => send({ type: 'skipChoice' }),
      parchmentTextPending,
      dismissParchmentText: () => send({ type: 'dismissParchment' }),
      canRewind: () => view?.canRewind ?? false,
      rewindEvent: () => send({ type: 'rewind' }),
      score: view?.score ?? 0,
      campaignScores: gameState.campaignScores,
      availableExpansions,
      continueCampaign: () => send({ type: 'continueCampaign' }),
      selectExpansion: name => send({ type: 'selectExpansion', name }),
      purgeBatch: purge.batch,
      purgeCandidates: purge.candidates,
      purgePermanentCandidates: purge.permanentCandidates,
      selectedPurgeIds: purge.selectedIds,
      canSelectPermanentForPurge: purge.canSelectPermanent,
      isPurgeSelectionComplete: purge.isSelectionComplete,
      selectPurgeCard: instanceId => send({ type: 'selectPurgeCard', instanceId }),
      selectPurgePermanent: instanceId => send({ type: 'selectPurgePermanent', instanceId }),
      finalizePurge: () => send({ type: 'finalizePurge' }),
      drawnCardIds,
      upgradeReveal,
      dismissUpgradeReveal: () => setUpgradeReveal(null),
      displayNewCards,
      setDisplayNewCards,
      getEvents: () => sessionRef.current?.getEvents() ?? [],
      parameters: view?.parameters ?? DEFAULT_PARAMETERS,
    };
  }, [
    view,
    gameState,
    defs,
    stickerDefs,
    parchmentTextPending,
    availableExpansions,
    drawnCardIds,
    upgradeReveal,
    displayNewCards,
    send,
    startGame,
    continueGame,
  ]);

  return <GameContext value={value}>{children}</GameContext>;
}
