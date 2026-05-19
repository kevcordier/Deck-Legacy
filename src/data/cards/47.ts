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

export const plague: CardDef = {
  id: 47,
  name: 'Plague',
  states: [
    {
      id: 1,
      name: 'Plague',
      tags: [CardTag.EVENT],
      illustration: 'cards/47_1.jpg',
      negative: true,
      glory: {
        amount: -2,
      },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '47-1-1',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                tags: [CardTag.PERSON],
                scope: [TargetScope.DISCARD],
                pickNumber: 2,
              },
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [2] },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Enemy soldier',
      tags: [CardTag.ENEMY],
      illustration: 'cards/47_2.jpg',
      negative: true,
      glory: {
        amount: -2,
      },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '47-2-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.BLOCK_CARD,
              cards: {
                scope: [TargetScope.BOARD],
                tags: [CardTag.BUILDING, CardTag.LAND],
              },
            },
          ],
        },
        {
          id: '47-2-2',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                scope: [TargetScope.BLOCKED_BY_THIS],
              },
            },
          ],
        },
        {
          id: '47-2-3',
          cost: {
            resources: [
              {
                [ResourceType.WEAPON]: 2,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
            },
          ],
        },
      ],
    },
  ],
};
