import { schoolStates } from './schoolStates';
import { SCIENCE } from './scienceConstants';
import { CardTag, PassiveType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** School (Foundations 76): once renowned, upgrading persons does not end the turn. */
export const school76: CardDef = {
  id: 249,
  name: 'Small School',
  states: [
    ...schoolStates(249),
    {
      id: 4,
      name: 'Renowned School',
      tags: [CardTag.BUILDING],
      productions: [{ [SCIENCE]: 1 }],
      glory: { amount: 6 },
      passives: [
        {
          id: '249-4-1',
          type: PassiveType.UPGRADE_KEEPS_TURN,
          cards: { scope: [TargetScope.BOARD, TargetScope.PERMANENTS], tags: [CardTag.PERSON] },
        },
      ],
    },
  ],
};
