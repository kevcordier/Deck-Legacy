import { flipTo } from './flipTo';
import { KNIGHT, ROMANCE_CARDS } from './romanceConstants';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, CardSelector } from '@deck-legacy/engine/domain/types';

const { GOLD, WEAPON } = ResourceType;
const knightDiscarded: CardSelector = { ...KNIGHT, scope: [TargetScope.DISCARDED] };

/** Arthur (Foundations 89): becomes King Arthur. */
export const arthur: CardDef = {
  id: 262,
  name: 'Arthur',
  states: [
    {
      id: 1,
      name: 'Arthur',
      tags: [CardTag.PERSON],
      productions: [{ [WEAPON]: 1 }],
      track: { inOrder: true, steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
      actions: [
        {
          id: '262-1-1',
          cost: { discard: [{ tags: [CardTag.PERSON], pickNumber: 2 }] },
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
        { id: '262-1-2', trigger: Trigger.ON_TRACK_END, actionEffects: [flipTo(1, 2)] },
      ],
    },
    {
      id: 2,
      name: 'King Arthur',
      tags: [CardTag.PERSON, CardTag.KNIGHT],
      productions: [{ [GOLD]: 1, [WEAPON]: 1 }],
      glory: { amount: 13 },
      actions: [
        {
          id: '262-2-1',
          condition: {
            type: 'cardCount',
            cards: { ids: [ROMANCE_CARDS.roundTable], scope: [TargetScope.DISCOVERY] },
            min: 1,
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: { ids: [ROMANCE_CARDS.roundTable] },
            },
          ],
        },
        {
          id: '262-2-2',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              cards: {
                scope: [TargetScope.BOARD, TargetScope.PERMANENTS, TargetScope.SELF],
                tags: [CardTag.PERSON],
                withoutStickerIds: [11],
                pickNumber: 1,
              },
              stickers: { ids: [11] },
            },
          ],
        },
        {
          // The knight comes back into play and King Arthur is discarded in his place.
          id: '262-2-3',
          trigger: Trigger.ON_DISCARD,
          optional: true,
          triggeredBy: knightDiscarded,
          condition: { type: 'cardCount', cards: knightDiscarded, min: 1 },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { ...knightDiscarded, pickNumber: 1 },
            },
            { id: 2, type: ActionEffectType.DISCARD_CARD, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
    },
  ],
};
