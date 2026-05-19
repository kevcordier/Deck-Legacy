import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const mightyMound: CardDef = {
  id: 43,
  name: 'Mighty Mound',
  states: [
    {
      id: 1,
      name: 'Mighty Mound',
      illustration: 'cards/43_1.jpg',
      tags: [CardTag.LAND],
      upgrade: [
        {
          upgradeTo: 2,
          cost: {
            resources: [
              {
                wood: 3,
              },
            ],
          },
        },
      ],
    },
    {
      id: 2,
      name: 'Hill Settlement',
      illustration: 'cards/43_2.jpg',
      tags: [CardTag.LAND],
      productions: [
        {
          gold: 1,
        },
      ],
      glory: { amount: 1 },
      upgrade: [
        {
          upgradeTo: 3,
          cost: {
            resources: [
              {
                wood: 4,
              },
            ],
          },
        },
      ],
    },
    {
      id: 3,
      name: 'Hill Village',
      illustration: 'cards/43_3.jpg',
      tags: [CardTag.LAND],
      productions: [
        {
          gold: 2,
        },
      ],
      glory: { amount: 3 },
      upgrade: [
        {
          upgradeTo: 4,
          cost: {
            resources: [
              {
                wood: 4,
                stone: 2,
              },
            ],
          },
        },
      ],
    },
    {
      id: 4,
      name: 'Peak Village',
      illustration: 'cards/43_4.jpg',
      tags: [CardTag.LAND],
      productions: [
        {
          gold: 2,
          goods: 1,
        },
      ],
      glory: { amount: 6 },
      actions: [
        {
          id: '43-4-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [105],
              },
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [1] },
            },
          ],
        },
      ],
    },
  ],
};
