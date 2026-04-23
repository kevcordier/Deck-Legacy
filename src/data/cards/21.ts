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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/c12a02d0-79cd-47c1-b195-94f2e0e444ec/anim=false,width=450,optimized=true/00117-986065314.jpeg',
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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/c8f1ef64-e962-4a72-97dc-ce4e70f7b348/anim=false,width=450,optimized=true/Lord_Gregor_v3_e000001_00_20240905010258.jpeg',
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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/7978ebae-e0d9-41d1-943c-56ef4695d315/anim=false,width=450,optimized=true/00012-2389527807.jpeg',
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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/abcf9ccc-0cca-4cb7-84d1-2e5a0807a0d5/anim=false,width=450,optimized=true/9Z4R6XWBR9XGPJ1QTZAZJKJFA0.jpeg',
      tags: [CardTag.PERSON],
      glory: 4,
      actions: [
        {
          id: '21-4-a0',
          actionEffects: [
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
