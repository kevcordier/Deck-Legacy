import { quest } from './quest';
import { SCARVES } from './romanceConstants';
import { RESOURCE_STICKERS } from './scienceConstants';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const GREEN = SCARVES[3];
const TASKS = [1, 2, 3, 4];
/** Aleta's medals (6, 4, 4, 3, 3, 1): a box each, crossing it out takes its value off. */
const MEDALS = [6, 4, 4, 3, 3, 1];
const MEDAL_STEPS = MEDALS.map((_, index) => 11 + index);

/** Hostage / Aleta (Foundations 102): the green scarf. */
export const aleta: CardDef = {
  id: 275,
  name: 'Hostage',
  states: [
    quest({
      cardId: 275,
      name: 'Hostage',
      anyOrder: true,
      tasks: [
        ...TASKS.map(id => ({ id })),
        ...MEDALS.map((value, index) => ({
          id: MEDAL_STEPS[index],
          effects: [
            {
              id: 1,
              type: ActionEffectType.ADD_CUMULATED,
              cards: { scope: [TargetScope.SELF] },
              value,
            },
          ],
        })),
      ],
      taskAction: {
        cost: {
          resources: [{ [ResourceType.GOLD]: 5 }],
          discard: [{ tags: [CardTag.KNIGHT], pickNumber: 1 }],
        },
        condition: { type: 'not', condition: { type: 'stepsMarked', ids: TASKS } },
        actionEffects: [
          {
            id: 1,
            type: ActionEffectType.TRACK_ADVANCE,
            cards: { scope: [TargetScope.SELF] },
            steps: { pickNumber: 1, ids: TASKS },
          },
        ],
      },
      timer: [],
      rescue: { condition: { type: 'stepsMarked', ids: TASKS } },
      scarf: GREEN,
      endOfTurn: {
        // Cross out 1 of the medals on the other side
        id: '275-1-3',
        trigger: Trigger.END_OF_TURN,
        condition: { type: 'not', condition: { type: 'stepsMarked', ids: MEDAL_STEPS } },
        actionEffects: [
          {
            id: 1,
            type: ActionEffectType.TRACK_ADVANCE,
            cards: { scope: [TargetScope.SELF] },
            steps: { pickNumber: 1, ids: MEDAL_STEPS },
          },
        ],
      },
    }),
    {
      id: 2,
      name: 'Aleta',
      tags: [CardTag.PERSON, CardTag.LADY, CardTag.SCARF],
      // The medals not crossed out: 21 minus the values crossed out (kept on the card)
      glory: { amount: 21, valuePerElement: { amount: -1, accumulation: true } },
      actions: [
        {
          // shortcut: any resource sticker is offered, even one her knight already produces
          id: '275-2-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              cards: {
                scope: [TargetScope.BOARD, TargetScope.PERMANENTS],
                stickerIds: [GREEN],
                pickNumber: 1,
              },
              stickers: { ids: RESOURCE_STICKERS, pickNumber: 1 },
            },
          ],
        },
      ],
    },
  ],
};
