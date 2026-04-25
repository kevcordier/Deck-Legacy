import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { destroyCards } from '@engine/application/gameStateHelper';
import type { GameState, ResolvedActionEffect } from '@engine/domain/types';

export class DestroyCardStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const ids = payload.instanceIds ?? [];
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    return { ...gs, ...destroyCards(gs, ids) };
  }
}
