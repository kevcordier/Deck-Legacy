import type { GameState, ResolvedActionEffect } from '../../domain/types';
import { destroyCards } from '../gameStateHelper';
import type { CardActionStrategy } from './CardActionStrategy';

export class DestroyCardStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const ids = payload.instanceIds ?? [];
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    return { ...gs, ...destroyCards(gs, ids) };
  }
}
