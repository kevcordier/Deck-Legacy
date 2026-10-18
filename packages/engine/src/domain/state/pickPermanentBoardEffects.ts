import type { Passive } from '../types';

export const pickPermanentBoardEffects = (
  boardEffects: Record<number, Passive[]>,
  permanents: number[],
): Record<number, Passive[]> => {
  const permanentBoardEffects: Record<number, Passive[]> = {};
  for (const sourceId of permanents) {
    if (boardEffects[sourceId]) {
      permanentBoardEffects[sourceId] = boardEffects[sourceId];
    }
  }
  return permanentBoardEffects;
};
