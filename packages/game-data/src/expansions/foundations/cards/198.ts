import { undiscover } from './undiscover';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef } from '@deck-legacy/engine/domain/types';

const discardSwordProducer = (id: string): CardAction => ({
  id,
  trigger: Trigger.ON_PLAY,
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.DISCARD_CARD,
      cards: {
        scope: [TargetScope.BOARD, TargetScope.FRIENDLY],
        produces: [ResourceType.WEAPON],
        pickNumber: 1,
      },
    },
  ],
});

const defeatWounded = (id: string, resource: ResourceType): CardAction => ({
  id,
  defeat: true,
  cost: { resources: [{ [resource]: 1 }] },
  actionEffects: undiscover(1, 'Invasion', true),
});

/** Enemy Spearman (Foundations 25, 28). */
export const enemySpearman: CardDef = {
  id: 198,
  name: 'Enemy Spearman',
  states: [
    {
      id: 1,
      name: 'Enemy Spearman',
      tags: [CardTag.ENEMY],
      negative: true,
      glory: { amount: -3 },
      actions: [
        discardSwordProducer('198-1-1'),
        {
          id: '198-1-2',
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
          // If 2 other enemies are in play
          id: '198-1-3',
          trigger: Trigger.END_OF_TURN,
          condition: {
            type: 'cardCount',
            cards: { scope: [TargetScope.BOARD], tags: [CardTag.ENEMY] },
            min: 2,
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: { scope: [TargetScope.DISCARD, TargetScope.FRIENDLY], pickNumber: 1 },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Wounded Spearman',
      tags: [CardTag.ENEMY],
      negative: true,
      actions: [
        discardSwordProducer('198-2-1'),
        defeatWounded('198-2-2', ResourceType.WEAPON),
        defeatWounded('198-2-3', ResourceType.IRON),
        {
          id: '198-2-4',
          trigger: Trigger.END_OF_TURN,
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
