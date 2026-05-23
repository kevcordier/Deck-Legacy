import { ActionEffectType, CardTag, PassiveType, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef, StepDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

const makeState = (id: number): StepDef => ({
  id,
  effects: [
    {
      id: 1,
      type: ActionEffectType.ADD_CUMULATED,
      cards: {
        scope: [TargetScope.SELF],
      },
      value: 1,
    },
  ],
});

export const prosperity: CardDef = {
  id: 119,
  name: 'Prosperity',
  parchmentCard: false,
  states: [
    {
      id: 1,
      name: 'Prosperity',
      tags: [CardTag.EVENT],
      illustration: 'cards/119_1.webp',
      permanent: true,
      passives: [
        {
          id: '119-1-1',
          type: PassiveType.ADJUST_PRODUCTION,
          amount: 1,
          cards: { scope: [TargetScope.BOARD] },
          resources: { gold: 1 },
        },
      ],
      actions: [
        {
          id: '119-1-1',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [2] },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Hoarding',
      tags: [CardTag.EVENT],
      illustration: 'cards/119_2.jpg',
      permanent: true,
      actions: [
        {
          id: '119-2-1',
          trigger: Trigger.END_OF_TURN,
          optional: true,
          cost: {
            discard: [
              {
                scope: [TargetScope.SELF],
              },
            ],
          },
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
        {
          id: '119-2-2',
          trigger: Trigger.END_OF_ROUND,
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
    },
    {
      id: 3,
      name: 'Uprising',
      tags: [CardTag.EVENT],
      illustration: 'cards/119_3.jpg',
      permanent: true,
      passives: [
        {
          id: '119-3-1',
          type: PassiveType.ADD_TRIGGER,
          condition: {
            type: 'cardCount',
            cards: { scope: [TargetScope.BOARD], tags: [CardTag.PERSON] },
            min: 1,
          },
          trigger: {
            id: '119-3-1',
            type: Trigger.ON_PLAY,
            actions: [
              {
                id: 1,
                type: ActionEffectType.TRACK_ADVANCE,
                cards: { scope: [TargetScope.SELF] },
              },
            ],
            cards: { tags: [CardTag.PERSON] },
          },
        },
      ],
      actions: [
        {
          id: '119-3-1',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [4] },
            },
          ],
        },
      ],
      track: {
        steps: [
          makeState(1),
          makeState(2),
          makeState(3),
          makeState(4),
          makeState(5),
          makeState(6),
          makeState(7),
          makeState(8),
        ],
        inOrder: true,
      },
    },
    {
      id: 4,
      name: 'Royal Decree',
      tags: [CardTag.EVENT],
      illustration: 'cards/119_4.webp',
      permanent: true,
      actions: [
        {
          id: '119-4-1',
          trigger: Trigger.END_OF_TURN,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
              resourceScopes: ['production'],
              cards: {
                scope: [TargetScope.BOARD, TargetScope.DECK, TargetScope.DISCARD],
              },
              resources: {
                choice: [
                  { gold: 1 },
                  { wood: 1 },
                  { stone: 1 },
                  { iron: 1 },
                  { weapon: 1 },
                  { goods: 1 },
                ],
              },
              repeat: 'accumulation',
            },
            {
              id: 2,
              type: ActionEffectType.DESTROY_CARD,
              cards: { scope: [TargetScope.SELF] },
            },
            {
              id: 3,
              type: ActionEffectType.END_GAME,
            },
          ],
        },
      ],
    },
  ],
};
