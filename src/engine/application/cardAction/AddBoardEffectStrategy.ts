import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { GameState, ResolvedAction } from '@engine/domain/types';

export class AddBoardEffectStrategy implements CardActionStrategy {
  applyEffect(gameState: GameState, payload: ResolvedAction): GameState {
    if (!payload.instanceIds?.length || !payload.effect) return gameState;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    for (const id of payload.instanceIds) {
      gs.boardEffects[id] = [
        ...(gs.boardEffects[id] ?? []),
        { ...payload.effect, cards: { ids: [id] } },
      ];
    }
    return gs;
  }
}
