import { CardTag, ResourceType } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

export const loyalty: CardDef = {
  id: 31,
  name: 'Loyalty',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Loyalty',
      tags: [CardTag.GOAL, CardTag.PERMANENT],
      illustration: 'cards/31_1.jpg',
      glory: {
        amount: 25,
        condition: { type: 'cardCount', cards: { tags: [CardTag.ENEMY] }, max: 0 },
      },
    },
    {
      id: 2,
      name: 'Trader',
      tags: [CardTag.GOAL, CardTag.PERMANENT],
      glory: {
        amount: 25,
        condition: { type: 'production', resourceType: ResourceType.GOODS, min: 10 },
      },
      illustration: 'cards/31_2.jpg',
    },
  ],
};
