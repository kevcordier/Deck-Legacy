import { CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const expandingBorders: CardDef = {
  id: 30,
  name: 'Expanding Borders',
  states: [
    {
      id: 1,
      name: 'Expanding Borders',
      tags: [CardTag.GOAL],
      glory: 0,
      passives: [
        // *You want 75 or more cards in your kingdom (not counting permanent cards). This is worth -2 for each card missing from 75.
      ],
    },
    {
      id: 2,
      name: 'Maximizer',
      tags: [CardTag.GOAL],
      glory: 0,
      passives: [
        // *Worth -1 per card with exactly 0 (excluding permanent cards).
      ],
    },
  ],
};
