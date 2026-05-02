import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const smallSchool: CardDef = {
  id: 102,
  name: 'Small School',
  states: [
    {
      id: 1,
      name: 'Small School',
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
                scope: [TargetScope.BOARD],
                tags: [CardTag.PERSON],
              },
              states: [1, 2, 3, 4],
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: [2],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'School',
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
                scope: [TargetScope.BOARD],
                tags: [CardTag.PERSON],
              },
              states: [1, 2, 3, 4],
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: [3],
            },
          ],
        },
      ],
    },
    {
      id: 3,
      name: 'Prominent School',
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
              },
              stickerIds: [1, 2, 3, 4, 5, 6],
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: [4],
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: 'Renowned School',
      tags: [CardTag.BUILDING],
      glory: { amount: 6 },
      actions: [
        {
          id: '102-4-1',
          onTime: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              cards: {
                scope: [TargetScope.BOARD],
                tags: [CardTag.PERSON],
              },
              stickerIds: [1, 2, 3, 4, 5, 6],
            },
          ],
        },
      ],
    },
  ],
};
