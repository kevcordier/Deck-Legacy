import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, StepDef } from '@deck-legacy/engine/domain/types';

const minusOneGloryStep = (id: number): StepDef => ({
  id,
  effects: [
    {
      id: 1,
      type: ActionEffectType.ADD_CUMULATED,
      cards: { scope: [TargetScope.SELF] },
      value: 1,
    },
  ],
});

export const taxCollector: CardDef = {
  id: 130,
  name: 'Tax Collector',
  states: [
    {
      id: 1,
      name: 'Tax Collector',
      tags: [CardTag.PERSON],
      illustration: 'cards/130_1.jpg',
      productions: [{ [ResourceType.GOLD]: 4 }],
      glory: { amount: 0, valuePerElement: { amount: -1, accumulation: true } },
      actions: [
        {
          id: '130-1-1',
          trigger: Trigger.ON_PRODUCE,
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
      track: { inOrder: true, steps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(minusOneGloryStep) },
    },
  ],
};
