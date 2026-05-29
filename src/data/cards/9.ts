import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const bandit: CardDef = {
  id: 9,
  name: 'Bandit',
  states: [
    {
      id: 1,
      name: 'Bandit',
      tags: [CardTag.ENEMY, CardTag.BANDIT],
      negative: true,
      glory: { amount: -2 },
      illustration: 'cards/9_1.jpg',
      actions: [
        {
          id: '9-1-1',
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
          id: '9-1-2',
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
                choice: [{ any: 1 }],
              },
              repeat: 2,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Worker',
      tags: [CardTag.PERSON],
      illustration: 'cards/9_2.jpg',
      actions: [
        {
          id: '9-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                cards: {
                  scope: [TargetScope.BOARD],
                  tags: [CardTag.BUILDING],
                },
              },
            },
          ],
        },
      ],
    },
  ],
};
