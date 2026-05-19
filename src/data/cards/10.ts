import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const bandit2: CardDef = {
  id: 10,
  name: 'Bandit',
  states: [
    {
      id: 1,
      name: 'Bandit',
      tags: [CardTag.ENEMY, CardTag.BANDIT],
      negative: true,
      glory: { amount: -2 },
      illustration: 'cards/10_1.jpg',
      actions: [
        {
          id: '10-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.BLOCK_CARD,
              cards: {
                scope: [TargetScope.BOARD],
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
            destroy: { scope: [TargetScope.SELF] },
          },
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
      illustration: 'cards/10_2.jpg',
      actions: [
        {
          id: '10-2-1',
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
  ],
};
