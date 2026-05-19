import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const engineer: CardDef = {
  id: 25,
  name: 'Engineer',
  states: [
    {
      id: 1,
      name: 'Engineer',
      tags: [CardTag.PERSON],
      illustration: 'cards/25_1.jpg',
      actions: [
        {
          id: '25-1-1',
          limitedTime: 1,
          cost: {
            destroy: {
              scope: [TargetScope.BOARD],
              name: 'Lumberjack',
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [100],
              },
            },
          ],
        },
        {
          id: '25-1-2',
          limitedTime: 1,
          cost: {
            destroy: {
              scope: [TargetScope.BOARD],
              name: 'Food Barns',
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [101],
              },
            },
          ],
        },
        {
          id: '25-1-3',
          limitedTime: 1,
          cost: {
            destroy: {
              scope: [TargetScope.BOARD],
              name: 'Fishing Boat',
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [102],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                wood: 2,
                iron: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Trebuchet',
      tags: [CardTag.BUILDING],
      illustration: 'cards/25_2.jpg',
      productions: [
        {
          weapon: 1,
        },
      ],
      actions: [
        {
          id: '25-2-1',
          cost: {
            destroy: {
              scope: [TargetScope.SELF],
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                tags: [CardTag.ENEMY],
                scope: [TargetScope.BOARD, TargetScope.DISCARD, TargetScope.PERMANENTS],
              },
            },
            {
              id: 2,
              type: ActionEffectType.TRACK_ADVANCE,
              payingCost: false,
              cards: {
                ids: [25],
              },
            },
          ],
        },
      ],
    },
  ],
};
