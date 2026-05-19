import { CardTag, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const royalConsort: CardDef = {
  id: 105,
  name: 'Royal Consort',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Royal Consort',
      tags: [CardTag.PERSON, CardTag.LADY],
      illustration: 'cards/105_1.jpg',
      productions: [
        {
          [ResourceType.GOLD]: 1,
          [ResourceType.GOODS]: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Royal Consort',
      tags: [CardTag.PERSON, CardTag.KNIGHT],
      illustration: 'cards/105_2.jpg',
      productions: [
        {
          [ResourceType.WOOD]: 1,
          [ResourceType.STONE]: 1,
        },
      ],
    },
  ],
};
