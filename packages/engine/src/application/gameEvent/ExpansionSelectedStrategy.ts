import { Phase } from '../../domain/enums';
import type {
  CardDef,
  ExpansionSelectedEvent,
  GameEvent,
  GameState,
  StickerStock,
} from '../../domain/types';
import { createInstance } from '../factory';
import type { GameEventStrategy } from './GameEventStrategy';

function addStickers(stock: StickerStock, added: StickerStock = {}): StickerStock {
  const result = { ...stock };
  for (const [id, count] of Object.entries(added)) {
    result[Number(id)] = (result[Number(id)] ?? 0) + count;
  }
  return result;
}

export class ExpansionSelectedStrategy implements GameEventStrategy {
  constructor(private readonly defs: Record<number, CardDef>) {}

  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as ExpansionSelectedEvent;
    const createdInstances = e.deckEntries.map(entry =>
      createInstance(entry.id, entry.cardId, this.defs[entry.cardId].states[0].id, this.defs),
    );

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
      discoveryPile: [...new Set([...gameState.discoveryPile, ...e.deckEntries.map(d => d.id)])],
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
        focus: e.purgeFocus,
      },
      isLastRound: false,
      phase: Phase.PURGE,
    };
  }
}
