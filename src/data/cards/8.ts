import { ActionEffectType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const fieldWorker: CardDef = {
  id: 8,
  name: 'Field Worker',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Field Worker',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/afa4cf05-2f0a-4ac7-bc90-bd9d3f2f5832/anim=false,width=450,optimized=true/ComfyUI_00998_.jpeg',
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
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/51c14cdb-50fa-4ff9-af29-0d9569c83938/anim=false,width=450,optimized=true/SP0A60XVCMVD8K4JMK6WTJYQJ0.jpeg',
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
