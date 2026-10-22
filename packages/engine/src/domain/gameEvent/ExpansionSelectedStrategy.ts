import { Phase } from '../enums';
import { createInstance } from '../factory';
import type { CardDef, ExpansionSelectedEvent, GameEvent, GameState, StickerStock } from '../types';
import type { GameEventStrategy } from './GameEventStrategy';

function addStickers(stock: StickerStock, added: StickerStock = {}): StickerStock {
  const result = { ...stock };
  for (const [id, count] of Object.entries(added)) {
    result[Number(id)] = (result[Number(id)] ?? 0) + count;
  }
  return result;
}

/**
 * Discoverable cards already in the game (brought by another campaign of the same expansion):
 * they keep their instance and their place (pile, deck, destroyed, purged).
 */
function knownDiscoverables(gameState: GameState, e: ExpansionSelectedEvent): number[] {
  if (!gameState.discoverablePile) return [];
  return (e.discoverableIds ?? []).filter(id => gameState.instances[id] !== undefined);
}

/**
 * Adds the expansion packs to the piles. A game started with a single discovery pile (EDR-045)
 * keeps it: every expansion card goes there.
 */
function discoveryPiles(
  gameState: GameState,
  e: ExpansionSelectedEvent,
): Pick<GameState, 'discoveryPile' | 'discoverablePile'> {
  const discoverableIds = gameState.discoverablePile ? (e.discoverableIds ?? []) : [];
  const campaignIds = e.deckEntries.map(d => d.id).filter(id => !discoverableIds.includes(id));
  const known = knownDiscoverables(gameState, e);
  return {
    discoveryPile: [
      ...new Set(
        e.expansionDiscoveryFirst
          ? [...campaignIds, ...gameState.discoveryPile]
          : [...gameState.discoveryPile, ...campaignIds],
      ),
    ],
    discoverablePile: gameState.discoverablePile && [
      ...new Set([
        ...gameState.discoverablePile,
        ...discoverableIds.filter(id => !known.includes(id)),
      ]),
    ],
  };
}

export class ExpansionSelectedStrategy implements GameEventStrategy {
  constructor(private readonly defs: Record<number, CardDef>) {}

  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as ExpansionSelectedEvent;
    const known = knownDiscoverables(gameState, e);
    const createdInstances = e.deckEntries
      .filter(entry => !known.includes(entry.id))
      .map(entry => {
        // Cards of an expansion: their printed number is scoped to it.
        const origin = e.expansion
          ? { expansion: e.expansion, expansionId: entry.number ?? entry.id }
          : undefined;
        const firstState = this.defs[entry.cardId].states[0];
        return createInstance(entry.id, entry.cardId, firstState.id, this.defs, origin);
      });

    const newInstances = { ...gameState.instances };
    createdInstances.forEach(inst => {
      newInstances[inst.id] = inst;
    });

    return {
      ...gameState,
      round: 0,
      turn: 0,
      instances: newInstances,
      stickerStock: addStickers(gameState.stickerStock, e.addedStickers),
      ...discoveryPiles(gameState, e),
      activeExpansion: e.expansionName,
      expansionMaxRound: e.expansionMaxRound,
      parameterOverrides: e.parameterOverrides ?? {},
      purgeState: {
        batchSize: e.purgeBatchSize,
        permanentToPurge: e.purgePermanentCount,
        shuffledPool: e.purgePool,
        completedBatchStarts: [],
        selectedCardIds: [],
        selectedPermanentIds: [],
        onPurgeTriggered: false,
        onStartDiscoverIds: e.onStartDiscoverIds,
        ...(e.onStartActions && { onStartActions: e.onStartActions }),
        focus: e.purgeFocus,
        ...(e.purgeTopGlory && { topGlory: e.purgeTopGlory }),
      },
      isLastRound: false,
      phase: Phase.PURGE,
    };
  }
}
