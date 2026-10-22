import { flipTo } from './flipTo';
import { KNIGHT } from './romanceConstants';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef, CardSelector } from '@deck-legacy/engine/domain/types';

const { WOOD, IRON } = ResourceType;
const TAGS = [CardTag.CRAFTING];

/** "Upgrade: discard a Craftsman or 4 persons": one action per way to pay. */
const assemble = (id: string, discard: CardSelector): CardAction => ({
  id,
  endsTurn: true,
  cost: { discard: [discard] },
  actionEffects: [flipTo(1, 4)],
});

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
      actions: [
        assemble('271-3-1', { name: 'Craftsman', pickNumber: 1 }),
        assemble('271-3-2', { tags: [CardTag.PERSON], pickNumber: 4 }),
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
