import { gainAny } from './gainAny';
import { quest } from './quest';
import { SCARVES } from './romanceConstants';
import { CardTag, PassiveType, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { CardDef, CardSelector } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

const YELLOW = SCARVES[1];
const herKnightPlayed: CardSelector = { scope: [TargetScope.DRAWN], stickerIds: [YELLOW] };

/** Kidnapped Woman / Seraphine (Foundations 100): the yellow scarf. */
export const seraphine: CardDef = {
  id: 273,
  name: 'Kidnapped Woman',
  states: [
    quest({
      cardId: 273,
      name: 'Kidnapped Woman',
      timer: [1, 2],
      rescue: { discard: [{ tags: [CardTag.LAND], pickNumber: 2 }] },
      scarf: YELLOW,
    }),
    {
      id: 2,
      name: 'Seraphine',
      tags: [CardTag.PERSON, CardTag.LADY, CardTag.SCARF],
      glory: { amount: 7 },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '273-2-1',
          trigger: Trigger.ON_PLAY,
          triggeredBy: herKnightPlayed,
          condition: { type: 'cardCount', cards: herKnightPlayed, min: 1 },
          actionEffects: [gainAny(1, 3)],
        },
      ],
    },
  ],
};
