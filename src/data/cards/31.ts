import { CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const loyalty: CardDef = {
  id: 31,
  name: 'Loyalty',
  states: [
    {
      id: 1,
      name: 'Loyalty',
      tags: [CardTag.GOAL],
      glory: 0,
      passives: [
        // *Worth 25 if there is no enemy in your kingdom.
      ],
    },
    {
      id: 2,
      name: 'Trader',
      tags: [CardTag.GOAL],
      glory: 0,
      passives: [
        // *Worth 25 if your production of is 10 or more.
      ],
    },
  ],
};
