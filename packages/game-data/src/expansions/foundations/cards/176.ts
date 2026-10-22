import { INFECTED, INFECTION_MARKED, PRINTED_INFECTED } from './infectionConstants';
import { ActionEffectType, CardTag, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardDef } from '@deck-legacy/engine/domain/types';

/** Every person in play gets the infection sticker, if it doesn't have it. */
const infectPersonsInPlay: ActionEffect = {
  id: 1,
  type: ActionEffectType.ADD_STICKER,
  cards: {
    scope: [TargetScope.BOARD],
    tags: [CardTag.PERSON],
    withoutStickerIds: [INFECTED],
    autoPick: true,
  },
  stickers: { ids: [INFECTED] },
};

/** Black Plague (Foundations 3): spreads the infection and makes the infected persons die. */
export const blackPlague: CardDef = {
  id: 176,
  name: 'Black Plague',
  states: [
    {
      id: 1,
      name: 'Black Plague',
      tags: [CardTag.PERMANENT],
      negative: true,
      actions: [
        {
          // Persons played while an infected card is in play
          id: '176-1-1',
          trigger: Trigger.ON_PLAY,
          triggeredBy: { scope: [TargetScope.DRAWN], tags: [CardTag.PERSON] },
          condition: {
            type: 'or',
            conditions: [
              {
                type: 'cardCount',
                cards: { scope: [TargetScope.BOARD], stickerIds: [INFECTED] },
                min: 1,
              },
              {
                type: 'cardCount',
                cards: { scope: [TargetScope.BOARD], ids: PRINTED_INFECTED },
                min: 1,
              },
            ],
          },
          actionEffects: [infectPersonsInPlay],
        },
        {
          // A card printed with the infection icon (Rats, Contamination) is played
          id: '176-1-2',
          trigger: Trigger.ON_PLAY,
          triggeredBy: { scope: [TargetScope.DRAWN], ids: PRINTED_INFECTED },
          actionEffects: [infectPersonsInPlay],
        },
        {
          // An infected person is discarded from play: mark a box, the second one destroys it
          id: '176-1-3',
          trigger: Trigger.ON_DISCARD,
          triggeredBy: {
            scope: [TargetScope.DISCARDED_FROM_PLAY],
            tags: [CardTag.PERSON],
            stickerIds: [INFECTED],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                scope: [TargetScope.DISCARDED],
                tags: [CardTag.PERSON],
                stickerIds: [INFECTION_MARKED],
                autoPick: true,
              },
            },
            {
              id: 2,
              type: ActionEffectType.ADD_STICKER,
              cards: {
                scope: [TargetScope.DISCARDED],
                tags: [CardTag.PERSON],
                stickerIds: [INFECTED],
                withoutStickerIds: [INFECTION_MARKED],
                autoPick: true,
              },
              stickers: { ids: [INFECTION_MARKED] },
            },
          ],
        },
      ],
    },
  ],
};
