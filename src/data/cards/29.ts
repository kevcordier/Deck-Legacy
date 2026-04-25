import { CardTag, PassiveType, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const strengthInNumbers: CardDef = {
  id: 29,
  name: 'Strength in Numbers',
  chooseState: true,
  permanent: true,
  states: [
    {
      id: 1,
      name: 'Strength in Numbers',
      tags: [CardTag.GOAL],
      glory: 0,
      passives: [
        {
          id: 'pg',
          type: PassiveType.INCREASE_GLORY,
          valuePerElement: {
            glory: 2,
            cards: { scope: [TargetScope.ANY], tags: [CardTag.PERSON] },
            amount: 1,
          },
        },
      ],
    },
    {
      id: 2,
      name: 'Military Dominance',
      tags: [CardTag.GOAL],
      glory: 0,
      passives: [
        {
          id: 'pg',
          type: PassiveType.INCREASE_GLORY,
          valuePerElement: {
            glory: 2,
            productionTotal: ResourceType.WEAPON,
            amount: 1,
          },
        },
      ],
    },
  ],
};
