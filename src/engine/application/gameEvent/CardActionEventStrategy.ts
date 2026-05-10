import type { GameEventStrategy } from './GameEventStrategy';
import type { CardActionEvent, GameEvent, GameState } from '@engine/domain/types';

export class CardActionEventStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as CardActionEvent;

    const { instances, ...dif } = e.gameStateChanges;

    const newState = { ...gameState, ...dif };
    if (instances) {
      Object.entries(instances).forEach(([id, inst]) => {
        newState.instances[Number(id)] = {
          ...newState.instances[Number(id)],
          ...inst,
        };
      });
    }

    return newState;
  }
}
