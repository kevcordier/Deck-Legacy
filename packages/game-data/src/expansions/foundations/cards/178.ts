import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef, CardState } from '@deck-legacy/engine/domain/types';

/** Quarantine actions: block up to `capacity` persons, and release one each turn. */
const quarantineActions = (stateId: number, capacity: number): CardAction[] => [
  {
    id: `178-${stateId}-1`,
    unlimited: true,
    condition: {
      type: 'cardCount',
      cards: { scope: [TargetScope.BLOCKED_BY_THIS] },
      max: capacity - 1,
    },
    actionEffects: [
      {
        id: 1,
        type: ActionEffectType.BLOCK_CARD,
        cards: { scope: [TargetScope.BOARD], tags: [CardTag.PERSON], pickNumber: 1 },
      },
    ],
  },
  {
    id: `178-${stateId}-2`,
    unlimited: true,
    perTurn: 1,
    actionEffects: [
      {
        id: 1,
        type: ActionEffectType.DISCARD_CARD,
        cards: { scope: [TargetScope.BLOCKED_BY_THIS], pickNumber: 1 },
      },
    ],
  },
];

const quarantine = (id: number, capacity: number, upgrade?: CardState['upgrade']): CardState => ({
  id,
  name: 'Quarantine',
  tags: [CardTag.PERMANENT],
  actions: quarantineActions(id, capacity),
  ...(upgrade && { upgrade }),
});

/** Quarantine (Foundations 5): upgrading it keeps the blocked persons. */
export const quarantineCard: CardDef = {
  id: 178,
  name: 'Setting Up Camps',
  states: [
    {
      id: 1,
      name: 'Setting Up Camps',
      tags: [CardTag.PERMANENT],
      upgrade: [{ cost: { resources: [{ [ResourceType.GOLD]: 4 }] }, upgradeTo: 2 }],
    },
    quarantine(2, 1, [
      {
        cost: { resources: [{ [ResourceType.WOOD]: 2, [ResourceType.GOLD]: 2 }] },
        upgradeTo: 3,
      },
    ]),
    quarantine(3, 2, [
      {
        cost: { resources: [{ [ResourceType.WOOD]: 3, [ResourceType.GOLD]: 3 }] },
        upgradeTo: 4,
      },
    ]),
    quarantine(4, 3),
  ],
};
