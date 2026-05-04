import type { GameEventStrategy } from './GameEventStrategy';
import { discardCards, mergeResources } from '@engine/application/gameStateHelper';
import type {
  CardDef,
  CardProducedEvent,
  GameEvent,
  GameState,
  Sticker,
} from '@engine/domain/types';

export class CardProducedStrategy implements GameEventStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as CardProducedEvent;
    const withResources = {
      ...gameState,
      resources: mergeResources(gameState.resources, e.productions),
    };
    return {
      ...withResources,
      ...discardCards(withResources, [e.cardInstanceId], this.cardDefs, this.stickerDefs),
    };
  }
}
