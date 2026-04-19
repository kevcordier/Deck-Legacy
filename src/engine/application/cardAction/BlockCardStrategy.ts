import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { PassiveType } from '@engine/domain/enums';
import type { GameState, ResolvedAction } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export class BlockCardStrategy implements CardActionStrategy {
  applyEffect(gameState: GameState, payload: ResolvedAction): GameState {
    const ids = payload.instanceIds;
    if (!ids || ids.length === 0) return gameState;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    gs.boardEffects[payload.sourceInstanceId] = [
      ...(gs.boardEffects[payload.sourceInstanceId] || []),
      {
        ...CardPassives[PassiveType.BLOCK],
        cards: { ids: [ids[0]] },
      },
    ];
    return gs;
  }
}
