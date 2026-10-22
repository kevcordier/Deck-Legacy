import { quest } from './quest';
import { KNIGHT, SCARVES } from './romanceConstants';
import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const PURPLE = SCARVES[4];

/** Trapped Woman / Guinevere (Foundations 103): the purple scarf. */
export const guinevere: CardDef = {
  id: 276,
  name: 'Trapped Woman',
  states: [
    quest({
      cardId: 276,
      name: 'Trapped Woman',
      timer: [1, 2, 3],
      rescue: {
        discard: [{ tags: [CardTag.LAND], produces: [ResourceType.STONE], pickNumber: 1 }],
      },
      scarf: PURPLE,
    }),
    {
      id: 2,
      name: 'Guinevere',
      tags: [CardTag.PERSON, CardTag.LADY, CardTag.SCARF],
      glory: { amount: 7 },
      passives: [
        {
          id: '276-2-1',
          type: PassiveType.MULTIPLY_PRODUCTION,
          amount: 2,
          cards: { ...KNIGHT, scope: [TargetScope.ANY] },
        },
      ],
      actions: [
        {
          id: '276-2-1',
          unlimited: true,
          cost: { discard: [{ stickerIds: [PURPLE], pickNumber: 1 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: {
                scope: [TargetScope.DISCARD],
                tags: [CardTag.PERSON],
                withoutStickerIds: [PURPLE],
                pickNumber: 1,
              },
            },
          ],
        },
      ],
    },
  ],
};
