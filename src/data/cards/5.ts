import { ActionEffectType, CardTag, ResourceType } from '@engine/domain/enums';
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
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
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
        'https://image-b2.civitai.com/file/civitai-media-cache/32b678bf-9e83-4cc3-8bd0-e39845becc76/450x%3Cauto%3E_so',
      glory: { amount: 1 },
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
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
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
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/7cc8814f-ba25-47ea-8066-9457ef651d28/anim=false,width=450,optimized=true/85KPN5KPHVH1N8RAJ9F8KPNTJ0.jpeg',
      glory: { amount: 3 },
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
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
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
        'https://image-b2.civitai.com/file/civitai-media-cache/717e986a-eed1-4023-9365-08512d055030/450x%3Cauto%3E_so',
      glory: { amount: 4 },
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
