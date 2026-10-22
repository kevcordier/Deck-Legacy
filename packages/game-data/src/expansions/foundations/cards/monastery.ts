import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef } from '@deck-legacy/engine/domain/types';

const W = ResourceType.WOOD;
const S = ResourceType.STONE;
const G = ResourceType.GOLD;

/** Discover the Student `instanceId`, while it is still in the box. */
const discoverStudent = (id: string, instanceId: number): CardAction => ({
  id,
  endsTurn: true,
  condition: {
    type: 'cardCount',
    cards: { ids: [instanceId], scope: [TargetScope.DISCOVERY] },
    min: 1,
  },
  actionEffects: [{ id: 1, type: ActionEffectType.DISCOVER_CARD, cards: { ids: [instanceId] } }],
});

/** Small Chapel → Monastery → Renowned Monastery, each Monastery discovering a Student. */
export const monastery = (id: number, students: [number, number]): CardDef => ({
  id,
  name: 'Small Chapel',
  states: [
    {
      id: 1,
      name: 'Small Chapel',
      tags: [CardTag.BUILDING],
      upgrade: [{ cost: { resources: [{ [W]: 2, [S]: 2 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Monastery',
      tags: [CardTag.BUILDING],
      productions: [{ [G]: 1 }],
      actions: [discoverStudent(`${id}-2-1`, students[0])],
      upgrade: [{ cost: { resources: [{ [S]: 2, [W]: 2 }] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Monastery',
      tags: [CardTag.BUILDING],
      productions: [{ [G]: 1 }],
      glory: { amount: 4 },
      actions: [discoverStudent(`${id}-3-1`, students[1])],
      upgrade: [{ cost: { resources: [{ [G]: 2, [W]: 2, [S]: 2 }] }, upgradeTo: 4 }],
    },
    {
      id: 4,
      name: 'Renowned Monastery',
      tags: [CardTag.BUILDING],
      productions: [{ [G]: 2 }],
      glory: { amount: 8 },
      actions: [
        {
          id: `${id}-4-1`,
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: { [ResourceType.SCIENCE]: 10 },
            },
          ],
        },
      ],
    },
  ],
});
