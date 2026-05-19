import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const ploughs: CardDef = {
  id: 86,
  name: 'Ploughs',
  chooseState: [1, 3],
  states: [
    {
      id: 1,
      name: 'Ploughs',
      tags: [CardTag.LAND, CardTag.INVENTION],
      illustration: 'cards/86_1.jpg',
      glory: { amount: 4 },
      productions: [{ [ResourceType.GOLD]: 3 }],
      upgrade: [
        {
          cost: {
            resources: [{ [ResourceType.WOOD]: 4 }],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Farming Machines',
      tags: [CardTag.LAND, CardTag.INVENTION],
      glory: { amount: 8 },
      illustration: 'cards/86_2.jpg',
      productions: [{ [ResourceType.GOLD]: 4 }],
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
    },
    {
      id: 3,
      name: 'Larger Barns',
      tags: [CardTag.BUILDING],
      illustration: 'cards/86_3.jpg',
      glory: { amount: 3 },
      productions: [{ [ResourceType.GOLD]: 2 }],
      actions: [
        {
          id: '86-3-1',
          trigger: Trigger.END_OF_TURN,
          optional: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_BOARD_EFFECT,
              cards: {
                scope: [TargetScope.BOARD, TargetScope.SELF],
                pickMin: 0,
                pickMax: 1,
              },
              effect: CardPassives[PassiveType.STAY_IN_PLAY],
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 2,
                [ResourceType.STONE]: 2,
                [ResourceType.IRON]: 2,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Royal Storehouse',
      tags: [CardTag.BUILDING],
      illustration: 'cards/86_4.jpg',
      glory: { amount: 5 },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '86-4-1',
          trigger: Trigger.END_OF_TURN,
          optional: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_BOARD_EFFECT,
              cards: {
                scope: [TargetScope.BOARD],
                pickMin: 0,
                pickMax: 1,
              },
              effect: CardPassives[PassiveType.STAY_IN_PLAY],
            },
          ],
        },
      ],
    },
  ],
};
