import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const waterMill: CardDef = {
  id: 120,
  name: 'The Water Mill',
  parchmentCard: false,
  states: [
    {
      id: 1,
      name: 'The Water Mill',
      tags: [CardTag.INVENTION],
      illustration: 'cards/120_1.jpg',
      permanent: true,
      actions: [
        {
          id: '120-1-1',
          trigger: Trigger.START_OF_TURN,
          optional: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: { gold: 3 },
            },
          ],
        },
        {
          id: '120-1-2',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [2] },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Efficient Farming',
      tags: [CardTag.EVENT],
      illustration: 'cards/120_2.webp',
      permanent: true,
      actions: [
        {
          id: '120-2-1',
          endsTurn: true,
          cost: {
            discard: [{ scope: [TargetScope.BOARD], tags: [CardTag.BUILDING] }],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              stickers: { ids: [1] },
              cards: { scope: [TargetScope.BOARD], tags: [CardTag.LAND] },
            },
          ],
        },
        {
          id: '120-2-2',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [3] },
            },
          ],
        },
      ],
    },
    {
      id: 3,
      name: 'Surplus',
      tags: [CardTag.EVENT],
      illustration: 'cards/120_3.jpg',
      permanent: true,
      passives: [
        {
          id: '120-3-1',
          type: PassiveType.REPLACE_RESOURCE_PRODUCTION,
          resources: {
            [ResourceType.GOLD]: 1,
            [ResourceType.GOODS]: 1,
          },
        },
      ],
      actions: [
        {
          id: '120-3-1',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [4] },
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: 'Obsolete Farms',
      tags: [CardTag.EVENT],
      permanent: true,
      illustration: 'cards/120_4.jpg',
      actions: [
        {
          id: '120-4-1',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                scope: [TargetScope.BOARD, TargetScope.DECK, TargetScope.DISCARD],
                produces: [ResourceType.GOLD],
              },
            },
            {
              id: 2,
              type: ActionEffectType.DESTROY_CARD,
              cards: { scope: [TargetScope.SELF] },
            },
          ],
        },
      ],
    },
  ],
};
