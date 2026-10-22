import { flipTo } from './flipTo';
import { hasStepsLeft } from './hasStepsLeft';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const BEAUFORT = 332;
const TAGS = [CardTag.PERSON, CardTag.KNIGHT];

/** Sir Beaufort (Foundations 141): learns while no negative card is in play. */
export const sirBeaufort: CardDef = {
  id: 314,
  name: 'Sir Beaufort',
  states: [
    {
      id: 1,
      name: 'Sir Beaufort',
      tags: TAGS,
      productions: [{ [ResourceType.WEAPON]: 1 }],
      track: { inOrder: true, steps: [1, 2, 3, 4, 5].map(id => ({ id })) },
      actions: [
        {
          id: '314-1-1',
          trigger: Trigger.END_OF_TURN,
          condition: {
            type: 'and',
            conditions: [
              hasStepsLeft(BEAUFORT),
              {
                type: 'cardCount',
                cards: { scope: [TargetScope.BOARD, TargetScope.PERMANENTS, TargetScope.ENEMY] },
                max: 0,
              },
            ],
          },
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
        { id: '314-1-2', trigger: Trigger.ON_TRACK_END, actionEffects: [flipTo(1, 2)] },
      ],
    },
    {
      id: 2,
      name: 'Sir Beaufort, the Learned',
      tags: TAGS,
      productions: [{ [ResourceType.SCIENCE]: 2 }],
      glory: { amount: 5 },
    },
  ],
};
