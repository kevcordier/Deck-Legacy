import { useMemo, useContext } from 'react';
import type {
  GameState,
  CardDef,
  Sticker,
  Resources,
  PendingChoice,
  ResolvedCost,
  ResolvedAction,
  TriggerEntry,
} from '@engine/domain/types';
import { computeScore, getCurrentPhase } from '@engine/application/gameStateHelper';
import { GameContext } from '@contexts/GameContext';
import type { Phase } from '@engine/domain/types/Phase';

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
  resolveProduction: (instanceId: number, chosenResource?: Resources) => void;
  resolveAction: (instanceId: number, actionId: string) => void;
  resolveTrackStep: (instanceId: number, stepId: number) => void;
  resolveUpgrade: (instanceId: number, chosenUpgradeTo?: number) => void;
  progress: () => void;
  endTurnVoluntary: () => void;
  resolvePlayerChoice: (choice: ResolvedAction) => void;
  resolvePayCost: (resolved: ResolvedCost) => void;
  skipTrigger: (uuid: string) => void;
  skipChoice: (uuid: string) => void;
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
    canRewind,
    rewindEvent,
  } = useContext(GameContext);

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
    canRewind,
    rewindEvent,
  };
}
