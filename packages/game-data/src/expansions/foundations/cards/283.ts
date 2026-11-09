import { CardTag, ResourceType } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const { GOLD, GOODS } = ResourceType;
const TAGS = [CardTag.INVENTION];

/** Spinning Wheel (Foundations 110). */
export const spinningWheel: CardDef = {
  id: 283,
  name: 'Spinning Wheel',
  states: [
    {
      id: 1,
      name: 'Spinning Wheel',
      illustration: 'cards/283_1.jpg',
      tags: TAGS,
      glory: { amount: 2 },
      upgrade: [{ cost: { resources: [{ [GOLD]: 2 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Silk',
      illustration: 'cards/283_2.jpg',
      tags: TAGS,
      productions: [{ [GOODS]: 1 }],
      glory: { amount: 4 },
      upgrade: [{ cost: { resources: [{ [GOLD]: 3 }] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Cloth Export',
      illustration: 'cards/283_3.jpg',
      tags: TAGS,
      productions: [{ [GOODS]: 2 }],
      glory: { amount: 6 },
      upgrade: [{ cost: { resources: [{ [GOLD]: 4 }] }, upgradeTo: 4 }],
    },
    {
      id: 4,
      name: 'Fashion',
      illustration: 'cards/283_4.jpg',
      tags: TAGS,
      productions: [{ [GOODS]: 3 }],
      glory: { amount: 10 },
    },
  ],
};
