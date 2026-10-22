import { CHURCH_CARDS } from './churchConstants';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const { GOLD, WOOD, STONE, IRON } = ResourceType;

/** Mountain Construction (Foundations 70): becomes the Cathedral, which finds the Archbishops. */
export const mountainConstruction: CardDef = {
  id: 243,
  name: 'Mountain Construction',
  states: [
    {
      id: 1,
      name: 'Mountain Construction',
      tags: [CardTag.BUILDING],
      upgrade: [
        { cost: { resources: [{ [GOLD]: 1, [WOOD]: 1, [STONE]: 2, [IRON]: 2 }] }, upgradeTo: 2 },
      ],
    },
    {
      id: 2,
      name: 'Cathedral Halls',
      tags: [CardTag.BUILDING],
      upgrade: [{ cost: { resources: [{ [IRON]: 2, [STONE]: 2, [WOOD]: 2 }] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Cathedral',
      tags: [CardTag.BUILDING],
      productions: [{ [GOLD]: 2 }],
      glory: { amount: 9 },
      actions: [
        {
          id: '243-3-1',
          endsTurn: true,
          condition: {
            type: 'cardCount',
            cards: { ids: [CHURCH_CARDS.archbishops], scope: [TargetScope.DISCOVERY] },
            min: 1,
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: { ids: [CHURCH_CARDS.archbishops] },
            },
          ],
        },
      ],
      upgrade: [{ cost: { resources: [{ [STONE]: 6, [IRON]: 2 }] }, upgradeTo: 4 }],
    },
    {
      id: 4,
      name: 'Basilica',
      tags: [CardTag.BUILDING, CardTag.BLESSED],
      productions: [{ [GOLD]: 2 }],
      glory: { amount: 25 },
    },
  ],
};
