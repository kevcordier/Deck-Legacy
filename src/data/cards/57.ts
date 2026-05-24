import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const sickness: CardDef = {
  id: 57,
  name: 'Sickness',
  states: [
    {
      id: 1,
      name: 'Sickness',
      tags: [CardTag.EVENT],
      illustration: 'cards/57_1.jpg',
      negative: true,
      glory: { amount: -8 },
      actions: [
        {
          id: '57-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: {
                scope: [TargetScope.TOP_OF_DECK],
                pickNumber: 2,
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
                [ResourceType.GOLD]: 1,
              },
            ],
          },
          upgradeTo: 2,
        },
        {
          cost: {
            resources: [
              {
                [ResourceType.GOODS]: 7,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 2,
      name: 'Crippled',
      tags: [CardTag.STATE],
      illustration: 'cards/57_2.jpg',
      permanent: true,
      glory: { amount: -2 },
    },
    {
      id: 3,
      name: 'Feast',
      tags: [CardTag.EVENT],
      illustration: 'cards/57_3.jpg',
      glory: { amount: 2 },
      actions: [
        {
          id: '57-3-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  { [ResourceType.GOLD]: 1 },
                  { [ResourceType.WOOD]: 1 },
                  { [ResourceType.STONE]: 1 },
                  { [ResourceType.IRON]: 1 },
                  { [ResourceType.WEAPON]: 1 },
                  { [ResourceType.GOODS]: 1 },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
