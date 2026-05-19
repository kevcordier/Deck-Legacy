import { ActionEffectType, CardTag, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const witch: CardDef = {
  id: 44,
  name: 'Witch',
  states: [
    {
      id: 1,
      name: 'Witch',
      tags: [CardTag.ENEMY],
      illustration: 'cards/44_1.jpg',
      negative: true,
      glory: { amount: -3 },
      actions: [
        {
          id: '44-1-1',
          cost: {
            resources: [
              {
                weapon: 4,
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
        {
          id: '44-1-2',
          cost: {
            discard: [
              {
                tags: [CardTag.PERSON],
                pickNumber: 3,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [2] },
            },
          ],
        },
        {
          id: '44-1-3',
          trigger: Trigger.END_OF_TURN,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                scope: [TargetScope.TOP_OF_DISCOVERY],
                pickNumber: 2,
              },
            },
            {
              id: 3,
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
      name: 'Witch Cabin',
      illustration: 'cards/44_2.jpg',
      tags: [CardTag.ENEMY],
      negative: true,
      glory: { amount: -2 },
      actions: [
        {
          id: '44-2-1',
          cost: {
            resources: [
              {
                weapon: 3,
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
        {
          id: '44-2-2',
          cost: {
            destroy: {
              tags: [CardTag.PERSON],
              pickNumber: 1,
            },
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
        {
          id: '44-2-3',
          trigger: Trigger.END_OF_TURN,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                scope: [TargetScope.TOP_OF_DISCOVERY],
                pickNumber: 2,
              },
            },
            {
              id: 3,
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
