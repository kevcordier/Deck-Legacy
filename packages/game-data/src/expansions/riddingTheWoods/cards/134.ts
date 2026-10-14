import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, CardSelector } from '@deck-legacy/engine/domain/types';

const enemiesJustPlayed: CardSelector = { scope: [TargetScope.DRAWN], tags: [CardTag.ENEMY] };

export const treasureWagon: CardDef = {
  id: 134,
  name: 'Treasure Wagon',
  states: [
    {
      id: 1,
      name: 'Treasure Wagon',
      tags: [CardTag.WAGON],
      illustration: 'cards/134_1.jpg',
      productions: [{ [ResourceType.GOLD]: 9 }],
      glory: { amount: 0 },
      actions: [
        {
          id: '134-1-1',
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
          // already in play: 1 production per enemy just played
          id: '134-1-2',
          trigger: Trigger.ON_PLAY,
          triggeredBy: enemiesJustPlayed,
          condition: { type: 'not', condition: { type: 'justPlayed' } },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
              resourceScopes: ['production'],
              resources: { [ResourceType.GOLD]: 1 },
              cards: { scope: [TargetScope.SELF] },
              valuePerElement: { amount: 1, cards: enemiesJustPlayed },
            },
          ],
        },
        {
          id: '134-1-3',
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
