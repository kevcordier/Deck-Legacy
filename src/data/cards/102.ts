import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const smallSchool: CardDef = {
  id: 102,
  name: 'Small School',
  states: [
    {
      id: 1,
      name: 'Small School',
      illustration: 'cards/102_1.jpg',
      tags: [CardTag.BUILDING],
      actions: [
        {
          id: '102-1-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.BOARD, TargetScope.UPGRADABLE],
                tags: [CardTag.PERSON],
              },
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [2] },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'School',
      illustration: 'cards/102_2.jpg',
      tags: [CardTag.BUILDING],
      actions: [
        {
          id: '102-2-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.BOARD, TargetScope.UPGRADABLE],
                tags: [CardTag.PERSON],
              },
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [3] },
            },
          ],
        },
      ],
    },
    {
      id: 3,
      name: 'Prominent School',
      illustration: 'cards/102_3.jpg',
      tags: [CardTag.BUILDING],
      glory: { amount: 4 },
      actions: [
        {
          id: '102-3-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              cards: {
                scope: [TargetScope.BOARD],
                tags: [CardTag.PERSON],
                pickMin: 1,
                pickNumber: 1,
              },
              stickers: { ids: [1, 2, 3, 4, 5, 6] },
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [4] },
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: 'Renowned School',
      illustration: 'cards/102_4.jpg',
      tags: [CardTag.BUILDING],
      glory: { amount: 6 },
      actions: [
        {
          id: '102-4-1',
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              cards: {
                scope: [TargetScope.BOARD],
                tags: [CardTag.PERSON],
              },
              stickers: { ids: [1, 2, 3, 4, 5, 6] },
            },
          ],
        },
      ],
    },
  ],
};
