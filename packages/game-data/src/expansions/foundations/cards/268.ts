import { flipTo } from './flipTo';
import { anyPairInPlay, matchingScarves } from './matchingScarves';
import { KNIGHT, LADY } from './romanceConstants';
import { ActionEffectType, CardTag, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardDef } from '@deck-legacy/engine/domain/types';

const TAGS = [CardTag.STATE];
const KNIGHTS_OR_LADIES = [CardTag.KNIGHT, CardTag.LADY];

const glory2On = (id: number, cards: ActionEffect['cards']): ActionEffect => ({
  id,
  type: ActionEffectType.ADD_STICKER,
  cards,
  stickers: { ids: [8] },
});

/** Small Court (Foundations 95): courts knights and ladies, then famous persons. */
export const court: CardDef = {
  id: 268,
  name: 'Small Court',
  states: [
    {
      id: 1,
      name: 'Small Court',
      tags: TAGS,
      actions: [
        {
          id: '268-1-1',
          endsTurn: true,
          cost: {
            discard: [
              { ...KNIGHT, pickNumber: 1 },
              { ...LADY, pickNumber: 1 },
            ],
          },
          actionEffects: [
            flipTo(1, 2),
            glory2On(2, { scope: [TargetScope.ANY], tags: [CardTag.PERSON], pickNumber: 1 }),
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Court',
      tags: TAGS,
      actions: [
        {
          id: '268-2-1',
          endsTurn: true,
          cost: { discard: [{ tags: KNIGHTS_OR_LADIES, pickMin: 1, pickMax: 99 }] },
          actionEffects: [
            flipTo(1, 3),
            glory2On(2, {
              scope: [TargetScope.DISCARDED],
              tags: KNIGHTS_OR_LADIES,
              autoPick: true,
            }),
          ],
        },
      ],
    },
    {
      id: 3,
      name: 'Large Court',
      tags: TAGS,
      actions: [
        {
          id: '268-3-1',
          endsTurn: true,
          condition: anyPairInPlay,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.CHOOSE_EFFECT,
              effects: matchingScarves([
                glory2On(3, { scope: [TargetScope.DISCARDED], autoPick: true }),
                flipTo(4, 4),
              ]),
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: 'Famous Court',
      tags: TAGS,
      glory: { amount: 0, emptyValues: 4 },
      // The 4 medals: a box marked for each name written
      track: { inOrder: true, steps: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] },
      actions: [
        {
          id: '268-4-1',
          endsTurn: true,
          condition: {
            type: 'cardCount',
            cards: { scope: [TargetScope.SELF, TargetScope.WITH_TRACK] },
            min: 1,
          },
          cost: {
            discard: [{ tags: [CardTag.PERSON], notWrittenHere: true, pickNumber: 1 }],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_GLORY,
              cards: { scope: [TargetScope.SELF] },
              valuePerElement: {
                amount: 1,
                glory: true,
                cards: { scope: [TargetScope.DISCARDED], tags: [CardTag.PERSON] },
              },
              writeNames: true,
            },
            { id: 2, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
    },
  ],
};
