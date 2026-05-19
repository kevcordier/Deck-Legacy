import { ActionEffectType, CardTag, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const camp: CardDef = {
  id: 37,
  name: 'Camp',
  states: [
    {
      id: 1,
      name: 'Camp',
      tags: [CardTag.LAND],
      illustration: 'cards/37_1.jpg',
      upgrade: [
        {
          cost: {
            resources: [{ [ResourceType.GOLD]: 1, [ResourceType.WOOD]: 1, [ResourceType.IRON]: 1 }],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Training Grounds',
      tags: [CardTag.LAND],
      illustration: 'cards/37_2.jpg',
      glory: {
        amount: 1,
      },
      actions: [
        {
          id: '37-2-1',
          cost: {
            resources: [{ [ResourceType.GOLD]: 1 }],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                [ResourceType.WEAPON]: 1,
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [{ [ResourceType.IRON]: 2 }],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Sir _____',
      chooseName: true,
      tags: [CardTag.PERSON, CardTag.KNIGHT],
      illustration: 'cards/37_3.jpg',
      productions: [
        {
          [ResourceType.WEAPON]: 2,
        },
      ],
      glory: {
        amount: 3,
      },
    },
  ],
};
