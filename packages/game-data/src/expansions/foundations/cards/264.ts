import { destroySelf } from './destroySelf';
import { ROMANCE_CARDS } from './romanceConstants';
import { ActionEffectType, CardTag, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Damsel in Distress (Foundations 91): discovers a quest at the end of each round. */
export const damselInDistress: CardDef = {
  id: 264,
  name: 'Damsel in Distress',
  states: [
    {
      id: 1,
      name: 'Damsel in Distress',
      tags: [CardTag.PERMANENT],
      track: {
        inOrder: true,
        steps: ROMANCE_CARDS.ladies.map((ladyId, index) => ({
          id: index + 1,
          effects: [{ id: 1, type: ActionEffectType.DISCOVER_CARD, cards: { ids: [ladyId] } }],
        })),
      },
      actions: [
        {
          id: '264-1-1',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
        { id: '264-1-2', trigger: Trigger.ON_TRACK_END, actionEffects: [destroySelf(1)] },
      ],
    },
  ],
};
