import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { GameState } from '@engine/domain/types';

export class PlayCardStrategy implements CardActionStrategy {
  applyEffect(
    gameState: GameState,
    payload: {
      id: string;
      type: string;
      sourceInstanceId: number;
      instanceId: number;
    },
  ): GameState {
    // @todo: if has on play trigger, trigger it
    gameState.discoveryPile = gameState.discoveryPile.filter(c => c !== payload.instanceId);
    gameState.drawPile = gameState.drawPile.filter(c => c !== payload.instanceId);
    gameState.destroyedPile = gameState.destroyedPile.filter(c => c !== payload.instanceId);
    gameState.discardPile = gameState.discardPile.filter(c => c !== payload.instanceId);
    gameState.board = [...gameState.board, payload.instanceId];
    return gameState;
  }
}
