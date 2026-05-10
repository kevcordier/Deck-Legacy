import { CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const horse3: CardDef = {
  id: 99,
  name: 'Horse',
  states: [
    {
      id: 1,
      name: 'Horse',
      tags: [CardTag.LIVESTOCK, CardTag.HORSE],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/4f8ef6b5-6f1a-47d4-bd5d-1f22f833cde7/450x%3Cauto%3E_so',
      productions: [{ wood: 1 }, { stone: 1 }],
    },
  ],
};
