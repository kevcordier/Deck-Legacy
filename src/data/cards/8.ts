import { ActionEffectType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const fieldWorker: CardDef = {
  id: 8,
  name: 'Field Worker',
  chooseState: true,
  states: [
    {
      id: 1,
      name: 'Field Worker',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/a6fb5b03-1fa4-4cda-9387-a7c69c29d745/anim=false,width=450,optimized=true/00333-2099362640.jpeg',
      actions: [
        {
          id: '8-1-1',
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
    {
      id: 2,
      name: 'Servant',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/9f3f38ed-1c0a-413d-8a60-862efc680b99/anim=false,width=450,optimized=true/servant%20male%201%20photoMovieX.jpeg',
      actions: [
        {
          id: '8-2-1',
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
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
