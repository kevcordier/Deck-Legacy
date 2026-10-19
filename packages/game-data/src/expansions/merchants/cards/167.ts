import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, CardState } from '@deck-legacy/engine/domain/types';

const gold = (amount: number) => ({ resources: [{ [ResourceType.GOLD]: amount }] });

/** Sheep (Merchants 18, 22 and 23): the Sheep Flock discovers another Pair of Sheep. */
export const sheepStates = (cardId: number, pairOfSheepIds: number[]): CardState[] => [
  {
    id: 1,
    name: 'Pair of Sheep',
    tags: [CardTag.LIVESTOCK],
    illustration: 'cards/167_1.jpg',
    productions: [{ [ResourceType.GOLD]: 1 }],
    upgrade: [{ cost: gold(2), upgradeTo: 2 }],
  },
  {
    id: 2,
    name: 'Sheep Family',
    tags: [CardTag.LIVESTOCK],
    illustration: 'cards/167_2.jpg',
    productions: [{ [ResourceType.GOLD]: 2 }],
    glory: { amount: 1 },
    upgrade: [{ cost: gold(3), upgradeTo: 3 }],
  },
  {
    id: 3,
    name: 'Sheep Flock',
    tags: [CardTag.LIVESTOCK],
    illustration: 'cards/167_3.jpg',
    productions: [{ [ResourceType.GOLD]: 2 }],
    glory: { amount: 2 },
    actions: [
      {
        id: `${cardId}-3-1`,
        cost: { discard: [{ scope: [TargetScope.BOARD], tags: [CardTag.PERSON], pickNumber: 1 }] },
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
            cards: { ids: pairOfSheepIds, pickNumber: 1 },
          },
        ],
      },
    ],
    upgrade: [{ cost: gold(4), upgradeTo: 4 }],
  },
  {
    id: 4,
    name: 'Sheep Herd',
    tags: [CardTag.LIVESTOCK],
    illustration: 'cards/167_4.jpg',
    productions: [{ [ResourceType.GOLD]: 3 }],
    glory: { amount: 3 },
  },
];

export const sheep: CardDef = {
  id: 167,
  name: 'Pair of Sheep',
  // Pair of Sheep (Merchants 22 / 23)
  states: sheepStates(167, [189, 190]),
};
