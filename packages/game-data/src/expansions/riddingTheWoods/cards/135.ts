import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

export const treasureWagon: CardDef = {
  id: 135,
  name: 'Treasure Wagon',
  states: [
    {
      id: 1,
      name: 'Treasure Wagon',
      tags: [CardTag.WAGON],
      illustration: 'cards/135_1.jpg',
      productions: [{ [ResourceType.GOLD]: 9 }],
      glory: { amount: 0 },
      passives: [
        {
          id: '135-1-2',
          type: PassiveType.ADD_TRIGGER,
          trigger: {
            id: '135-1-2',
            type: Trigger.ON_PLAY,
            cards: { scope: [TargetScope.DRAWN], tags: [CardTag.ENEMY] },
            actions: [
              {
                id: 1,
                type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
                resourceScopes: ['production'],
                resources: { [ResourceType.GOLD]: 1 },
                cards: { scope: [TargetScope.TRIGGER_SOURCE] },
                // 1 production per enemy played
                valuePerElement: {
                  amount: 1,
                  cards: { scope: [TargetScope.DRAWN], tags: [CardTag.ENEMY] },
                },
              },
            ],
          },
        },
      ],
      actions: [
        {
          id: '135-1-1',
          trigger: Trigger.ON_PLAY,
          condition: {
            type: 'cardCount',
            cards: { scope: [TargetScope.BOARD, TargetScope.DRAWN], tags: [CardTag.ENEMY] },
            min: 1,
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
              resourceScopes: ['production'],
              resources: { [ResourceType.GOLD]: 1 },
              cards: { scope: [TargetScope.SELF] },
            },
          ],
        },
        {
          id: '135-1-3',
          trigger: Trigger.ON_PURGE,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_GLORY,
              cards: { scope: [TargetScope.SELF] },
              valuePerElement: { amount: 5, ownProduction: true },
            },
          ],
        },
      ],
    },
  ],
};
