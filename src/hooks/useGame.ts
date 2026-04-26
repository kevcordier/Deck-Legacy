import { GameContext } from '@contexts/GameContext';
import { computeScore } from '@engine/application/gameStateHelper';
import type { PendingChoiceType } from '@engine/domain/enums';
import type {
  CardDef,
  GameEvent,
  GameState,
  PendingChoice,
  ResolvedActionEffect,
  ResolvedCost,
  Sticker,
  TriggerEntry,
} from '@engine/domain/types';
import { use, useMemo } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type GameHook = {
  state: GameState;
  defs: Record<number, CardDef>;
  stickerDefs: Record<number, Sticker>;
  score: number;
  pendingChoices: PendingChoice[] | null;
  triggerPile: Record<string, TriggerEntry> | null;
  deleteSave: () => void;
  startGame: () => void;
  startRound: () => void;
  startTurn: () => void;
  chooseState: (instanceId: number, stateId: number) => void;
  resolveProduction: (instanceId: number, chosenResource: number) => void;
  resolveAction: (instanceId: number, actionId: string) => void;
  resolveUpgrade: (instanceId: number, chosenUpgradeTo?: number) => void;
  setCardName: (instanceId: number, chosenName: string) => void;
  getCardName: (instanceId: number) => string | undefined;
  progress: () => void;
  endTurnVoluntary: () => void;
  resolvePlayerChoice: (choice: ResolvedActionEffect, choiceType: PendingChoiceType) => void;
  resolvePayCost: (resolved: ResolvedCost) => void;
  skipTrigger: (uuid: string) => void;
  skipChoice: (uuid: string) => void;
  parchmentTextPending: CardDef | null;
  dismissParchmentText: () => void;
  canRewind: () => boolean;
  rewindEvent: () => void;
  getEvents: () => GameEvent[];
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGame(): GameHook {
  const {
    gameState,
    defs,
    stickerDefs,
    pendingChoices,
    triggerPile,
    deleteSave,
    startGame,
    startRound,
    startTurn,
    chooseState,
    resolveProduction,
    resolveAction,
    resolveUpgrade,
    setCardName,
    getCardName,
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
    getEvents,
  } = use(GameContext);

  // ── Score ─────────────────────────────────────────────────────────────────

  const score = useMemo(
    () => computeScore(gameState, defs, stickerDefs),
    [gameState, defs, stickerDefs],
  );

  // ── Result ──────────────────────────────────────────────────────────────

  return {
    state: gameState,
    defs,
    stickerDefs,
    score,
    pendingChoices,
    triggerPile,
    deleteSave,
    startGame,
    startRound,
    startTurn,
    chooseState,
    resolveProduction,
    resolveAction,
    resolveUpgrade,
    setCardName,
    getCardName,
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
    getEvents,
  };
}
