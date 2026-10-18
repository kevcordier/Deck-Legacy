import { getActiveState, isPermanent } from '../cardHelpers';
import { Phase } from '../enums';
import { syncInstancePassivesInBoardEffects } from '../gameStateHelper';
import type { CardDef, GameEvent, GameState, PurgeFinalizedEvent } from '../types';
import type { GameEventStrategy } from './GameEventStrategy';

function removeIds(values: number[], idsToRemove: number[]): number[] {
  return values.filter(id => !idsToRemove.includes(id));
}

export class PurgeFinalizedStrategy implements GameEventStrategy {
  constructor(private readonly defs: Record<number, CardDef>) {}

  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as PurgeFinalizedEvent;

    const discoveredOnStart: number[] = [];
    const newPermanents = [...gameState.permanents];
    const newDiscard = [...gameState.discardPile];
    const remainingDiscovery = [...gameState.discoveryPile];
    const remainingDiscoverable = gameState.discoverablePile && [...gameState.discoverablePile];
    let newBoardEffects = { ...gameState.boardEffects };

    for (const cardId of e.onStartDiscoverIds) {
      const pile = remainingDiscovery.includes(cardId) ? remainingDiscovery : remainingDiscoverable;
      const idx = pile?.indexOf(cardId) ?? -1;
      if (!pile || idx < 0) continue;
      pile.splice(idx, 1);

      const instance = gameState.instances[cardId];
      if (!instance) continue;
      discoveredOnStart.push(cardId);

      if (isPermanent(getActiveState(instance, this.defs))) {
        if (!newPermanents.includes(cardId)) {
          newPermanents.push(cardId);
        }
        const synced = syncInstancePassivesInBoardEffects(
          { ...gameState, boardEffects: newBoardEffects },
          cardId,
          this.defs,
        );
        newBoardEffects = synced.boardEffects;
      } else if (!newDiscard.includes(cardId)) {
        newDiscard.push(cardId);
      }
    }

    return {
      ...gameState,
      drawPile: removeIds(gameState.drawPile, e.purgedIds),
      discardPile: removeIds(newDiscard, e.purgedIds),
      board: removeIds(gameState.board, e.purgedIds),
      permanents: removeIds(newPermanents, e.purgedIds),
      discoveryPile: removeIds(remainingDiscovery, e.purgedIds),
      discoverablePile: remainingDiscoverable && removeIds(remainingDiscoverable, e.purgedIds),
      purgedCards: [...new Set([...gameState.purgedCards, ...e.purgedIds])],
      purgedGlory: [...gameState.purgedGlory, e.glory],
      purgeState: undefined,
      lastAddedCards: discoveredOnStart,
      phase: Phase.ROUND_END,
      boardEffects: newBoardEffects,
    };
  }
}
