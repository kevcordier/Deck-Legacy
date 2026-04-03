import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { GameState, Resources } from '@engine/domain/types';
import { mergeResources } from '@engine/application/resourceHelpers';

export class AddResourceStrategy implements CardActionStrategy {
  applyEffect(
    gameState: GameState,
    payload: {
      id: string;
      type: string;
      sourceInstanceId: number;
      resources: Resources;
    },
  ): GameState {
    return { ...gameState, resources: mergeResources(gameState.resources, payload.resources) };
  }
}
