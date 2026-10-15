import { CardTag, ResourceType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

export const strengthInNumbers: CardDef = {
  id: 29,
  name: 'Strength in Numbers',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Strength in Numbers',
      tags: [CardTag.GOAL, CardTag.PERMANENT],
      illustration: 'cards/29_1.jpg',
      glory: {
        amount: 0,
        valuePerElement: {
          cards: { scope: [TargetScope.ANY], tags: [CardTag.PERSON] },
          amount: 2,
        },
      },
    },
    {
      id: 2,
      name: 'Military Dominance',
      tags: [CardTag.GOAL, CardTag.PERMANENT],
      illustration: 'cards/29_2.jpg',
      glory: {
        amount: 0,
        valuePerElement: {
          productionTotal: ResourceType.WEAPON,
          amount: 2,
        },
      },
    },
  ],
};
