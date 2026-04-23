import { ActionType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const river: CardDef = {
  id: 7,
  name: 'River',
  states: [
    {
      id: 1,
      name: 'River',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/eea05c7b-ba60-4dc7-269a-a60c100c3200/width=450,quality=90/303606.jpeg',
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
                [ResourceType.WOOD]: 3,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Bridge',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/84fe0ac9-bf08-43a1-ace2-d8a3bb7e031c/width=450,quality=90/917C9432AD8F6E1400F86041E08556D6B4CEE45B81C1978436B7CA303EF933E1.jpeg',
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      glory: 2,
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.STONE]: 3,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Stone Bridge',
      illustration:
        'https://assets.lummi.ai/assets/QmPYBqiJxrZNah6ePyGB78vngDTtkUwzgSv1yoEAGNa1a5?auto=format&w=1500',
      tags: [CardTag.LAND],
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      glory: 4,
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Explorers',
      illustration:
        'https://assets.lummi.ai/assets/QmRN7MxixVDs23HevqGV7pmr9GMAZCcB67NhXpNRcBArp6?auto=format&w=1500',
      tags: [CardTag.PERSON],
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      glory: 4,
      actions: [
        {
          id: '7-4-1',
          actionEffects: [
            {
              id: 1,
              type: ActionType.DISCOVER_CARD,
              cards: {
                ids: [71, 72, 73, 74],
              },
            },
            {
              id: 2,
              type: ActionType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: [3],
            },
          ],
        },
      ],
    },
  ],
};
