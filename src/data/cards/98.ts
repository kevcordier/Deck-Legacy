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
      productions: [{ weapon: 1 }],
    },
  ],
};
