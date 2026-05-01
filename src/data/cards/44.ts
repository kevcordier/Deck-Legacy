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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/a854018a-1a33-4c70-bab5-b63efd94ba61/anim=false,width=450,optimized=true/8YT5HZERDA1H08W1YESX9KC7A0.jpeg',
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
                number: 3,
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
              states: [2],
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
              },
            },
            {
              id: 2,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                scope: [TargetScope.TOP_OF_DISCOVERY],
              },
            },
            {
              id: 3,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: [2],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Witch Cabin',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/941bcfa1-39f7-422b-bfa5-42def2fd57aa/anim=false,width=450,optimized=true/54e6de39-219a-4ec5-a70b-9f0a38f0e3a6.jpeg',
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
              number: 1,
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
              },
            },
            {
              id: 2,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                scope: [TargetScope.TOP_OF_DISCOVERY],
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
