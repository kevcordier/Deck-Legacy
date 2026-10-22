import { equipAction } from './equipAction';
import { gainAny } from './gainAny';
import { CardTag, PassiveType, ResourceType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const ETHER_PEARL = 313;

/** Necklace (Foundations 122): becomes the Ether Pearl, a person's equipment. */
export const necklace: CardDef = {
  id: 295,
  name: 'Necklace',
  states: [
    {
      id: 1,
      name: 'Necklace',
      tags: [CardTag.ITEM],
      glory: { amount: 3 },
      upgrade: [
        {
          // A destroy cost ignores "cannot be destroyed", as the card says
          cost: {
            resources: [{ [ResourceType.IRON]: 3 }],
            destroy: { tags: [CardTag.ARTIFACT], pickNumber: 1 },
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Ether Pearl',
      tags: [CardTag.ARTIFACT, CardTag.ITEM],
      equip: CardTag.PERSON,
      glory: { amount: 25 },
      passives: [
        { id: '295-2-1', type: PassiveType.CANT_BE_DESTROYED },
        {
          // When using a ✓ or ⌛ effect on the holder, first gain any 2 resources
          id: '295-2-2',
          type: PassiveType.GAIN_BEFORE_HOLDER_ACTION,
          cards: { scope: [TargetScope.HOLDER] },
          actionEffects: [gainAny(1, 2)],
        },
      ],
      actions: [equipAction('295-2-1', CardTag.PERSON, ETHER_PEARL)],
    },
  ],
};
