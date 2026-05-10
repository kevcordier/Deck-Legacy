import { CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const horse: CardDef = {
  id: 97,
  name: 'Horse',
  states: [
    {
      id: 1,
      name: 'Horse',
      tags: [CardTag.LIVESTOCK, CardTag.HORSE],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/8fc14451-4731-4505-ab7a-b94f4f277fe5/450x%3Cauto%3E_so',
      productions: [{ gold: 1 }],
    },
  ],
};
