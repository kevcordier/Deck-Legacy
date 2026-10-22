import { gainAny } from './gainAny';
import { quest } from './quest';
import { SCARVES } from './romanceConstants';
import { CardTag, ResourceType, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { CardDef, CardSelector } from '@deck-legacy/engine/domain/types';

const RED = SCARVES[0];
const herKnightDiscarded: CardSelector = { scope: [TargetScope.DISCARDED], stickerIds: [RED] };

/** Imprisoned Princess / Diana (Foundations 99): the red scarf. */
export const diana: CardDef = {
  id: 272,
  name: 'Imprisoned Princess',
  states: [
    quest({
      cardId: 272,
      name: 'Imprisoned Princess',
      timer: [1, 2, 3],
      rescue: { cost: { resources: [{ [ResourceType.WEAPON]: 7 }] } },
      scarf: RED,
    }),
    {
      id: 2,
      name: 'Diana',
      tags: [CardTag.PERSON, CardTag.LADY, CardTag.SCARF],
      glory: { amount: 7 },
      actions: [
        {
          id: '272-2-1',
          trigger: Trigger.ON_DISCARD,
          triggeredBy: herKnightDiscarded,
          condition: { type: 'cardCount', cards: herKnightDiscarded, min: 1 },
          actionEffects: [gainAny(1, 2)],
        },
        { id: '272-2-2', actionEffects: [gainAny(1, 1)] },
      ],
    },
  ],
};
