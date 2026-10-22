import { equipAction } from './equipAction';
import { flipTo } from './flipTo';
import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, Resources } from '@deck-legacy/engine/domain/types';

const { GOLD, WOOD, STONE, IRON, SCIENCE } = ResourceType;
const CRANE = 344;
/** The spots: Hard Work, Structure, Mechanics, Chains, Counter Weight. */
const SPOTS: Resources[] = [
  { [GOLD]: 4 },
  { [IRON]: 3 },
  { [SCIENCE]: 2, [WOOD]: 2 },
  { [SCIENCE]: 1, [IRON]: 2 },
  { [STONE]: 4 },
];
const buildings = { scope: [TargetScope.ANY], tags: [CardTag.BUILDING] };

/** Crane Construction (Foundations 153): becomes the Crane, a land's equipment. */
export const craneConstruction: CardDef = {
  id: 326,
  name: 'Crane Construction',
  states: [
    {
      id: 1,
      name: 'Crane Construction',
      tags: [CardTag.PERMANENT],
      track: {
        inOrder: false,
        steps: SPOTS.map((resources, index) => ({
          id: index + 1,
          cost: { resources: [resources] },
        })),
      },
      actions: [
        {
          // Spend the resources of any 1 spot to mark it
          id: '326-1-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: { scope: [TargetScope.SELF] },
              steps: { pickNumber: 1 },
            },
          ],
        },
        {
          // When complete, you may turn this
          id: '326-1-2',
          unlimited: true,
          condition: {
            type: 'cardCount',
            cards: { ids: [CRANE], scope: [TargetScope.SELF, TargetScope.WITH_TRACK] },
            max: 0,
          },
          actionEffects: [flipTo(1, 2)],
        },
      ],
    },
    {
      id: 2,
      name: 'Crane',
      tags: [CardTag.BUILDING, CardTag.INVENTION],
      equip: CardTag.LAND,
      glory: { amount: 5 },
      passives: [
        // Upgrading buildings costs 2 less resources (the player chooses which)
        { id: '326-2-1', type: PassiveType.ADJUST_UPDATE_COST, amount: 2, cards: buildings },
        // When you upgrade a building, place it at the bottom of your deck
        { id: '326-2-2', type: PassiveType.UPGRADED_TO_BOTTOM_OF_DECK, cards: buildings },
      ],
      actions: [equipAction('326-2-1', CardTag.LAND, CRANE)],
    },
  ],
};
