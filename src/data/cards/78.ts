import { ActionEffectType, CardTag, ResourceType, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const treasureHunt: CardDef = {
  id: 78,
  name: 'Treasure Hunt',
  states: [
    {
      id: 1,
      name: 'Treasure Hunt',
      illustration: 'cards/78_1.jpg',
      tags: [CardTag.SEAFARING],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 1,
                [ResourceType.WOOD]: 1,
                [ResourceType.IRON]: 1,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Pirate Cove',
      tags: [CardTag.SEAFARING],
      illustration: 'cards/78_2.jpg',
      actions: [
        {
          id: '78-2-1',
          trigger: Trigger.END_OF_TURN,
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [94],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WEAPON]: 1,
                [ResourceType.IRON]: 1,
              },
            ],
            discard: [
              {
                pickNumber: 2,
                tags: [CardTag.PERSON],
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Treasure Map',
      tags: [CardTag.SEAFARING],
      illustration: 'cards/78_3.jpg',
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      glory: { amount: 5 },
      upgrade: [
        {
          cost: {
            discard: [
              {
                pickNumber: 2,
                tags: [CardTag.SEAFARING],
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Pirate Treasure',
      tags: [CardTag.ITEM, CardTag.LOOT],
      illustration: 'cards/78_4.jpg',
      productions: [
        {
          [ResourceType.GOLD]: 2,
        },
      ],
      glory: { amount: 15 },
    },
  ],
};
