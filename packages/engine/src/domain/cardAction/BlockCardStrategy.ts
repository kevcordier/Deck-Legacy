import { PassiveType } from '../enums';
import type { GameState, ResolvedActionEffect } from '../types';
import { CardPassives } from '../types/effects';
import type { CardActionStrategy } from './CardActionStrategy';

export class BlockCardStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const ids = payload.instanceIds;
    if (!ids || ids.length === 0) return gameState;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    gs.boardEffects[payload.sourceInstanceId] = [
      ...(gs.boardEffects[payload.sourceInstanceId] || []),
      {
        ...CardPassives[PassiveType.BLOCK],
        cards: { ids },
      },
    ];
    return gs;
  }
}
