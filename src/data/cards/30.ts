import { CardTag, TargetScope } from '@engine/domain/enums';
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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/76e68596-9d6c-422e-b53e-5023ee4acf6a/anim=false,width=450,optimized=true/QNJZN7FBRJKAWGVWSK8KPS12Y0.jpeg',
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
      tags: [CardTag.GOAL],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/50c07b7a-3b6e-49b5-9f2e-50feba86b08b/anim=false,width=450,optimized=true/8HW4NMGVMG4ZEJ1NW0QY2N8510.jpeg',
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
