import { CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const etherCrystal: CardDef = {
  id: 92,
  name: 'Ether Crystal',
  states: [
    {
      id: 1,
      name: 'Ether Crystal',
      permanent: true,
      tags: [CardTag.ARTIFACT],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/10c16e56-d9f8-4466-9606-33bb3c68ecd2/450x%3Cauto%3E_so',
      glory: { amount: 10 },
      description: true,
    },
  ],
};
