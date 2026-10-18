import type { PassiveType } from '../enums';
import type { GameState, Passive } from '../types';

export function passivesInPlay(gameState: GameState, type: PassiveType): Passive[] {
  return Object.values(gameState.boardEffects)
    .flat()
    .filter(p => p.type === type);
}
