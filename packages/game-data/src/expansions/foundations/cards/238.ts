import { BLESSED } from './churchConstants';
import { CardTag, PassiveType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Skepticism (Foundations 65): blessed cards cannot stay in play. */
export const skepticism: CardDef = {
  id: 238,
  name: 'Skepticism',
  states: [
    {
      id: 1,
      name: 'Skepticism',
      tags: [CardTag.EVENT],
      negative: true,
      glory: { amount: -2 },
      passives: [
        {
          id: '238-1-1',
          type: PassiveType.PREVENT_STAY_IN_PLAY,
          cards: { ...BLESSED, scope: [TargetScope.ANY] },
        },
      ],
    },
  ],
};
