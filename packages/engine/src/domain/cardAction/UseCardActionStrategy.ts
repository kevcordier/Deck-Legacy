import type { GameState } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

/** The used action's effects follow in the action (`newActionEffects`): nothing to apply here. */
export class UseCardActionStrategy implements CardActionStrategy {
  apply(gameState: GameState): GameState {
    return gameState;
  }
}
