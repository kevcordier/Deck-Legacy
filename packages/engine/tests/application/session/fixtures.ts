import type { GameSessionOptions } from '@engine/application/session/GameSession';
import { ActionEffectType, TargetScope } from '@engine/domain/enums';
import type { CardDef, GameCatalog } from '@engine/domain/types';

export const fieldCard: CardDef = {
  id: 1,
  name: 'Field',
  states: [
    {
      id: 1,
      name: 'Field',
      productions: [{ gold: 1 }],
      upgrade: [{ cost: { resources: [{ gold: 1 }] }, upgradeTo: 2 }],
    },
    { id: 2, name: 'Farm', productions: [{ gold: 2 }] },
  ],
};

export const workshopCard: CardDef = {
  id: 2,
  name: 'Workshop',
  states: [
    {
      id: 1,
      name: 'Workshop',
      actions: [
        {
          id: '2_1_1',
          actionEffects: [{ id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { wood: 1 } }],
        },
        {
          id: '2_1_2',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: { scope: [TargetScope.BOARD], pickNumber: 1 },
            },
          ],
        },
      ],
      upgrade: [
        { cost: { discard: [{ scope: [TargetScope.BOARD], pickNumber: 1 }] }, upgradeTo: 3 },
      ],
    },
    { id: 3, name: 'Factory' },
  ],
};

/**
 * Minimal catalog: ten starting cards and two to discover. The tutorial board is fixed to
 * instances 1, 5, 9 and 10, where 9 and 10 are workshops.
 */
export function makeCatalog(): GameCatalog {
  return {
    cards: { 1: fieldCard, 2: workshopCard },
    stickers: { 1: { id: 1, production: 'gold' } },
    deck: Array.from({ length: 12 }, (_, i) => ({ id: i + 1, cardId: i === 8 || i === 9 ? 2 : 1 })),
    expansions: {},
    stickerStock: { 1: 2 },
  };
}

export const DEFAULT_OPTIONS: GameSessionOptions = {
  allowCheats: false,
  unrestrictedRewind: false,
};
