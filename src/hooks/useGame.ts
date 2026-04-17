import { GameContext } from '@contexts/GameContext';
import { computeScore, getCurrentPhase } from '@engine/application/gameStateHelper';
import type {
  CardDef,
  GameState,
  PendingChoice,
  ResolvedAction,
  ResolvedCost,
  Sticker,
  TriggerEntry,
} from '@engine/domain/types';
import type { Phase } from '@engine/domain/types/Phase';
import { use, useMemo } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type GameHook = {
  state: GameState;
  defs: Record<number, CardDef>;
  stickerDefs: Record<number, Sticker>;
  score: number;
  pendingChoices: PendingChoice[] | null;
  triggerPile: Record<string, TriggerEntry> | null;
  phase: Phase;
  loadGame: () => void;
  deleteSave: () => void;
  startGame: () => void;
  startRound: () => void;
  startTurn: () => void;
  resolveProduction: (instanceId: number, chosenResource: number) => void;
  resolveAction: (instanceId: number, actionId: string) => void;
  resolveTrackStep: (instanceId: number, stepId: number) => void;
  resolveUpgrade: (instanceId: number, chosenUpgradeTo?: number) => void;
  progress: () => void;
  endTurnVoluntary: () => void;
  resolvePlayerChoice: (choice: ResolvedAction) => void;
  resolvePayCost: (resolved: ResolvedCost) => void;
  skipTrigger: (uuid: string) => void;
  skipChoice: (uuid: string) => void;
  parchmentTextPending: CardDef | null;
  dismissParchmentText: () => void;
  canRewind: () => boolean;
  rewindEvent: () => void;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGame(): GameHook {
  const {
    gameState,
    defs,
    stickerDefs,
    pendingChoices,
    triggerPile,
    loadGame,
    deleteSave,
    startGame,
    startRound,
    startTurn,
    resolveProduction,
    resolveAction,
    resolveTrackStep,
    resolveUpgrade,
    progress,
    endTurnVoluntary,
    resolvePlayerChoice,
    resolvePayCost,
    skipTrigger,
    skipChoice,
    parchmentTextPending,
    dismissParchmentText,
    canRewind,
    rewindEvent,
  } = use(GameContext);

  // ── Score ─────────────────────────────────────────────────────────────────

  const score = useMemo(
    () => computeScore(gameState, defs, stickerDefs),
    [gameState, defs, stickerDefs],
  );

  const phase = useMemo(() => getCurrentPhase(gameState), [gameState]);

  // ── Result ──────────────────────────────────────────────────────────────

  return {
    state: gameState,
    defs,
    stickerDefs,
    score,
    pendingChoices,
    triggerPile,
    phase,
    loadGame,
    deleteSave,
    startGame,
    startRound,
    startTurn,
    resolveProduction,
    resolveAction,
    resolveTrackStep,
    resolveUpgrade,
    progress,
    endTurnVoluntary,
    resolvePlayerChoice,
    resolvePayCost,
    skipTrigger,
    skipChoice,
    parchmentTextPending,
    dismissParchmentText,
    canRewind,
    rewindEvent,
  };
}
