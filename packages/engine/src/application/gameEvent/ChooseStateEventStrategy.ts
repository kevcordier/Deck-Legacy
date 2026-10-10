import type { ChooseStateEvent, GameEvent, GameState } from '../../domain/types';
import type { GameEventStrategy } from './GameEventStrategy';

export class ChooseStateEventStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as ChooseStateEvent;
    const updatedInstances = {
      ...gameState.instances,
      [e.cardInstanceId]: { ...gameState.instances[e.cardInstanceId], stateId: e.stateId },
    };
    return { ...gameState, instances: updatedInstances };
  }
}
