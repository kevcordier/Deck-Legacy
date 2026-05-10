import { CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const pineForest: CardDef = {
  id: 109,
  name: 'Pine Forest',
  chooseState: [1, 3],
  states: [
    {
      id: 1,
      name: 'Pine Forest',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/bbfe0c93-fbe9-4944-a061-82864bdb5c4c/450x%3Cauto%3E_so',
      productions: [{ wood: 1 }],
      upgrade: [
        {
          cost: { resources: [{ gold: 2, iron: 1 }] },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Pine Forest',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/21875ecc-32ed-41c2-8de4-b4747a08201d/450x%3Cauto%3E_so_hm',
      productions: [{ wood: 2 }],
      glory: { amount: 1 },
    },
    {
      id: 3,
      name: 'Pond',
      tags: [CardTag.LAND],
      illustration:
        'https://img.magnific.com/free-photo/tranquil-forest-pond-reflects-autumn-foliage-beauty-generated-by-ai_188544-37884.jpg?t=st=1778401597~exp=1778405197~hmac=6817cdf4f1d170f5100635307ebad6174d904613c7fb5e090db83c9fda1ad539&w=2000',
      productions: [{ gold: 1 }],
      upgrade: [
        {
          cost: { resources: [{ wood: 4 }] },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Fish Pond',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/ef357c76-23f4-4e41-bd92-affafbabc714/450x%3Cauto%3E_so',
      productions: [{ gold: 2, goods: 1 }],
      glory: { amount: 1 },
    },
  ],
};
