import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { discardCards } from '@engine/application/gameStateHelper';
import type { GameState, ResolvedAction } from '@engine/domain/types';

export class DiscardCardStrategy implements CardActionStrategy {
  applyEffect(gameState: GameState, payload: ResolvedAction): GameState {
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    return { ...gs, ...discardCards(gs, payload.instanceIds ?? []) };
  }
}
