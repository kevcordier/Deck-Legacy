import { CardTag, PassiveType } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

export const etherCrystal: CardDef = {
  id: 92,
  name: 'Ether Crystal',
  states: [
    {
      id: 1,
      name: 'Ether Crystal',
      tags: [CardTag.ARTIFACT, CardTag.PERMANENT],
      illustration: 'cards/92_1.jpg',
      glory: { amount: 10 },
      passives: [
        {
          id: '92-1-1',
          type: PassiveType.CANT_BE_DESTROYED,
        },
      ],
    },
  ],
};
