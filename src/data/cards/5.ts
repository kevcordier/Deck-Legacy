import { ActionType, CardTag, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const trader: CardDef = {
  id: 5,
  name: 'Trader',
  states: [
    {
      id: 1,
      name: 'Trader',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/a3c75bb9-fce0-4f97-835b-bab57310e6d3/width=450,quality=90/cyberxl21_41.jpeg',
      actions: [
        {
          id: '5-1-1',
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 1,
              },
            ],
          },
          actions: [
            {
              id: 1,
              type: ActionType.ADD_RESOURCES,
              resources: {
                [ResourceType.WOOD]: 1,
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
                [ResourceType.GOLD]: 3,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Bazaar',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/90745e0d-7ca2-417d-9453-579e41b10885/anim=false,width=450,optimized=true/00006-3168783046.jpeg',
      glory: 1,
      actions: [
        {
          id: '5-2-1',
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 1,
              },
            ],
          },
          actions: [
            {
              id: 1,
              type: ActionType.ADD_RESOURCES,
              resources: {
                choice: [
                  {
                    [ResourceType.WOOD]: 1,
                  },
                  {
                    [ResourceType.STONE]: 1,
                  },
                ],
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
                [ResourceType.GOLD]: 3,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Market',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/72551fc7-1c5d-4693-b553-0f08265c85b2/width=450,quality=90/7AJB24JBKRCX20WQGBAC85VPQ0.jpeg',
      glory: 3,
      actions: [
        {
          id: '5-3-1',
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 1,
              },
            ],
          },
          actions: [
            {
              id: 1,
              type: ActionType.ADD_RESOURCES,
              resources: {
                choice: [
                  {
                    [ResourceType.WOOD]: 1,
                  },
                  {
                    [ResourceType.STONE]: 1,
                  },
                  {
                    [ResourceType.IRON]: 1,
                  },
                ],
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
                [ResourceType.GOLD]: 5,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Festival',
      tags: [CardTag.EVENT],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/e6224f49-a89d-4180-8ac3-2264855ced51/width=450,quality=90/00013-2617315028.jpeg',
      glory: 4,
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
        {
          [ResourceType.WOOD]: 1,
        },
        {
          [ResourceType.STONE]: 1,
        },
        {
          [ResourceType.IRON]: 1,
        },
      ],
    },
  ],
};
