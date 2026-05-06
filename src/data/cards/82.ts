import { CardTag, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const spinningWheel: CardDef = {
  id: 82,
  name: 'Spinning Wheel',
  states: [
    {
      id: 1,
      name: 'Spinning Wheel',
      tags: [CardTag.INVENTION],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/c76fbe09-2cee-4464-8488-165767170935/450x%3Cauto%3E_so',
      glory: { amount: 2 },
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Silk',
      tags: [CardTag.INVENTION],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/4431f03e-6043-429e-984e-572e2639628c/original',
      glory: { amount: 4 },
      productions: [
        {
          [ResourceType.GOODS]: 1,
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
      name: 'Cloth Export',
      tags: [CardTag.INVENTION],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/423ea154-147b-4d30-bb29-25b56327b06d/450x%3Cauto%3E_so_hm',
      glory: { amount: 6 },
      productions: [
        {
          [ResourceType.GOODS]: 2,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 4,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Fashion',
      tags: [CardTag.INVENTION],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/691118ed-8eb7-479b-9ef0-2b6812e7eb38/450x%3Cauto%3E_so',
      glory: { amount: 10 },
      productions: [
        {
          [ResourceType.GOODS]: 3,
        },
      ],
    },
  ],
};
