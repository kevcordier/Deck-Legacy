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

export const shrine: CardDef = {
  id: 69,
  name: 'Shrine',
  states: [
    {
      id: 1,
      name: 'Shrine',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/49e9bb1d-3bd1-4ea7-becc-ad86b4d64513/450x%3Cauto%3E_so',
      glory: { amount: 3 },
      actions: [
        {
          id: '69-1-1',
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
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 3,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Sanctuary',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/54ee1a6d-e506-44bc-95ac-047a93e3aeb1/450x%3Cauto%3E_so',
      glory: { amount: 5 },
      actions: [
        {
          id: '69-2-1',
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
                pickMax: 2,
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
                [ResourceType.GOLD]: 3,
                [ResourceType.STONE]: 2,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Oratory',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/1a6733df-1254-44b5-b304-b49f9813c9e4/anim=false,width=450,optimized=true/00177-1658054072.jpeg',
      glory: { amount: 9 },
      actions: [
        {
          id: '69-3-1',
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
                pickMax: 3,
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
                [ResourceType.GOLD]: 2,
                [ResourceType.WOOD]: 2,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Temple',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/e17ee73b-9b0e-4f2b-aa1e-7e78c4cfa1c9/anim=false,width=450,optimized=true/00087-2899013593.jpeg',
      glory: { amount: 15 },
      actions: [
        {
          id: '69-4-1',
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
                pickMax: 4,
              },
              effect: CardPassives[PassiveType.STAY_IN_PLAY],
            },
          ],
        },
      ],
    },
  ],
};
