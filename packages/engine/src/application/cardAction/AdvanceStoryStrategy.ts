import type { CardDef, GameState, ResolvedActionEffect } from '../../domain/types';
import type { CardActionStrategy } from './CardActionStrategy';
import { DiscoverCardStrategy } from './DiscoverCardStrategy';

/** Discovers the next `value` cards of the campaign pile, like the start of a round. */
export class AdvanceStoryStrategy implements CardActionStrategy {
  private readonly discover: DiscoverCardStrategy;

  constructor(cardDefs: Record<number, CardDef>) {
    this.discover = new DiscoverCardStrategy(cardDefs);
  }

  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const instanceIds = gameState.discoveryPile.slice(0, payload.value ?? 1);
    return this.discover.apply(gameState, { ...payload, instanceIds });
  }
}
