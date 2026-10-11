import { banditActions, prisonerState } from './124';
import { CardTag } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

export const greenBandit: CardDef = {
  id: 127,
  name: 'Bandit',
  states: [
    {
      id: 1,
      name: 'Bandit',
      tags: [CardTag.ENEMY],
      negative: true,
      illustration: 'cards/127_1.jpg',
      glory: { amount: -2 },
      actions: banditActions(127),
    },
    prisonerState(127),
  ],
};
