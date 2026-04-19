import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { destroyCards } from '@engine/application/gameStateHelper';
import type { GameState, ResolvedAction } from '@engine/domain/types';

export class DestroyCardStrategy implements CardActionStrategy {
  applyEffect(gameState: GameState, payload: ResolvedAction): GameState {
    const ids =
      payload.instanceIds ?? (payload.instanceId !== undefined ? [payload.instanceId] : []);
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    return { ...gs, ...destroyCards(gs, ids) };
  }
}
