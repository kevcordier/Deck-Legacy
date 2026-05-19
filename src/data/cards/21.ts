import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const opportunist: CardDef = {
  id: 21,
  name: 'Opportunist',
  states: [
    {
      id: 1,
      name: 'Opportunist',
      tags: [CardTag.PERSON],
      illustration: 'cards/21_1.jpg',
      productions: [{ gold: 1 }],
      upgrade: [
        {
          cost: {},
          upgradeTo: 2,
        },
        {
          cost: {},
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 2,
      name: 'Recruit',
      tags: [CardTag.PERSON],
      illustration: 'cards/21_2.jpg',
      productions: [{ weapon: 1 }],
      upgrade: [
        {
          cost: {},
          upgradeTo: 1,
        },
        {
          cost: {},
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 3,
      name: 'Labourer',
      tags: [CardTag.PERSON],
      illustration: 'cards/21_3.jpg',
      productions: [{ stone: 1 }],
      upgrade: [
        {
          cost: {},
          upgradeTo: 1,
        },
        {
          cost: {},
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Pretend Nobel',
      illustration: 'cards/21_4.jpg',
      tags: [CardTag.PERSON],
      glory: { amount: 4 },
      actions: [
        {
          id: '21-4-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [1, 2, 3, 4], having: { maxStickers: 0 } },
              stickers: { ids: [1, 2, 3, 4, 5, 6] },
            },
            {
              id: 2,
              type: ActionEffectType.CHOOSE_STATE,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [1] },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {},
          upgradeTo: 2,
        },
        {
          cost: {},
          upgradeTo: 3,
        },
      ],
    },
  ],
};
