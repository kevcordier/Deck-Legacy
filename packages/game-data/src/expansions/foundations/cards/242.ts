import { blessCard } from './blessCard';
import { BLESSED } from './churchConstants';
import { CardTag, ResourceType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef } from '@deck-legacy/engine/domain/types';

const { GOLD, WOOD, STONE, IRON, HERB } = ResourceType;

const bless = (id: string): CardAction => ({
  id,
  endsTurn: true,
  limitedTime: 1,
  actionEffects: [blessCard(1)],
});

/** Overgrown Chapel (Foundations 69): blesses cards, then worth glory for each blessing. */
export const overgrownChapel: CardDef = {
  id: 242,
  name: 'Overgrown Chapel',
  states: [
    {
      id: 1,
      name: 'Overgrown Chapel',
      tags: [CardTag.BUILDING],
      productions: [{ [HERB]: 1 }],
      actions: [bless('242-1-1')],
      upgrade: [{ cost: { resources: [{ [GOLD]: 1, [WOOD]: 1, [STONE]: 2 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Small Abbey',
      tags: [CardTag.BUILDING, CardTag.LAND],
      productions: [{ [GOLD]: 1 }],
      actions: [bless('242-2-1')],
      upgrade: [{ cost: { resources: [{ [WOOD]: 2, [IRON]: 2 }] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Church Estate',
      tags: [CardTag.BUILDING, CardTag.LAND],
      productions: [{ [GOLD]: 2 }],
      actions: [bless('242-3-1')],
      upgrade: [{ cost: { resources: [{ [GOLD]: 6 }] }, upgradeTo: 4 }],
    },
    {
      id: 4,
      name: 'Church Property',
      tags: [CardTag.STATE],
      productions: [{ [GOLD]: 2 }],
      glory: {
        amount: 0,
        valuePerElement: { amount: 3, cards: { ...BLESSED, scope: [TargetScope.ANY] } },
      },
    },
  ],
};
