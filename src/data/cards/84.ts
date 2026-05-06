import { CardTag, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const publicPunishment: CardDef = {
  id: 84,
  name: 'Public Punishment',
  states: [
    {
      id: 1,
      name: 'Public Punishment',
      tags: [CardTag.INVENTION],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/f30692a0-9892-49bc-825c-552764945bbf/450x%3Cauto%3E_so',
      glory: { amount: -2 },
      productions: [{ [ResourceType.WEAPON]: 1 }],
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.IRON]: 2 }] },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Torture Device',
      tags: [CardTag.INVENTION, CardTag.ITEM],
      illustration:
        'https://upload.wikimedia.org/wikipedia/commons/c/cb/Diverse_torture_instruments.jpg',
      glory: { amount: -3 },
      productions: [{ [ResourceType.WEAPON]: 1, [ResourceType.GOODS]: 1 }],
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.IRON]: 4 }] },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Torture Chamber',
      tags: [CardTag.BUILDING],
      illustration:
        'https://upload.wikimedia.org/wikipedia/commons/4/46/Verscheiden_wijzen_van_pijnigen_bij_de_inquisitie_gebruikelijk.jpg',
      glory: { amount: -6 },
      productions: [{ [ResourceType.WEAPON]: 2 }],
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.GOLD]: 6 }] },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Post-Barbaric',
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/77afb952-e38b-4645-b3d4-1e1ef61ef77d/450x%3Cauto%3E_so_hm',
      tags: [CardTag.STATE],
      glory: { amount: 15 },
    },
  ],
};
