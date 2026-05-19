import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const deepPit: CardDef = {
  id: 74,
  name: 'Deep Pit',
  states: [
    {
      id: 1,
      name: 'Deep Pit',
      tags: [CardTag.LAND],
      illustration: 'cards/74_1.jpg',
      productions: [{ [ResourceType.STONE]: 1 }],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 1,
                [ResourceType.STONE]: 1,
              },
            ],
          },
          upgradeTo: 2,
        },
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 3,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 2,
      name: 'Town Well',
      illustration: 'cards/74_2.jpg',
      tags: [CardTag.LAND],
      glory: { amount: 3 },
      passives: [
        {
          ...CardPassives[PassiveType.ADJUST_PRODUCTION],
          id: '74-2-1',
          cards: {
            scope: [TargetScope.BOARD],
            tags: [CardTag.BUILDING],
          },
          resources: {
            [ResourceType.GOLD]: 1,
          },
        },
      ],
    },
    {
      id: 3,
      name: 'Pit Settlement',
      illustration: 'cards/74_3.jpg',
      tags: [CardTag.BUILDING],
      productions: [{ [ResourceType.WOOD]: 1, [ResourceType.STONE]: 1 }],
      glory: { amount: 1 },
      actions: [
        {
          id: '74-3-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: {
                scope: [TargetScope.SELF],
              },
            },
          ],
        },
      ],
      track: {
        inOrder: true,
        steps: [
          {
            id: 1,
          },
          {
            id: 2,
          },
          {
            id: 3,
            effects: [
              {
                id: 1,
                type: ActionEffectType.UPGRADE_CARD,
                cards: {
                  scope: [TargetScope.SELF],
                },
                states: { ids: [4] },
              },
            ],
          },
        ],
      },
    },
    {
      id: 4,
      name: 'Prison',
      tags: [CardTag.BUILDING],
      illustration: 'cards/74_4.jpg',
      productions: [{ [ResourceType.WEAPON]: 1 }],
      glory: {
        amount: 0,
        valuePerElement: {
          amount: 2,
          accumulation: true,
        },
      },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '74-4-1',
          cost: {
            discard: [
              {
                scope: [TargetScope.BOARD],
                tags: [CardTag.ENEMY],
              },
            ],
          },
          actionEffects: [
            {
              id: 2,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: {
                scope: [TargetScope.SELF],
              },
            },
          ],
        },
      ],
      track: {
        inOrder: false,
        steps: [
          {
            id: 4,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_CUMULATED,
                value: 1,
              },
            ],
          },
          {
            id: 5,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_CUMULATED,
                value: 1,
              },
            ],
          },
          {
            id: 6,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_CUMULATED,
                value: 1,
              },
            ],
          },
          {
            id: 7,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  [ResourceType.WEAPON]: 1,
                },
              },
              {
                id: 2,
                type: ActionEffectType.ADD_CUMULATED,
                value: 1,
              },
            ],
          },
          {
            id: 8,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  [ResourceType.WEAPON]: 1,
                },
              },
              {
                id: 2,
                type: ActionEffectType.ADD_CUMULATED,
                value: 1,
              },
            ],
          },
          {
            id: 9,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  [ResourceType.GOLD]: 1,
                },
              },
              {
                id: 2,
                type: ActionEffectType.ADD_CUMULATED,
                value: 1,
              },
            ],
          },
          {
            id: 10,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  [ResourceType.GOLD]: 2,
                },
              },
              {
                id: 2,
                type: ActionEffectType.ADD_CUMULATED,
                value: 1,
              },
            ],
          },
          {
            id: 11,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  [ResourceType.GOLD]: 3,
                },
              },
            ],
          },
        ],
      },
    },
  ],
};
