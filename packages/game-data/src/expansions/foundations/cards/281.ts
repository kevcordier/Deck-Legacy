import { flipTo } from './flipTo';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const TAGS = [CardTag.PERMANENT];
/** The 9 medals of the grid, then the total bonus: 4 for each line of 3 different values. */
const statuesGlory = { amount: 0, emptyValues: 9, gridBonus: 4 };

/** Statues (Foundations 108): 9 medals written with stone, in order. */
export const statues: CardDef = {
  id: 281,
  name: 'Statues',
  states: [
    {
      id: 1,
      name: 'Statues',
      tags: TAGS,
      glory: statuesGlory,
      track: { inOrder: true, steps: Array.from({ length: 9 }, (_, index) => ({ id: index + 1 })) },
      actions: [
        {
          // Spend up to 20 stone to write half of it (rounded down) in the next medal
          id: '281-1-1',
          endsTurn: true,
          cost: { resources: [{ [ResourceType.STONE]: 'any' }] },
          amountLimits: { min: 2, max: 20 },
          amountPer: 'all',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_GLORY,
              cards: { scope: [TargetScope.SELF] },
              valuePerElement: { amount: 1, paid: true, per: 2 },
            },
            { id: 2, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
        { id: '281-1-2', trigger: Trigger.ON_TRACK_END, actionEffects: [flipTo(1, 2)] },
      ],
    },
    // The other side writes the total of the medals and the bonus: the same glory
    { id: 2, name: 'Statues', tags: TAGS, glory: statuesGlory },
  ],
};
