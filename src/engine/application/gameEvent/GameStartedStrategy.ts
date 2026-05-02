import type { GameEventStrategy } from './GameEventStrategy';
import type { CardInstance, GameEvent, GameStartedEvent, GameState } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

function normalizeCardInstance(instance: CardInstance): CardInstance {
  return {
    ...instance,
    stickers: instance.stickers ?? {},
    trackProgress: instance.trackProgress ?? [],
    cumulated: instance.cumulated ?? {},
    usedActionIds: instance.usedActionIds ?? [],
    removedResourcesByState: instance.removedResourcesByState ?? {},
  };
}

export class GameStartedStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as GameStartedEvent;
    return {
      ...gameState,
      instances: Object.fromEntries(
        e.cardInstances.map(inst => [inst.id, normalizeCardInstance(inst)]),
      ),
      drawPile: e.initialDeck,
      stickerStock: e.stickerStock,
      discoveryPile: e.discoveryPile,
      round: 0,
      turn: 0,
      phase: Phase.PREGAME,
    };
  }
}
