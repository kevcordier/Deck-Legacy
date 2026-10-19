import { ActionEffectType, CardTag, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardDef, StepDef } from '@deck-legacy/engine/domain/types';

const makeStep = (id: number): StepDef => ({
  id,
  effects: [
    {
      id: 1,
      type: ActionEffectType.ADD_STICKER,
      stickers: { ids: [1] },
      cards: { scope: [TargetScope.BOARD], tags: [CardTag.LAND] },
    },
  ],
});

export const grain: CardDef = {
  id: 155,
  name: 'Grain',
  states: [
    {
      id: 1,
      name: 'Grain',
      tags: [CardTag.ITEM],
      actions: [
        {
          id: '155-1-1',
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
      track: { inOrder: true, steps: [makeStep(1), makeStep(2), makeStep(3)] },
    },
  ],
};
