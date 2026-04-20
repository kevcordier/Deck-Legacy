import { ActionType, CardTag, PassiveType, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const lake: CardDef = {
  id: 14,
  name: 'Lake',
  states: [
    {
      id: 1,
      name: 'Lake',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/2b14f727-bbdc-4269-fd11-2479d4b1f700/anim=false,width=450,optimized=true/IMG_8169.jpeg',
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 1,
                [ResourceType.STONE]: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
        {
          cost: {
            resources: [
              {
                [ResourceType.STONE]: 4,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 2,
      name: "Fisherman's Cabin",
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/3abd3e55-01b6-4877-90a8-432cb1805590/anim=false,width=450,optimized=true/QM9ED3P6EY72NPJ4HKMPP5B7R0.jpeg',
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      glory: 1,
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 3,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Fishing Boat',
      tags: [CardTag.SEAFARING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/620da338-c2d2-4c44-b7f6-a165535954a0/anim=false,width=450,optimized=true/20260411102620-2343054298.jpeg',
      productions: [
        {
          [ResourceType.GOLD]: 2,
        },
      ],
      glory: 1,
      actions: [
        {
          id: '14-3-1',
          actionEffects: [
            {
              id: 1,
              type: ActionType.DISCOVER_CARD,
              cards: {
                ids: [75],
              },
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: 'Lighthouse',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/2da2ea79-bc04-4308-9304-7a1769782459/anim=false,width=450,optimized=true/5119A792AB2904953333213333F165E49A0B1D63A8D053A97C3B8008EBCE2A84.jpeg',
      glory: 5,
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '14-4-1',
          passive: true,
          actionEffects: [
            {
              id: 1,
              type: ActionType.DISCARD_CARD,
              cards: {
                scope: TargetScope.TOP_OF_DECK,
              },
            },
          ],
        },
      ],
    },
  ],
};
