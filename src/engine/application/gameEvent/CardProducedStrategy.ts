import type { GameEventStrategy } from './GameEventStrategy';
import { discardCards, mergeResources } from '@engine/application/gameStateHelper';
import type { CardProducedEvent, GameEvent, GameState } from '@engine/domain/types';

export class CardProducedStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as CardProducedEvent;
    const withResources = {
      ...gameState,
      resources: mergeResources(gameState.resources, e.productions),
    };
    return { ...withResources, ...discardCards(withResources, [e.cardInstanceId]) };
  }
}
