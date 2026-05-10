import { CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const jewelExtraction: CardDef = {
  id: 107,
  name: 'Jewel Extraction',
  states: [
    {
      id: 1,
      name: 'Jewel Extraction',
      tags: [CardTag.EVENT],
      illustration:
        'https://img.magnific.com/premium-photo/crystal-cave-with-glittering-gems-mining-tools-dark-tunnel_908344-221097.jpg?w=2000',
      glory: { amount: 15 },
      productions: [{ stone: 1, iron: 2, goods: 2 }],
      upgrade: [
        {
          cost: {
            resources: [
              {
                wood: 2,
                iron: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Jewel Cutting',
      tags: [CardTag.EVENT],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/697b1a4d-8707-40eb-a2c8-2b8f2562dce1/450x%3Cauto%3E_so',
      glory: { amount: 18 },
      productions: [{ iron: 2, goods: 3 }],
      upgrade: [
        {
          cost: {
            resources: [
              {
                wood: 3,
                iron: 2,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Jewel Polishing',
      tags: [CardTag.EVENT],
      illustration:
        'https://img.magnific.com/premium-photo/medieval-jewelers-workshop-with-jeweler-crafting-intricate-pieces-jewelry-gemstones_1314467-216391.jpg?w=2000',
      glory: { amount: 21 },
      productions: [{ iron: 3, goods: 4 }],
      upgrade: [
        {
          cost: {
            resources: [
              {
                wood: 2,
                iron: 4,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Jewel Exhibit',
      illustration:
        'https://img.magnific.com/free-photo/view-church-architectural-elements_23-2150319341.jpg?t=st=1778400740~exp=1778404340~hmac=60a73e5b46182803e62940410b8f381512fa23cbd259f901e58c574294ee6b6d&w=2000',
      tags: [CardTag.EVENT],
      glory: { amount: 25 },
      productions: [{ iron: 3, goods: 6 }],
    },
  ],
};
