import { CardTag, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const mine: CardDef = {
  id: 70,
  name: 'Mine',
  states: [
    {
      id: 1,
      name: 'Mine',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/999f4252-a776-4516-b28b-ae1bacc5aa76/anim=false,width=450,optimized=true/00017-3322662124.jpeg',
      glory: { amount: 4 },
      productions: [
        {
          [ResourceType.STONE]: 1,
          [ResourceType.IRON]: 1,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 3,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Deep Mine',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/e46376a2-c341-42ce-839a-447f5df3da44/anim=false,width=450,optimized=true/W5B5360KVNA1E1FN8655QV9R90.jpeg',
      glory: { amount: 6 },
      productions: [
        {
          [ResourceType.STONE]: 1,
          [ResourceType.IRON]: 2,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
                [ResourceType.WOOD]: 3,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Ruby Mine',
      tags: [CardTag.BUILDING],
      glory: { amount: 9 },
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/f91e7435-4100-4203-8225-260d3185b941/450x%3Cauto%3E_so',
      productions: [
        {
          [ResourceType.STONE]: 1,
          [ResourceType.IRON]: 2,
          [ResourceType.GOODS]: 1,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
                [ResourceType.WOOD]: 2,
                [ResourceType.STONE]: 2,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Diamond Mine',
      glory: { amount: 13 },
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/5fb183b7-9592-4193-a1cc-0e9e3431f06e/anim=false,width=450,optimized=true/00061-2947438525.jpeg',
      productions: [
        {
          [ResourceType.STONE]: 1,
          [ResourceType.IRON]: 2,
          [ResourceType.GOODS]: 2,
        },
      ],
    },
  ],
};
