import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const northPlains: CardDef = {
  id: 114,
  name: 'North Plains',
  states: [
    {
      id: 1,
      name: 'North Plains',
      tags: [CardTag.LAND],
      illustration: 'cards/114_1.jpg',
      productions: [{ gold: 1 }],
      upgrade: [
        { cost: { resources: [{ stone: 3, gold: 1 }] }, upgradeTo: 2 },
        { cost: { resources: [{ stone: 4 }] }, upgradeTo: 4 },
      ],
    },
    {
      id: 2,
      name: 'Moat',
      tags: [CardTag.LAND],
      illustration: 'cards/114_2.jpg',
      productions: [
        {
          [ResourceType.WEAPON]: 1,
        },
      ],
      glory: { amount: 2 },
      actions: [
        {
          id: '114-2-1',
          cost: { discard: [{ scope: [TargetScope.BOARD] }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: { weapon: 2 },
            },
          ],
        },
      ],
      upgrade: [{ cost: { resources: [{ iron: 2, gold: 2 }] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Moat Bridge',
      tags: [CardTag.BUILDING],
      illustration: 'cards/114_3.jpg',
      productions: [
        {
          [ResourceType.WEAPON]: 1,
        },
      ],
      glory: { amount: 3 },
      actions: [
        {
          id: '114-3-1',
          cost: { resources: [{ gold: 1 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { tags: [CardTag.PERSON], scope: [TargetScope.DISCARD] },
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: 'Wall',
      tags: [CardTag.BUILDING, CardTag.WALL],
      illustration: 'cards/114_4.jpg',
      productions: [
        {
          [ResourceType.WEAPON]: 1,
        },
      ],
      glory: { amount: 3 },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
    },
  ],
};
