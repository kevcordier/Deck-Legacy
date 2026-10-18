import type { GameState, ResolvedActionEffect } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

export class AddBoardEffectStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    if (!payload.effect) return gameState;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    if (payload.instanceIds?.length) {
      gs.boardEffects[payload.sourceInstanceId] = [
        ...(gs.boardEffects[payload.sourceInstanceId] ?? []),
        { ...payload.effect, cards: { ids: payload.instanceIds } },
      ];
    } else {
      gs.boardEffects[payload.sourceInstanceId] = [
        ...(gs.boardEffects[payload.sourceInstanceId] ?? []),
        payload.effect,
      ];
    }

    return gs;
  }
}
