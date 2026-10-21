import { loadGameCatalog } from '../src';
import { getStateActions } from '@deck-legacy/engine/domain/cards/selection/getStateActions';
import { resolveActionEffect } from '@deck-legacy/engine/domain/effects/resolveActionEffect';
import { ResourceType } from '@deck-legacy/engine/domain/enums';
import { createInstance } from '@deck-legacy/engine/domain/factory';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/state/emptyState';
import type { GameState } from '@deck-legacy/engine/domain/types';
import { describe, expect, it } from 'vitest';

const catalog = loadGameCatalog();
// Instance id of the base deck (deck.json): the Traveller (card 41)
const TRAVELLER = 50;

describe('Traveller, last state', () => {
  it('offers any resource, goods included', () => {
    const instance = createInstance(TRAVELLER, 41, 4, catalog.cards);
    const state: GameState = {
      ...(JSON.parse(JSON.stringify(EMPTY_STATE)) as GameState),
      instances: { [TRAVELLER]: instance },
    };
    const action = getStateActions(instance, catalog.cards, catalog.stickers).find(
      a => a.id === '41-4-2',
    );
    const [, pending] = resolveActionEffect(
      action?.actionEffects[0] ?? { id: 0, type: 'ADD_RESOURCES' as never },
      TRAVELLER,
      state,
      catalog.cards,
      catalog.stickers,
    );
    expect(pending[0].choices).toEqual(
      [
        ResourceType.GOLD,
        ResourceType.WOOD,
        ResourceType.STONE,
        ResourceType.IRON,
        ResourceType.WEAPON,
        ResourceType.GOODS,
      ].map(type => ({ [type]: 1 })),
    );
  });
});
