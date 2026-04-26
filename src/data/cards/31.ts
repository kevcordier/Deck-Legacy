import { CardTag, PassiveType, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const loyalty: CardDef = {
  id: 31,
  name: 'Loyalty',
  chooseState: true,
  permanent: true,
  states: [
    {
      id: 1,
      name: 'Loyalty',
      tags: [CardTag.GOAL],
      glory: 0,
      passives: [
        {
          id: '31_1_glory',
          type: PassiveType.INCREASE_GLORY,
          glory: 25,
          condition: { type: 'cardCount', cards: { tags: [CardTag.ENEMY] }, max: 0 },
        },
      ],
    },
    {
      id: 2,
      name: 'Trader',
      tags: [CardTag.GOAL],
      glory: 0,
      passives: [
        {
          id: '31_2_glory',
          type: PassiveType.INCREASE_GLORY,
          glory: 25,
          condition: { type: 'production', resourceType: ResourceType.GOODS, min: 10 },
        },
      ],
    },
  ],
};
