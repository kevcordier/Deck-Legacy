import { CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const darkKnight: CardDef = {
  id: 36,
  name: 'Dark Knight',
  states: [
    {
      id: 1,
      name: 'Dark Knight',
      tags: [CardTag.ENEMY],
      negative: true,
      glory: { amount: -3 },
    },
  ],
};
