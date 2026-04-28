import { GameContext, type GameContextType } from '@contexts/GameContext';
import { use } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type GameHook = GameContextType;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGame(): GameHook {
  return use(GameContext);
}
