import { CardTag, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const loyalty: CardDef = {
  id: 31,
  name: 'Loyalty',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Loyalty',
      permanent: true,
      tags: [CardTag.GOAL],
      illustration: 'cards/31_1.jpg',
      glory: {
        amount: 25,
        condition: { type: 'cardCount', cards: { tags: [CardTag.ENEMY] }, max: 0 },
      },
    },
    {
      id: 2,
      name: 'Trader',
      permanent: true,
      tags: [CardTag.GOAL],
      glory: {
        amount: 25,
        condition: { type: 'production', resourceType: ResourceType.GOODS, min: 10 },
      },
      illustration: 'cards/31_2.jpg',
    },
  ],
};
