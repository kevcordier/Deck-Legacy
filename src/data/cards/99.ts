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
      illustration: 'cards/99_1.jpg',
      productions: [{ wood: 1 }, { stone: 1 }],
    },
  ],
};
