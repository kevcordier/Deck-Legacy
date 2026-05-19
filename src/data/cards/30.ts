import { CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const expandingBorders: CardDef = {
  id: 30,
  name: 'Expanding Borders',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Expanding Borders',
      permanent: true,
      tags: [CardTag.GOAL],
      illustration: 'cards/30_1.jpg',
      glory: {
        amount: 0,
        valuePerElement: {
          amount: -2,
          cards: { scope: [TargetScope.BOARD, TargetScope.DECK, TargetScope.DISCARD] },
          deficitTarget: 75,
        },
      },
    },
    {
      id: 2,
      name: 'Maximizer',
      permanent: true,
      tags: [CardTag.GOAL],
      illustration: 'cards/30_2.jpg',
      glory: {
        amount: 0,
        valuePerElement: {
          amount: -1,
          cards: {
            scope: [TargetScope.BOARD, TargetScope.DECK, TargetScope.DISCARD],
            having: { minGlory: 0, maxGlory: 0 },
          },
        },
      },
    },
  ],
};
