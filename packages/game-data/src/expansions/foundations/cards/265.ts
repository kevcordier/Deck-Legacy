import { flipTo } from './flipTo';
import { gainAny } from './gainAny';
import { LADY } from './romanceConstants';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const W = ResourceType.WEAPON;
const discardLady = { discard: [{ ...LADY, pickNumber: 1 }] };

/** Gawain (Foundations 92): becomes Sir Gawain. */
export const gawain: CardDef = {
  id: 265,
  name: 'Gawain',
  states: [
    {
      id: 1,
      name: 'Gawain',
      tags: [CardTag.PERSON],
      productions: [{ [W]: 1 }],
      // 2 boxes, then the arrow
      track: { inOrder: true, steps: [{ id: 1 }, { id: 2 }, { id: 3, effects: [flipTo(1, 2)] }] },
      actions: [
        {
          id: '265-1-1',
          cost: discardLady,
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Sir Gawain',
      tags: [CardTag.PERSON, CardTag.KNIGHT],
      productions: [{ [W]: 1 }],
      actions: [{ id: '265-2-1', cost: discardLady, actionEffects: [gainAny(1, 2)] }],
    },
  ],
};
