import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, StepDef } from '@deck-legacy/engine/domain/types';

const markStep = (id: number): StepDef => ({
  id,
  effects: [
    { id: 1, type: ActionEffectType.ADD_CUMULATED, cards: { scope: [TargetScope.SELF] }, value: 1 },
  ],
});

export const bardOfThePeople: CardDef = {
  id: 141,
  name: 'Bard of the People',
  states: [
    {
      id: 1,
      name: 'Bard of the People',
      tags: [CardTag.ENEMY, CardTag.PERSON],
      negative: true,
      illustration: 'cards/141_1.jpg',
      actions: [
        {
          id: '141-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { scope: [TargetScope.DISCARD], tags: [CardTag.ENEMY], pickNumber: 1 },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.IRON]: 2, [ResourceType.WEAPON]: 2 }] },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Obedient Bard',
      tags: [CardTag.PERSON],
      illustration: 'cards/141_2.jpg',
      glory: { amount: 0, valuePerElement: { amount: 2, accumulation: true } },
      actions: [
        {
          id: '141-2-1',
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
            {
              id: 2,
              type: ActionEffectType.PLAY_CARD,
              cards: { scope: [TargetScope.DISCARD], tags: [CardTag.EVENT], pickNumber: 1 },
            },
          ],
        },
      ],
      track: { inOrder: true, steps: [1, 2, 3, 4, 5, 6].map(markStep) },
    },
  ],
};
