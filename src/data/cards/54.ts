import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const skilledBandit2: CardDef = {
  id: 54,
  name: 'Skilled Bandit',
  states: [
    {
      id: 1,
      name: 'Skilled Bandit',
      tags: [CardTag.ENEMY],
      negative: true,
      glory: { amount: -2 },
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/a5f3bdbc-6c57-4944-b335-53f8012d491a/anim=false,width=450,optimized=true/D1BZVBJAN80F6SD0Z7AGYE7ZZ0.jpeg',
      actions: [
        {
          id: '54-1-1',
          trigger: Trigger.ON_PLAY,
          optional: false,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.BLOCK_CARD,
              cards: {
                scope: [TargetScope.BOARD],
                tags: [CardTag.BUILDING, CardTag.LAND],
                produces: [
                  ResourceType.GOLD,
                  ResourceType.WOOD,
                  ResourceType.STONE,
                  ResourceType.IRON,
                  ResourceType.WEAPON,
                  ResourceType.GOODS,
                ],
                pickNumber: 3,
              },
            },
          ],
        },
        {
          id: '54-1-2',
          cost: {
            resources: [
              {
                [ResourceType.WEAPON]: 3,
              },
            ],
            destroy: { scope: [TargetScope.SELF] },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  {
                    [ResourceType.GOLD]: 1,
                  },
                  {
                    [ResourceType.WOOD]: 1,
                  },
                  {
                    [ResourceType.STONE]: 1,
                  },
                  {
                    [ResourceType.IRON]: 1,
                  },
                  {
                    [ResourceType.WEAPON]: 1,
                  },
                  {
                    [ResourceType.GOODS]: 1,
                  },
                ],
              },
            },
            {
              id: 2,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  {
                    [ResourceType.GOLD]: 1,
                  },
                  {
                    [ResourceType.WOOD]: 1,
                  },
                  {
                    [ResourceType.STONE]: 1,
                  },
                  {
                    [ResourceType.IRON]: 1,
                  },
                  {
                    [ResourceType.WEAPON]: 1,
                  },
                  {
                    [ResourceType.GOODS]: 1,
                  },
                ],
              },
            },
            {
              id: 2,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  {
                    [ResourceType.GOLD]: 1,
                  },
                  {
                    [ResourceType.WOOD]: 1,
                  },
                  {
                    [ResourceType.STONE]: 1,
                  },
                  {
                    [ResourceType.IRON]: 1,
                  },
                  {
                    [ResourceType.WEAPON]: 1,
                  },
                  {
                    [ResourceType.GOODS]: 1,
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Worker',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/afa4cf05-2f0a-4ac7-bc90-bd9d3f2f5832/anim=false,width=450,optimized=true/ComfyUI_00998_.jpeg',
      actions: [
        {
          id: '54-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                cards: {
                  scope: [TargetScope.BOARD],
                  tags: [CardTag.LAND],
                  produces: [
                    ResourceType.GOLD,
                    ResourceType.WOOD,
                    ResourceType.STONE,
                    ResourceType.IRON,
                    ResourceType.WEAPON,
                    ResourceType.GOODS,
                  ],
                },
              },
            },
          ],
        },
      ],
    },
  ],
};
