import { createInstance } from '@deck-legacy/engine/domain/factory';
import type { CardInstance, GameCatalog } from '@deck-legacy/engine/domain/types';
import { catalog } from '@infrastructure/catalog/catalog';

/** Game definitions bundled with the app. */
export function getStoryCatalog(): GameCatalog {
  return catalog;
}

/** Builds instances for the base deck, keyed by instance id. */
export function baseInstances(): Record<number, CardInstance> {
  const entries = [...catalog.campaign, ...catalog.discoverable].sort((a, b) => a.id - b.id);
  return Object.fromEntries(
    entries.map(entry => [
      entry.id,
      createInstance(
        entry.id,
        entry.cardId,
        catalog.cards[entry.cardId].states[0].id,
        catalog.cards,
      ),
    ]),
  );
}

/** Minimal card instance for component stories. */
export function makeInstance(overrides?: Partial<CardInstance>): CardInstance {
  return {
    id: 1,
    cardId: 1,
    stateId: 1,
    stickers: {},
    trackProgress: [],
    cumulated: 0,
    usedActionIds: [],
    glories: [],
    removedResourcesByState: {},
    ...overrides,
  };
}
