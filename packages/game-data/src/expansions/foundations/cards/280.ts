import { CardTag, PassiveType, ResourceType } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const { GOLD, WOOD, STONE, IRON, WEAPON, HERB } = ResourceType;

/** Modern Art (Foundations 107): you cannot gain goods or science. */
export const modernArt: CardDef = {
  id: 280,
  name: 'Modern Art',
  states: [
    {
      id: 1,
      name: 'Modern Art',
      tags: [CardTag.STATE, CardTag.INVENTION],
      negative: true,
      glory: { amount: 2 },
      passives: [
        {
          id: '280-1-1',
          type: PassiveType.RESTRICT_GAIN,
          resources: { [GOLD]: 1, [WOOD]: 1, [STONE]: 1, [IRON]: 1, [WEAPON]: 1, [HERB]: 1 },
        },
      ],
    },
  ],
};
