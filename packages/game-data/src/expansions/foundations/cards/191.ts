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

const topCardIfFriendly = { scope: [TargetScope.TOP_OF_DECK, TargetScope.FRIENDLY] };

/** Enemy Archer (Foundations 18). */
export const enemyArcher: CardDef = {
  id: 191,
  name: 'Enemy Archer',
  states: [
    {
      id: 1,
      name: 'Enemy Archer',
      tags: [CardTag.ENEMY],
      negative: true,
      glory: { amount: -3 },
      actions: [
        {
          id: '191-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { scope: [TargetScope.TOP_OF_DECK], pickNumber: 2 },
            },
          ],
        },
        {
          id: '191-1-2',
          defeat: true,
          cost: { resources: [{ [ResourceType.WEAPON]: 3 }] },
          actionEffects: undiscover(1, 'Invasion'),
        },
        {
          // If another enemy is in play: cross out 1 production or 1 activated effect
          id: '191-1-3',
          trigger: Trigger.END_OF_TURN,
          condition: {
            type: 'cardCount',
            cards: { scope: [TargetScope.BOARD], tags: [CardTag.ENEMY] },
            min: 1,
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.CHOOSE_EFFECT,
              effects: [
                crossOutProduction(1, topCardIfFriendly),
                { id: 2, type: ActionEffectType.CROSS_OUT_ACTION, cards: topCardIfFriendly },
              ],
            },
          ],
        },
      ],
    },
  ],
};
