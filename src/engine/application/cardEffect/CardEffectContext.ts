import type { CardEffectStrategy } from '@engine/application/cardEffect/CardEffectStrategy';
import type { GameState } from '@engine/domain/types';

export class CardEffectContext {
  private strategy?: CardEffectStrategy;

  constructor() {}

  setStrategy(strategy: CardEffectStrategy) {
    this.strategy = strategy;
  }

  applyEffect(gameState: GameState, payload: unknown): GameState {
    if (!this.strategy) {
      throw new Error('CardEffectStrategy not set in CardEffectContext');
    }
    return this.strategy.applyEffect(gameState, payload);
  }
}
