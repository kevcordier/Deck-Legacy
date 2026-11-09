import { gainAny } from './gainAny';
import { KNIGHT } from './romanceConstants';
import { CardTag, ResourceType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const W = ResourceType.WEAPON;

/** Lancelot (Foundations 96). */
export const lancelot: CardDef = {
  id: 269,
  name: 'Lancelot',
  states: [
    {
      id: 1,
      name: 'Lancelot',
      illustration: 'cards/269_1.jpg',
      tags: [CardTag.PERSON],
      productions: [{ [W]: 1 }],
      upgrade: [{ cost: { discard: [{ ...KNIGHT, pickNumber: 2 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Sir Lancelot',
      illustration: 'cards/269_2.jpg',
      tags: [CardTag.PERSON, CardTag.KNIGHT],
      productions: [{ [W]: 3 }],
      actions: [
        {
          id: '269-2-1',
          actionEffects: [
            {
              ...gainAny(1, 1),
              repeat: 'valuePerElement',
              valuePerElement: {
                amount: 1,
                cards: { ...KNIGHT, scope: [TargetScope.BOARD, TargetScope.PERMANENTS] },
                includeSelf: true,
              },
            },
          ],
        },
      ],
    },
  ],
};
