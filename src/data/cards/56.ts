import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const youngPrincess: CardDef = {
  id: 56,
  name: 'Young Princess',
  states: [
    {
      id: 1,
      name: 'Young Princess',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/38e86790-d1f2-4e58-b558-4cb5eb4a49de/anim=false,width=450,optimized=true/00002-1285690597.jpeg',
      glory: { amount: 2 },
      actions: [
        {
          id: '56-1-1',
          trigger: Trigger.END_OF_TURN,
          optional: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.CHOOSE_EFFECT,
              effects: [
                {
                  id: 2,
                  type: ActionEffectType.DISCARD_CARD,
                  cards: {
                    scope: [TargetScope.BOARD],
                    tags: [CardTag.PERSON],
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
      ],
      upgrade: [
        {
          cost: {
            discard: [
              {
                scope: [TargetScope.BOARD],
                tags: [CardTag.PERSON],
                pickNumber: 2,
              },
              {
                scope: [TargetScope.BOARD],
                tags: [CardTag.LAND],
                pickNumber: 2,
              },
              {
                scope: [TargetScope.BOARD],
                tags: [CardTag.BUILDING],
                pickNumber: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Spoiled Princess',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/445382b2-a1ab-48de-9e57-b3bb7aef0a41/anim=false,width=450,optimized=true/ComfyUI_00020_.jpeg',
      tags: [CardTag.PERSON],
      actions: [
        {
          id: '56-2-1',
          trigger: Trigger.ON_PLAY,
          optional: false,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: {
                scope: [TargetScope.BOARD, TargetScope.FRIENDLY],
                pickNumber: 2,
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            discard: [
              {
                scope: [TargetScope.BOARD],
                tags: [CardTag.PERSON],
                pickNumber: 2,
              },
            ],
          },
          upgradeTo: 1,
        },
      ],
    },
    {
      id: 3,
      name: 'Educated Princess',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/bb643708-8549-4430-bfb2-dc29e7158b47/anim=false,width=450,optimized=true/00016-2617440945.jpeg',
      tags: [CardTag.PERSON, CardTag.LADY],
      glory: { amount: 8 },
      actions: [
        {
          id: '56-3-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  { [ResourceType.GOLD]: 1 },
                  { [ResourceType.WOOD]: 1 },
                  { [ResourceType.STONE]: 1 },
                  { [ResourceType.IRON]: 1 },
                  { [ResourceType.WEAPON]: 1 },
                  { [ResourceType.GOODS]: 1 },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
