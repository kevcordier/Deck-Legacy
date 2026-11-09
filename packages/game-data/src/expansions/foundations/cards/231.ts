import { CardTag, ResourceType } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const { WOOD, STONE, IRON, SCIENCE } = ResourceType;

/** University (Foundations 58). */
export const university: CardDef = {
  id: 231,
  name: 'Small University',
  states: [
    {
      id: 1,
      name: 'Small University',
      illustration: 'cards/231_1.jpg',
      tags: [CardTag.BUILDING],
      productions: [{ [SCIENCE]: 1 }],
      glory: { amount: 10 },
      upgrade: [{ cost: { resources: [{ [WOOD]: 2, [STONE]: 4 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'University',
      illustration: 'cards/231_2.jpg',
      tags: [CardTag.BUILDING],
      productions: [{ [SCIENCE]: 2 }],
      glory: { amount: 15 },
      upgrade: [{ cost: { resources: [{ [STONE]: 4, [WOOD]: 2, [SCIENCE]: 2 }] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Large University',
      illustration: 'cards/231_3.jpg',
      tags: [CardTag.BUILDING],
      productions: [{ [SCIENCE]: 3 }],
      glory: { amount: 20 },
      upgrade: [
        { cost: { resources: [{ [SCIENCE]: 3, [WOOD]: 3, [STONE]: 3, [IRON]: 3 }] }, upgradeTo: 4 },
      ],
    },
    {
      id: 4,
      name: 'Grand University',
      illustration: 'cards/231_4.jpg',
      tags: [CardTag.BUILDING],
      productions: [{ [SCIENCE]: 3 }],
      glory: { amount: 40 },
    },
  ],
};
