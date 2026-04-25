import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { discardCards } from '@engine/application/gameStateHelper';
import type { GameState, ResolvedActionEffect } from '@engine/domain/types';

export class DiscardCardStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    return { ...gs, ...discardCards(gs, payload.instanceIds ?? []) };
  }
}
