import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { mergeResources } from '@engine/application/gameStateHelper';
import type { ActionEffectType } from '@engine/domain/enums';
import type { GameState, Resources } from '@engine/domain/types';

export class AddResourceStrategy implements CardActionStrategy {
  apply(
    gameState: GameState,
    payload: {
      id: string;
      type: ActionEffectType;
      sourceInstanceId: number;
      resources: Resources;
    },
  ): GameState {
    return { ...gameState, resources: mergeResources(gameState.resources, payload.resources) };
  }
}
