import { crossOutProduction } from './crossOutProduction';
import { destroySelf } from './destroySelf';
import { flipTo } from './flipTo';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Bear Cub / Mama Bear (Foundations 40). */
export const bearCub: CardDef = {
  id: 213,
  name: 'Bear Cub',
  states: [
    {
      id: 1,
      name: 'Bear Cub',
      tags: [CardTag.ANIMAL],
      glory: { amount: 0, whenPurged: -5 },
      actions: [
        {
          id: '213-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: { scope: [TargetScope.BOARD, TargetScope.FRIENDLY], pickNumber: 2 },
            },
          ],
        },
        {
          id: '213-1-2',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: { [ResourceType.GOLD]: 3, [ResourceType.GOODS]: 3 },
            },
            flipTo(2, 2),
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Mama Bear',
      tags: [CardTag.ENEMY],
      negative: true,
      glory: { amount: -6 },
      actions: [
        {
          id: '213-2-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [crossOutProduction(1, { scope: [TargetScope.BOARD] })],
        },
        {
          id: '213-2-2',
          defeat: true,
          cost: { resources: [{ [ResourceType.WEAPON]: 5 }] },
          actionEffects: [
            destroySelf(1),
            {
              id: 2,
              type: ActionEffectType.ADD_RESOURCES,
              resources: { [ResourceType.GOLD]: 5, [ResourceType.GOODS]: 5 },
            },
          ],
        },
      ],
    },
  ],
};
