import { CardTag, PassiveType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const expandingBorders: CardDef = {
  id: 30,
  name: 'Expanding Borders',
  chooseState: true,
  permanent: true,
  states: [
    {
      id: 1,
      name: 'Expanding Borders',
      tags: [CardTag.GOAL],
      glory: 0,
      passives: [
        {
          id: '30_1_glory',
          type: PassiveType.INCREASE_GLORY,
          valuePerElement: {
            amount: 1,
            glory: -2,
            cards: { scope: [TargetScope.BOARD, TargetScope.DECK, TargetScope.DISCARD] },
            deficitTarget: 75,
          },
        },
      ],
    },
    {
      id: 2,
      name: 'Maximizer',
      tags: [CardTag.GOAL],
      glory: 0,
      passives: [
        {
          id: '30_2_glory',
          type: PassiveType.INCREASE_GLORY,
          valuePerElement: {
            amount: 1,
            glory: -1,
            cards: {
              scope: [TargetScope.BOARD, TargetScope.DECK, TargetScope.DISCARD],
              having: { minGlory: 0, maxGlory: 0 },
            },
          },
        },
      ],
    },
  ],
};
