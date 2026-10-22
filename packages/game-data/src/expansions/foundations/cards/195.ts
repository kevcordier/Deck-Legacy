import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Enemy Prince (Foundations 22): once defeated, a prisoner to purge or to ransom. */
export const enemyPrince: CardDef = {
  id: 195,
  name: 'Enemy Prince',
  states: [
    {
      id: 1,
      name: 'Enemy Prince',
      tags: [CardTag.ENEMY],
      negative: true,
      glory: { amount: -8 },
      track: { inOrder: true, steps: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] },
      actions: [
        {
          id: '195-1-1',
          cost: { resources: [{ [ResourceType.WEAPON]: 3 }] },
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
        {
          id: '195-1-2',
          trigger: Trigger.ON_TRACK_END,
          defeat: true,
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
          id: '195-1-3',
          trigger: Trigger.END_OF_TURN,
          actionEffects: [{ id: 1, type: ActionEffectType.ADVANCE_STORY, value: 1 }],
        },
      ],
    },
    {
      id: 2,
      name: 'Valuable Prisoner',
      tags: [CardTag.STATE],
      glory: { amount: 4 },
      actions: [
        {
          id: '195-2-1',
          actionEffects: [
            { id: 1, type: ActionEffectType.DESTROY_CARD, cards: { scope: [TargetScope.SELF] } },
            {
              id: 2,
              type: ActionEffectType.CHOOSE_EFFECT,
              effects: [
                {
                  id: 1,
                  type: ActionEffectType.ADD_RESOURCES,
                  resources: { [ResourceType.GOLD]: 5 },
                },
                {
                  id: 2,
                  type: ActionEffectType.DISCARD_CARD,
                  cards: { scope: [TargetScope.BOARD], tags: [CardTag.ENEMY], autoPick: true },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
