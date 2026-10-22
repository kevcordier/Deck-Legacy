import { undiscover } from './undiscover';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef, Condition } from '@deck-legacy/engine/domain/types';

const anotherEnemyInPlay: Condition = {
  type: 'cardCount',
  cards: { scope: [TargetScope.BOARD], tags: [CardTag.ENEMY] },
  min: 1,
};

const defeatWounded = (id: string, resource: ResourceType): CardAction => ({
  id,
  defeat: true,
  cost: { resources: [{ [resource]: 2 }] },
  actionEffects: undiscover(1, 'Invasion', true),
});

/** Infiltrator (Foundations 21). */
export const infiltrator: CardDef = {
  id: 194,
  name: 'Infiltrator',
  states: [
    {
      id: 1,
      name: 'Infiltrator',
      tags: [CardTag.ENEMY],
      negative: true,
      glory: { amount: -3 },
      actions: [
        {
          id: '194-1-1',
          defeat: true,
          cost: { resources: [{ [ResourceType.WEAPON]: 3 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [2] },
            },
          ],
        },
        {
          id: '194-1-2',
          trigger: Trigger.END_OF_TURN,
          condition: anotherEnemyInPlay,
          actionEffects: [
            ...undiscover(1, 'Invasion'),
            {
              id: 3,
              type: ActionEffectType.DESTROY_CARD,
              cards: { scope: [TargetScope.DISCARD, TargetScope.FRIENDLY], pickNumber: 1 },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Wounded Infiltrator',
      tags: [CardTag.ENEMY],
      negative: true,
      actions: [
        defeatWounded('194-2-1', ResourceType.WEAPON),
        defeatWounded('194-2-2', ResourceType.IRON),
        {
          id: '194-2-3',
          trigger: Trigger.END_OF_TURN,
          condition: anotherEnemyInPlay,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [1] },
            },
          ],
        },
      ],
    },
  ],
};
