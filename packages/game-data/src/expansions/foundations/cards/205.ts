import { crossOutProduction } from './crossOutProduction';
import { destroySelf } from './destroySelf';
import { flipTo } from './flipTo';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Jaguar (Foundations 32). */
export const jaguar: CardDef = {
  id: 205,
  name: 'Jaguar',
  states: [
    {
      id: 1,
      name: 'Jaguar',
      tags: [CardTag.ENEMY],
      negative: true,
      track: { inOrder: true, steps: [{ id: 1 }, { id: 2 }] },
      actions: [
        {
          id: '205-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [{ ...crossOutProduction(1, { scope: [TargetScope.BOARD] }), repeat: 2 }],
        },
        {
          id: '205-1-2',
          cost: { resources: [{ [ResourceType.WEAPON]: 2 }] },
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
        {
          id: '205-1-3',
          trigger: Trigger.ON_TRACK_END,
          defeat: true,
          actionEffects: [flipTo(1, 2)],
        },
      ],
    },
    {
      id: 2,
      name: 'Enraged Jaguar',
      tags: [CardTag.ENEMY],
      negative: true,
      actions: [
        {
          id: '205-2-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.CHOOSE_EFFECT,
              effects: [
                {
                  id: 1,
                  type: ActionEffectType.DESTROY_CARD,
                  cards: { scope: [TargetScope.BOARD], tags: [CardTag.PERSON], pickNumber: 1 },
                },
                {
                  id: 2,
                  type: ActionEffectType.DISCARD_CARD,
                  cards: { scope: [TargetScope.BOARD], tags: [CardTag.PERSON], pickNumber: 3 },
                },
              ],
            },
          ],
        },
        {
          id: '205-2-2',
          defeat: true,
          cost: { resources: [{ [ResourceType.WEAPON]: 3 }] },
          actionEffects: [destroySelf(1)],
        },
      ],
    },
  ],
};
