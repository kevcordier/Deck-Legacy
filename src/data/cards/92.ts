import { CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const etherCrystal: CardDef = {
  id: 92,
  name: 'Ether Crystal',
  states: [
    {
      id: 1,
      name: 'Ether Crystal',
      permanent: true,
      tags: [CardTag.ARTIFACT],
      illustration: 'cards/92_1.jpg',
      glory: { amount: 10 },
      description: true,
    },
  ],
};
