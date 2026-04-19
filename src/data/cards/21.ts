import { ActionType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const opportunist: CardDef = {
  id: 21,
  name: 'Opportunist',
  states: [
    {
      id: 1,
      name: 'Opportunist',
      tags: [CardTag.PERSON],
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
      tags: [CardTag.PERSON],
      glory: 4,
      actions: [
        {
          id: '21-4-a0',
          actions: [
            {
              id: 1,
              type: ActionType.ADD_STICKER,
              cards: {
                scope: TargetScope.SELF,
              },
              states: [1, 2, 3], // scope state without stickers
              stickerIds: [1, 2, 3, 4, 5, 6],
            },
            {
              id: 2,
              type: ActionType.CHOOSE_STATE,
              cards: {
                scope: TargetScope.SELF,
              },
              states: [1],
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
