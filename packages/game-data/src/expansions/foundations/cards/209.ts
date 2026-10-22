import { flipTo } from './flipTo';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Volcanic Eruption (Foundations 36): the next land played is destroyed, then Ashlands. */
export const volcanicEruption: CardDef = {
  id: 209,
  name: 'Volcanic Eruption',
  states: [
    {
      id: 1,
      name: 'Volcanic Eruption',
      tags: [CardTag.EVENT],
      negative: true,
      actions: [
        {
          id: '209-1-1',
          trigger: Trigger.ON_PLAY,
          triggeredBy: { scope: [TargetScope.DRAWN], tags: [CardTag.LAND] },
          condition: { type: 'not', condition: { type: 'justPlayed' } },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: { scope: [TargetScope.DRAWN], tags: [CardTag.LAND], pickNumber: 1 },
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
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.WOOD]: 4, [ResourceType.GOLD]: 2 }] },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Gray Mines of _____',
      chooseName: true,
      tags: [CardTag.LAND],
      glory: { amount: 0, whenPurged: -5 },
      actions: [
        {
          id: '209-3-1',
          cost: { discard: [{ tags: [CardTag.PERSON], pickNumber: 1 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  { [ResourceType.IRON]: 2 },
                  { [ResourceType.WEAPON]: 2 },
                  { [ResourceType.GOODS]: 2 },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
