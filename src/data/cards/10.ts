import { ActionType, CardTag, ResourceType, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const bandit2: CardDef = {
  id: 10,
  name: 'Bandit',
  states: [
    {
      id: 1,
      name: 'Bandit',
      tags: [CardTag.ENEMY],
      negative: true,
      glory: -2,
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/2f2966e7-17b9-418c-b5ec-842f368f390d/width=450,quality=90/bandit%204%20epic.jpeg',
      actions: [
        {
          id: '10-1-1',
          trigger: Trigger.ON_PLAY,
          optional: false,
          actionEffects: [
            {
              id: 1,
              type: ActionType.BLOCK_CARD,
              cards: {
                scope: TargetScope.BOARD,
                tags: [CardTag.LAND],
                produces: [ResourceType.GOLD],
              },
            },
          ],
        },
        {
          id: '10-1-2',
          cost: {
            resources: [
              {
                [ResourceType.WEAPON]: 1,
              },
            ],
            destroy: { scope: TargetScope.SELF },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionType.ADD_RESOURCES,
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
              type: ActionType.ADD_RESOURCES,
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
      name: 'Field Worker',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/a6fb5b03-1fa4-4cda-9387-a7c69c29d745/anim=false,width=450,optimized=true/00333-2099362640.jpeg',
      actions: [
        {
          id: '10-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionType.ADD_RESOURCES,
              resources: {
                cards: {
                  scope: TargetScope.BOARD,
                  tags: [CardTag.LAND],
                },
              },
            },
          ],
        },
      ],
    },
  ],
};
