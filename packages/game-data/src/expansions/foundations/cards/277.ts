import { quest } from './quest';
import { SCARVES } from './romanceConstants';
import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

const WHITE = SCARVES[5];
const GREEN_BOXES = [1, 2, 3, 4, 5];

/** Cursed Hag / Andoniel (Foundations 104): the white scarf. */
export const andoniel: CardDef = {
  id: 277,
  name: 'Cursed Hag',
  states: [
    quest({
      cardId: 277,
      name: 'Cursed Hag',
      enemy: true,
      tasks: GREEN_BOXES.map(id => ({ id })),
      taskAction: {
        cost: {
          resources: [{ [ResourceType.GOODS]: 3 }],
          discard: [{ tags: [CardTag.KNIGHT], pickNumber: 1 }],
        },
        condition: { type: 'not', condition: { type: 'stepsMarked', ids: GREEN_BOXES } },
        actionEffects: [
          {
            id: 1,
            type: ActionEffectType.TRACK_ADVANCE,
            cards: { scope: [TargetScope.SELF] },
            steps: { pickNumber: 1, ids: GREEN_BOXES },
          },
        ],
      },
      timer: [11, 12],
      rescue: { condition: { type: 'stepsMarked', ids: GREEN_BOXES } },
      scarf: WHITE,
    }),
    {
      id: 2,
      name: 'Andoniel',
      tags: [CardTag.PERSON, CardTag.LADY, CardTag.SCARF],
      glory: { amount: 15 },
      actions: [
        {
          id: '277-2-1',
          trigger: Trigger.END_OF_TURN,
          optional: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_BOARD_EFFECT,
              cards: {
                scope: [TargetScope.BOARD, TargetScope.SELF],
                tags: [CardTag.SCARF],
                pickMin: 0,
                pickMax: 99,
              },
              effect: CardPassives[PassiveType.STAY_IN_PLAY],
            },
          ],
        },
      ],
    },
  ],
};
