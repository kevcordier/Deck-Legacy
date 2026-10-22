import { KNIGHT } from './romanceConstants';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const { WOOD, IRON } = ResourceType;
const TAGS = [CardTag.CRAFTING];

/** Wooden Planks (Foundations 98): crafted into the Round Table. */
export const roundTable: CardDef = {
  id: 271,
  name: 'Wooden Planks',
  states: [
    {
      id: 1,
      name: 'Wooden Planks',
      tags: TAGS,
      upgrade: [{ cost: { resources: [{ [WOOD]: 4 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Wooden Structure',
      tags: TAGS,
      upgrade: [{ cost: { resources: [{ [WOOD]: 2, [IRON]: 2 }] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Assembly',
      tags: TAGS,
      // Discard a Craftsman or 4 persons: the player chooses how to pay
      upgrade: [
        { cost: { discard: [{ name: 'Craftsman', pickNumber: 1 }] }, upgradeTo: 4 },
        { cost: { discard: [{ tags: [CardTag.PERSON], pickNumber: 4 }] }, upgradeTo: 4 },
      ],
    },
    {
      id: 4,
      name: 'The Round Table',
      tags: [CardTag.ITEM, CardTag.FURNITURE],
      glory: { amount: 10 },
      actions: [
        {
          id: '271-4-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { ...KNIGHT, scope: [TargetScope.DISCARD], pickNumber: 1 },
            },
          ],
        },
      ],
    },
  ],
};
