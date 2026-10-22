import { crossOutProduction } from './crossOutProduction';
import { undiscover } from './undiscover';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Enemy Commander (Foundations 23). */
export const enemyCommander: CardDef = {
  id: 196,
  name: 'Enemy Commander',
  states: [
    {
      id: 1,
      name: 'Enemy Commander',
      tags: [CardTag.ENEMY],
      negative: true,
      glory: { amount: -6 },
      actions: [
        {
          id: '196-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { scope: [TargetScope.DISCARD], tags: [CardTag.ENEMY], autoPick: true },
            },
          ],
        },
        {
          id: '196-1-2',
          cost: { resources: [{ [ResourceType.WEAPON]: 3 }] },
          actionEffects: [
            { id: 1, type: ActionEffectType.DISCARD_CARD, cards: { scope: [TargetScope.SELF] } },
          ],
        },
        {
          id: '196-1-3',
          defeat: true,
          cost: { resources: [{ [ResourceType.WEAPON]: 5 }] },
          actionEffects: undiscover(1, 'Invasion'),
        },
        {
          // For every 3 enemies in play (this one included), cross out 1 production
          id: '196-1-4',
          trigger: Trigger.END_OF_TURN,
          actionEffects: [
            {
              ...crossOutProduction(1, { scope: [TargetScope.BOARD, TargetScope.DISCARD] }),
              repeat: 'valuePerElement',
              valuePerElement: {
                amount: 1,
                cards: { scope: [TargetScope.BOARD], tags: [CardTag.ENEMY] },
                includeSelf: true,
                per: 3,
              },
            },
          ],
        },
      ],
    },
  ],
};
