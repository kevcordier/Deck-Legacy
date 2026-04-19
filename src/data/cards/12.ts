import { ActionType, CardTag, PassiveType, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const eastCliffs: CardDef = {
  id: 12,
  name: 'East Cliffs',
  states: [
    {
      id: 1,
      name: 'East Cliffs',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/0b355473-abc7-45b7-8454-f9fcc0767d43/width=450,quality=90/PRQ3CTSP15QFNGQN1ZYVTJ0DN0.jpeg',
      productions: [
        {
          [ResourceType.STONE]: 1,
        },
      ],
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
        {
          cost: {
            resources: [
              {
                [ResourceType.STONE]: 1,
                [ResourceType.WOOD]: 1,
                [ResourceType.GOLD]: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Smithy',
      tags: [CardTag.BUILDING],
      productions: [
        {
          [ResourceType.IRON]: 1,
        },
      ],
      glory: 1,
      actions: [
        {
          id: '12-2-1',
          actions: [
            {
              id: 1,
              type: ActionType.DISCOVER_CARD,
              cards: {
                ids: [90],
              },
            },
            {
              id: 2,
              type: ActionType.UPGRADE_CARD,
              cards: {
                scope: TargetScope.SELF,
              },
              states: [1],
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
                [ResourceType.IRON]: 2,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Arsenal',
      tags: [CardTag.BUILDING],
      productions: [
        {
          [ResourceType.IRON]: 1,
        },
      ],
      glory: 4,
      actions: [
        {
          id: '12-3-1',
          actions: [
            {
              id: 1,
              type: ActionType.ADD_RESOURCES,
              resourcePerCard: {
                amount: 1,
                resource: ResourceType.WEAPON,
                scope: TargetScope.BOARD,
                tags: [CardTag.PERSON],
              },
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: 'Wall',
      tags: [CardTag.BUILDING],
      productions: [
        {
          [ResourceType.WEAPON]: 1,
        },
      ],
      glory: 3,
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
    },
  ],
};
