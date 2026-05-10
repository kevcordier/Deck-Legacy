import { CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const horse2: CardDef = {
  id: 98,
  name: 'Horse',
  states: [
    {
      id: 1,
      name: 'Horse',
      tags: [CardTag.LIVESTOCK, CardTag.HORSE],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/3dfbde0a-64b2-4297-bc35-8a06aa96eaa7/450x%3Cauto%3E_so',
      productions: [{ weapon: 1 }],
    },
  ],
};
