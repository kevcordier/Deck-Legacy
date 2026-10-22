import { BLESSED } from './churchConstants';
import { flipTo } from './flipTo';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const W = ResourceType.WEAPON;

/** Young Percival (Foundations 66): becomes a blessed knight. */
export const percival: CardDef = {
  id: 239,
  name: 'Young Percival',
  states: [
    {
      id: 1,
      name: 'Young Percival',
      tags: [CardTag.PERSON],
      productions: [{ [W]: 1 }],
      track: { inOrder: true, steps: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] },
      actions: [
        {
          id: '239-1-1',
          cost: { discard: [{ ...BLESSED, pickNumber: 1 }] },
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
        { id: '239-1-2', trigger: Trigger.ON_TRACK_END, actionEffects: [flipTo(1, 2)] },
      ],
    },
    {
      id: 2,
      name: 'Sir Percival',
      tags: [CardTag.PERSON, CardTag.KNIGHT, CardTag.BLESSED],
      productions: [{ [W]: 2 }],
      glory: { amount: 5 },
    },
  ],
};
