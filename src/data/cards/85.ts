import { ActionEffectType, CardTag, PassiveType, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const sawMill: CardDef = {
  id: 85,
  name: 'Saw Mill',
  chooseState: [1, 3],
  states: [
    {
      id: 1,
      name: 'Saw Mill',
      tags: [CardTag.BUILDING],
      illustration: 'cards/85_1.jpg',
      glory: { amount: 3 },
      productions: [{ [ResourceType.WOOD]: 3 }],
      upgrade: [
        {
          cost: {
            resources: [{ [ResourceType.WOOD]: 3 }],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Wood Industry',
      illustration: 'cards/85_2.jpg',
      tags: [CardTag.BUILDING],
      glory: { amount: 3 },
      productions: [{ [ResourceType.WOOD]: 4 }],
      actions: [
        {
          id: '85-2-1',
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [91],
              },
            },
          ],
        },
      ],
    },
    {
      id: 3,
      name: 'Wood Export',
      illustration: 'cards/85_3.jpg',
      tags: [CardTag.BUILDING],
      glory: { amount: 4 },
      productions: [{ [ResourceType.GOODS]: 2 }],
      upgrade: [
        {
          cost: {
            resources: [{ [ResourceType.GOLD]: 4 }],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Wood Shipment',
      illustration: 'cards/85_4.jpg',
      tags: [CardTag.SEAFARING, CardTag.SHIP],
      glory: { amount: 6 },
      productions: [{ [ResourceType.WOOD]: 2 }, { [ResourceType.GOODS]: 2 }],
      passives: [
        {
          id: '85-4-1',
          type: PassiveType.RESOURCE_EQUIVALENCE,
          resources: {
            [ResourceType.WOOD]: 1,
            [ResourceType.GOODS]: 1,
          },
        },
      ],
    },
  ],
};
