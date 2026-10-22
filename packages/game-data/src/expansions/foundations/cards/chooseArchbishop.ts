import { ARCHBISHOP_NAMES, BLESSED, CHURCH_CARDS } from './churchConstants';
import { ActionEffectType, CardTag, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect } from '@deck-legacy/engine/domain/types';

const ARCHBISHOP = CHURCH_CARDS.archbishop;
const BENEDICTUS = 3;
const SILVANUS = 6;
/** The Archbishop card, whether the choice comes from it (round start) or from card 71. */
const ON_CARD = [TargetScope.PERMANENTS, TargetScope.SELF];

/** Benedictus, before the round: block 3 persons of the deck this round to mark 1 box. */
const benedictusTask: ActionEffect = {
  id: 2,
  type: ActionEffectType.CHOOSE_EFFECT,
  // Option ids after the 6 Archbishops: their texts share the action's keys
  effects: [
    {
      id: 7,
      type: ActionEffectType.SEQUENCE,
      condition: {
        type: 'and',
        conditions: [
          {
            type: 'cardCount',
            cards: { scope: [TargetScope.DECK], tags: [CardTag.PERSON] },
            min: 3,
          },
          {
            type: 'cardCount',
            cards: { ids: [ARCHBISHOP], scope: [...ON_CARD, TargetScope.WITH_TRACK] },
            min: 1,
          },
        ],
      },
      effects: [
        {
          id: 1,
          type: ActionEffectType.BLOCK_CARD,
          cards: { scope: [TargetScope.DECK], tags: [CardTag.PERSON], pickNumber: 3 },
        },
        {
          id: 2,
          type: ActionEffectType.TRACK_ADVANCE,
          cards: { ids: [ARCHBISHOP], scope: ON_CARD },
        },
      ],
    },
    // Do nothing
    { id: 8, type: ActionEffectType.ADD_CUMULATED, value: 0, cards: { scope: [TargetScope.SELF] } },
  ],
};

/** Silvanus, at the start of the round: up to 3 blessed cards of the deck start in play. */
const silvanusStart: ActionEffect = {
  id: 2,
  type: ActionEffectType.PLACE_CARD_IN_PILE,
  deck: 'board',
  position: 'top',
  cards: { ...BLESSED, scope: [TargetScope.DECK], pickMin: 0, pickMax: 3 },
};

/**
 * Choose the Archbishop of the round: the Archbishop card turns to that state. Not the current one
 * (the Archbishop of the previous round). `roundStart`: the "before / start of round" effects of
 * Benedictus and Silvanus apply.
 */
export function chooseArchbishop(id: number, roundStart: boolean): ActionEffect {
  const options = ARCHBISHOP_NAMES.map((name, index): ActionEffect => {
    const stateId = index + 1;
    const extra: ActionEffect[] = [];
    if (roundStart && stateId === BENEDICTUS) extra.push(benedictusTask);
    if (roundStart && stateId === SILVANUS) extra.push(silvanusStart);
    return {
      id: stateId,
      type: ActionEffectType.SEQUENCE,
      // At discovery, the card's first state is not chosen yet
      ...(roundStart && {
        condition: {
          type: 'not',
          condition: {
            type: 'cardCount',
            cards: { ids: [ARCHBISHOP], scope: ON_CARD, name },
            min: 1,
          },
        },
      }),
      effects: [
        {
          id: 1,
          type: ActionEffectType.UPGRADE_CARD,
          cards: { ids: [ARCHBISHOP], scope: ON_CARD },
          states: { ids: [stateId] },
        },
        ...extra,
      ],
    };
  });
  return { id, type: ActionEffectType.CHOOSE_EFFECT, effects: options };
}
