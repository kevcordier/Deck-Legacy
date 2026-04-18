import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { GameState, ResolvedAction } from '@engine/domain/types';

export class CardActionContext {
  private strategy?: CardActionStrategy;

  setStrategy(strategy: CardActionStrategy) {
    this.strategy = strategy;
  }

  applyEffect(gameState: GameState, payload: ResolvedAction): GameState {
    if (!this.strategy) {
      throw new Error('CardActionStrategy not set in CardActionContext');
    }
    return this.strategy.applyEffect(gameState, payload);
  }
}
