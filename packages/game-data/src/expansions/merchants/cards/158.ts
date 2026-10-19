import { CardTag, PassiveType } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

export const etherEnhancer: CardDef = {
  id: 158,
  name: 'Ether Enhancer',
  states: [
    {
      id: 1,
      name: 'Ether Enhancer',
      tags: [CardTag.ARTIFACT, CardTag.PERMANENT],
      glory: { amount: 10 },
      passives: [{ id: '158-1-1', type: PassiveType.CANT_BE_DESTROYED }],
    },
  ],
};
