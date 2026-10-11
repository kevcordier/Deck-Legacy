import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

export const fortGrounds: CardDef = {
  id: 130,
  name: 'Fort Grounds',
  states: [
    {
      id: 1,
      name: 'Fort Grounds',
      tags: [CardTag.LAND],
      illustration: 'cards/130_1.jpg',
      upgrade: [
        { cost: { resources: [{ [ResourceType.STONE]: 2 }] }, upgradeTo: 4 },
        { cost: { resources: [{ [ResourceType.STONE]: 4 }] }, upgradeTo: 2 },
      ],
    },
    {
      id: 2,
      name: 'Wall',
      tags: [CardTag.BUILDING],
      illustration: 'cards/130_2.jpg',
      productions: [{ [ResourceType.WEAPON]: 1 }],
      glory: { amount: 3 },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
    },
    {
      id: 3,
      name: 'Large Dungeon',
      tags: [CardTag.BUILDING],
      illustration: 'cards/130_3.jpg',
      glory: { amount: 0, valuePerElement: { amount: 2, accumulation: true } },
      actions: [
        {
          id: '130-3-1',
          unlimited: true,
          cost: { discard: [{ scope: [TargetScope.BOARD], name: 'Prisoner', pickNumber: 1 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_CUMULATED,
              cards: { scope: [TargetScope.SELF] },
              value: 1,
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: 'Small Dungeon',
      tags: [CardTag.BUILDING],
      illustration: 'cards/130_4.jpg',
      actions: [
        {
          id: '130-4-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: { scope: [TargetScope.BOARD], name: 'Prisoner', pickMin: 0, pickMax: 99 },
            },
            {
              id: 2,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: { scope: [TargetScope.SELF] },
              valuePerElement: { amount: 1, cards: { scope: [TargetScope.LAST_SELECTED] } },
            },
          ],
        },
        {
          id: '130-4-2',
          trigger: Trigger.ON_TRACK_END,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [3] },
            },
          ],
        },
      ],
      track: { inOrder: true, steps: [1, 2, 3, 4].map(id => ({ id })) },
    },
  ],
};
