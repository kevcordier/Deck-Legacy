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
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/e677f3eb-9a43-4b08-9bf4-c87c6e7334c7/450x%3Cauto%3E_so',
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
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/d996cb6d-2ce6-4677-b20f-a25d212881ac/450x%3Cauto%3E_so',
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
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/96345d63-fc00-496d-bf6c-9ac0beced2f4/450x%3Cauto%3E_so',
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
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/201f1019-5336-4b8e-a35f-477b00b05ad4/450x%3Cauto%3E_so',
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
