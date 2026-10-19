import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, CardState } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

const gold = (amount: number) => ({ resources: [{ [ResourceType.GOLD]: amount }] });

/** Camels (Merchants 2, 24 and 25): the Camel Herd discovers another Pair of Camels. */
export const camelStates = (cardId: number, pairOfCamelsIds: number[]): CardState[] => [
  {
    id: 1,
    name: 'Pair of Camels',
    tags: [CardTag.LIVESTOCK],
    productions: [{ [ResourceType.GOLD]: 1 }],
    upgrade: [{ cost: gold(2), upgradeTo: 2 }],
  },
  {
    id: 2,
    name: 'Camels',
    tags: [CardTag.LIVESTOCK],
    productions: [{ [ResourceType.GOLD]: 2 }],
    glory: { amount: 1 },
    upgrade: [{ cost: gold(3), upgradeTo: 3 }],
  },
  {
    id: 3,
    name: 'Camel Herd',
    tags: [CardTag.LIVESTOCK],
    productions: [{ [ResourceType.GOLD]: 2 }],
    glory: { amount: 3 },
    actions: [
      {
        id: `${cardId}-3-1`,
        endsTurn: true,
        actionEffects: [
          {
            id: 1,
            type: ActionEffectType.UPGRADE_CARD,
            cards: { scope: [TargetScope.SELF] },
            states: { ids: [1] },
          },
          {
            id: 2,
            type: ActionEffectType.DISCOVER_CARD,
            cards: { ids: pairOfCamelsIds, pickNumber: 1 },
          },
        ],
      },
    ],
    upgrade: [{ cost: gold(3), upgradeTo: 4 }],
  },
  {
    id: 4,
    name: 'Camel Caravan',
    tags: [CardTag.LIVESTOCK],
    productions: [{ [ResourceType.GOLD]: 2, [ResourceType.GOODS]: 1 }],
    glory: { amount: 5 },
    actions: [
      {
        id: `${cardId}-4-1`,
        trigger: Trigger.END_OF_TURN,
        optional: true,
        actionEffects: [
          {
            id: 1,
            type: ActionEffectType.ADD_BOARD_EFFECT,
            cards: { scope: [TargetScope.BOARD], tags: [CardTag.PERSON], pickMin: 0, pickMax: 1 },
            effect: CardPassives[PassiveType.STAY_IN_PLAY],
          },
        ],
      },
    ],
  },
];

export const camels: CardDef = {
  id: 151,
  name: 'Pair of Camels',
  // Pair of Camels (Merchants 24 / 25)
  states: camelStates(151, [191, 192]),
};
