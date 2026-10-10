import { CardTag } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

export const horse: CardDef = {
  id: 97,
  name: 'Horse',
  states: [
    {
      id: 1,
      name: 'Horse',
      tags: [CardTag.LIVESTOCK, CardTag.HORSE],
      illustration: 'cards/97_1.jpg',
      productions: [{ gold: 1 }],
    },
  ],
};
