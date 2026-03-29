import type { CardEffectStrategy } from '@engine/application/cardEffect/CardEffectStrategy';
import type { GameState, Resources } from '@engine/domain/types';
import { mergeResources } from '@engine/application/resourceHelpers';

export class AddResourceStrategy implements CardEffectStrategy {
  applyEffect(
    gameState: GameState,
    payload: {
      resources: Resources;
    },
  ): GameState {
    gameState.resources = mergeResources(gameState.resources, payload.resources);
    return gameState;
  }
}
