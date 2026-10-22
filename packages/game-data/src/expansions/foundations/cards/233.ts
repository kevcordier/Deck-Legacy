import { hasStepsLeft } from './hasStepsLeft';
import { SCIENCE_CARDS } from './scienceConstants';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Metallurgy (Foundations 60): 4 iron stickers on cards producing stone, iron or science. */
export const metallurgy: CardDef = {
  id: 233,
  name: 'Metallurgy',
  states: [
    {
      id: 1,
      name: 'Metallurgy',
      tags: [CardTag.INVENTION],
      track: { inOrder: true, steps: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] },
      actions: [
        {
          id: '233-1-1',
          condition: hasStepsLeft(SCIENCE_CARDS.metallurgy),
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
            {
              id: 2,
              type: ActionEffectType.ADD_STICKER,
              cards: {
                scope: [TargetScope.ANY],
                produces: [ResourceType.STONE, ResourceType.IRON, ResourceType.SCIENCE],
                pickNumber: 1,
              },
              stickers: { ids: [4] },
            },
          ],
        },
      ],
    },
  ],
};
