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

const landsInPlay = { scope: [TargetScope.BOARD], tags: [CardTag.LAND] };

/** Drought / Mudslides (Foundations 41). */
export const drought: CardDef = {
  id: 214,
  name: 'Drought',
  states: [
    {
      id: 1,
      name: 'Drought',
      tags: [CardTag.EVENT],
      negative: true,
      actions: [
        {
          id: '214-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              // At least 2 productions crossed out: 2 lands in play produce something
              ...flipTo(1, 2),
              condition: {
                type: 'cardCount',
                cards: { ...landsInPlay, produces: Object.values(ResourceType) },
                min: 2,
              },
            },
            crossOutProduction(2, { ...landsInPlay, each: true }),
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Mudslides',
      tags: [CardTag.EVENT],
      negative: true,
      actions: [
        {
          id: '214-2-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              ...destroySelf(1),
              condition: { type: 'cardCount', cards: landsInPlay, min: 3 },
            },
            {
              id: 2,
              type: ActionEffectType.DISCARD_CARD,
              cards: { ...landsInPlay, autoPick: true },
            },
          ],
        },
      ],
    },
  ],
};
