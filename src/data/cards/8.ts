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
      illustration: 'cards/8_1.jpg',
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
      illustration: 'cards/8_2.jpg',
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
