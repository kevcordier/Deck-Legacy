import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef, CardState } from '@deck-legacy/engine/domain/types';

const gold = (amount: number) => ({ resources: [{ [ResourceType.GOLD]: amount }] });

const spendTo = (id: string, amount: number, stateId: number): CardAction => ({
  id,
  cost: gold(amount),
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.UPGRADE_CARD,
      cards: { scope: [TargetScope.SELF] },
      states: { ids: [stateId] },
    },
  ],
});

/** Chickens (Merchants 11, 20 and 21): the Chicken Farm discovers another Chicken. */
export const chickenStates = (cardId: number, chickenIds: number[]): CardState[] => [
  {
    id: 1,
    name: 'Chicken',
    tags: [CardTag.LIVESTOCK],
    actions: [spendTo(`${cardId}-1-1`, 2, 2)],
    upgrade: [{ cost: gold(1), upgradeTo: 2 }],
  },
  {
    id: 2,
    name: 'Chicken Group',
    tags: [CardTag.LIVESTOCK],
    actions: [spendTo(`${cardId}-2-1`, 2, 3)],
    upgrade: [{ cost: gold(1), upgradeTo: 3 }],
  },
  {
    id: 3,
    name: 'Lots of Chicken',
    tags: [CardTag.LIVESTOCK],
    productions: [{ [ResourceType.GOLD]: 1 }],
    actions: [spendTo(`${cardId}-3-1`, 3, 4)],
    upgrade: [{ cost: gold(2), upgradeTo: 4 }],
  },
  {
    id: 4,
    name: 'Chicken Farm',
    tags: [CardTag.LIVESTOCK],
    productions: [{ [ResourceType.GOODS]: 1 }],
    actions: [
      {
        id: `${cardId}-4-1`,
        actionEffects: [
          {
            id: 1,
            type: ActionEffectType.UPGRADE_CARD,
            cards: { scope: [TargetScope.SELF] },
            states: { ids: [1] },
          },
          {
            id: 2,
            type: ActionEffectType.CHOOSE_EFFECT,
            effects: [
              {
                id: 1,
                type: ActionEffectType.DISCOVER_CARD,
                cards: { ids: chickenIds, pickNumber: 1 },
              },
              {
                id: 2,
                type: ActionEffectType.ADD_RESOURCES,
                resources: { [ResourceType.GOODS]: 8 },
              },
            ],
          },
        ],
      },
    ],
  },
];

export const chicken: CardDef = {
  id: 160,
  name: 'Chicken',
  // Chicken (Merchants 20 / 21)
  states: chickenStates(160, [187, 188]),
};
