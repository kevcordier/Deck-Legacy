import { CardTag, ResourceType } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const { GOLD, WOOD, STONE } = ResourceType;
const TAGS = [CardTag.BUILDING];

/** Statue (Foundations 116–119, 4 identical copies): a Golden Pillar project. */
export const goldenPillar: CardDef = {
  id: 289,
  name: 'Statue',
  states: [
    {
      id: 1,
      name: 'Statue',
      tags: TAGS,
      glory: { amount: 2 },
      upgrade: [{ cost: { resources: [{ [STONE]: 4 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Monument',
      tags: TAGS,
      glory: { amount: 5 },
      upgrade: [{ cost: { resources: [{ [STONE]: 4, [WOOD]: 2 }] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Obelisk',
      tags: TAGS,
      glory: { amount: 10 },
      upgrade: [{ cost: { resources: [{ [GOLD]: 6 }] }, upgradeTo: 4 }],
    },
    { id: 4, name: 'Golden Pillar', tags: TAGS, glory: { amount: 15 } },
  ],
};
