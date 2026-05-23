import type { GameEventStrategy } from './GameEventStrategy';
import { createInstance } from '@engine/application/factory';
import type { CardDef, ExpansionSelectedEvent, GameEvent, GameState } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

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
      instances: newInstances,
      discoveryPile: [...new Set([...gameState.discoveryPile, ...e.deckEntries.map(d => d.id)])],
      activeExpansion: e.expansionName,
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
      },
      isLastRound: false,
      phase: Phase.PURGE,
    };
  }
}
