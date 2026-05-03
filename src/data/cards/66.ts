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

export const villa: CardDef = {
  id: 66,
  name: 'Villa',
  states: [
    {
      id: 1,
      name: 'Villa',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/4e9dc00c-a9d0-4b5c-991d-27ecb0726e92/anim=false,width=450,optimized=true/00144-2317017350.jpeg',
      actions: [
        {
          id: '66-1-1',
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
                tags: [CardTag.PERSON],
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
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Estate',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/f2487864-0e28-49ae-b148-3464e9d795e1/anim=false,width=450,optimized=true/02096-4276944408-Best%20quality,%20Mark%20Keathley%20red%20art%20by%20and%20arker%20painting%20on%20silk%20paper,%20fine%20lines,%20bright%20colors,%20medieval%20rich%20house%20in%20a%20big.jpeg',
      glory: { amount: 3 },
      actions: [
        {
          id: '66-2-1',
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
                tags: [CardTag.PERSON],
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
                [ResourceType.WOOD]: 2,
                [ResourceType.STONE]: 4,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Mansion',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/34152460-1c1a-4e22-8062-af13ed6e0667/anim=false,width=450,optimized=true/2024-07-12-231733_IU+FHD+N8K%20JUL%2024.jpeg',
      glory: { amount: 7 },
      actions: [
        {
          id: '66-3-1',
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
                [ResourceType.STONE]: 2,
                [ResourceType.GOLD]: 4,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Palace',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/3baa3edf-5d24-49b6-8bf5-9b91ed09bf9a/anim=false,width=450,optimized=true/castle.jpeg',
      glory: { amount: 12 },
      actions: [
        {
          id: '66-4-1',
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
    },
  ],
};
