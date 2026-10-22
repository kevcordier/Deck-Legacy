import { flipTo } from './flipTo';
import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

/** City Fire (Foundations 37): burns a building, then Ashlands and Mushroom Plains. */
export const cityFire: CardDef = {
  id: 210,
  name: 'City Fire',
  states: [
    {
      id: 1,
      name: 'City Fire',
      tags: [CardTag.EVENT],
      negative: true,
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '210-1-1',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: { scope: [TargetScope.ANY], tags: [CardTag.BUILDING], pickNumber: 1 },
            },
            flipTo(2, 2),
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Ashlands',
      tags: [CardTag.LAND],
      glory: { amount: -2 },
      upgrade: [{ cost: { resources: [{ [ResourceType.GOLD]: 6 }] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Mushroom Plains',
      tags: [CardTag.LAND],
      productions: [{ [ResourceType.GOLD]: 2 }, { [ResourceType.GOODS]: 2 }],
    },
  ],
};
