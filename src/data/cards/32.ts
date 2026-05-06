import { ActionEffectType, CardTag, PassiveType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const jester: CardDef = {
  id: 32,
  name: 'Jester',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Jester',
      tags: [CardTag.PERSON],
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/801f2cb5-58b3-4ca5-8093-4b4bde551bd3/450x%3Cauto%3E_so',
      actions: [
        {
          id: '32-1-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: { scope: [TargetScope.TOP_OF_DECK] },
            },
          ],
        },
        {
          id: '32-1-2',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: { scope: [TargetScope.SELF] },
            },
          ],
        },
      ],
      track: {
        inOrder: false,
        steps: [
          {
            id: 1,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  gold: 2,
                },
              },
            ],
          },
          {
            id: 2,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  gold: 2,
                },
              },
            ],
          },
          {
            id: 3,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  gold: 2,
                },
              },
            ],
          },
          {
            id: 4,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  gold: 1,
                  wood: 1,
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
                  gold: 1,
                  wood: 1,
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
                  gold: 1,
                  wood: 1,
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
                  goods: 2,
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
                  goods: 2,
                },
              },
            ],
          },
        ],
      },
    },
    {
      id: 2,
      name: 'Merchant',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/e4086710-3bfc-420e-8d1b-9d1dc3ac71f3/anim=false,width=450,optimized=true/Latent_Adetailer_00031_.jpeg',
      actions: [
        {
          id: '32-2-2',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: { scope: [TargetScope.SELF] },
              steps: {
                pickMin: 1,
                pickMax: 2,
              },
            },
          ],
        },
      ],
      track: {
        inOrder: false,
        steps: [
          {
            id: 1,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  gold: 1,
                },
              },
            ],
          },
          {
            id: 2,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  gold: 1,
                },
              },
            ],
          },
          {
            id: 3,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  wood: 1,
                },
              },
            ],
          },
          {
            id: 4,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  wood: 1,
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
                  stone: 1,
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
                  stone: 1,
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
                  iron: 1,
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
                  iron: 1,
                },
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
                  gold: 1,
                },
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
                  gold: 1,
                },
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
                  wood: 1,
                },
              },
            ],
          },
          {
            id: 12,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  wood: 1,
                },
              },
            ],
          },
          {
            id: 13,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  stone: 1,
                },
              },
            ],
          },
          {
            id: 14,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  stone: 1,
                },
              },
            ],
          },
          {
            id: 15,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  iron: 1,
                },
              },
            ],
          },
          {
            id: 16,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  iron: 1,
                },
              },
            ],
          },
          {
            id: 17,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  gold: 1,
                },
              },
            ],
          },
          {
            id: 18,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  gold: 1,
                },
              },
            ],
          },
          {
            id: 19,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  wood: 1,
                },
              },
            ],
          },
          {
            id: 20,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  wood: 1,
                },
              },
            ],
          },
          {
            id: 21,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  stone: 1,
                },
              },
            ],
          },
          {
            id: 22,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  stone: 1,
                },
              },
            ],
          },
          {
            id: 23,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  iron: 1,
                },
              },
            ],
          },
          {
            id: 24,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_RESOURCES,
                resources: {
                  iron: 1,
                },
              },
            ],
          },
        ],
      },
    },
  ],
};
