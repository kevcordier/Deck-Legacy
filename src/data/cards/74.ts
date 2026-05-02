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
      name: 'A Deep Pit',
      tags: [CardTag.LAND],
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
      tags: [CardTag.LAND],
      glory: { amount: 3 },
      passives: [
        {
          ...CardPassives[PassiveType.ADJUST_PRODUCTION],
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
                states: [4],
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
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: {
                scope: [TargetScope.SELF],
              },
            },
            {
              id: 2,
              type: ActionEffectType.DISCARD_CARD,
              cards: {
                tags: [CardTag.ENEMY],
              },
              pickNumber: 1,
            },
          ],
        },
      ],
      track: {
        inOrder: false,
        steps: [
          {
            id: 1,
          },
          {
            id: 2,
          },
          {
            id: 3,
          },
          {
            id: 4,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  [ResourceType.WEAPON]: 1,
                },
              },
            ],
          },
          {
            id: 5,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  [ResourceType.WEAPON]: 1,
                },
              },
            ],
          },
          {
            id: 6,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  [ResourceType.GOLD]: 1,
                },
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
                  [ResourceType.GOLD]: 2,
                },
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
