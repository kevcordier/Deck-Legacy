import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const hill: CardDef = {
  id: 11,
  name: 'Hill',
  states: [
    {
      id: 1,
      name: 'Hill',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/0bd7af9f-e425-4ea7-a8a7-eb89823a3e80/anim=false,width=450,optimized=true/00110-3590513962.jpeg',
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 1,
                [ResourceType.WOOD]: 1,
                [ResourceType.STONE]: 1,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Chapel',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/4f400b8e-4ffd-4916-45fc-fe70f9617b00/width=450,quality=90/191194.jpeg',
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      glory: { amount: 1 },
      actions: [
        {
          id: '11-2-1',
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 3,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [103],
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
                [ResourceType.WOOD]: 2,
                [ResourceType.STONE]: 2,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Church',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/06e9ad48-aa32-475d-a4a7-a4b079629dd1/anim=false,width=450,optimized=true/00024-1545763525.jpeg',
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      glory: { amount: 3 },
      actions: [
        {
          id: '11-3-1',
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 4,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [104],
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
                [ResourceType.WOOD]: 2,
                [ResourceType.STONE]: 3,
                [ResourceType.IRON]: 1,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Cathedral',
      tags: [CardTag.BUILDING],
      illustration:
        'https://img.freepik.com/photos-gratuite/cathedrale-saint-guy-prague_1204-311.jpg?t=st=1776629221~exp=1776632821~hmac=d0994ce56b7381a1464409321dd0a0b545ffbdbb5c37adb8e15cd3d430b6174e&w=740',
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      glory: { amount: 7 },
      passives: [
        {
          id: 'increase_production',
          type: PassiveType.INCREASE_PRODUCTION,
          cards: {
            scope: [TargetScope.SELF],
          },
          valuePerElement: {
            resource: [ResourceType.GOLD],
            amount: 1,
            cards: {
              scope: [TargetScope.BOARD],
              tags: [CardTag.PERSON],
            },
          },
        },
      ],
    },
  ],
};
