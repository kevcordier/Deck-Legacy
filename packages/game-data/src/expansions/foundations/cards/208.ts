import { flipTo } from './flipTo';
import {
  ActionEffectType,
  CardTag,
  Options,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

/** Thunderstorm / Rain (Foundations 35). */
export const thunderstorm: CardDef = {
  id: 208,
  name: 'Thunderstorm',
  states: [
    {
      id: 1,
      name: 'Thunderstorm',
      tags: [CardTag.EVENT],
      negative: true,
      actions: [
        {
          id: '208-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: { scope: [TargetScope.TOP_OF_DECK], pickNumber: 3 },
            },
            flipTo(2, 2),
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Rain',
      tags: [CardTag.EVENT],
      negative: true,
      passives: [
        {
          ...CardPassives[PassiveType.ADJUST_PRODUCTION],
          id: '208-2-1',
          cards: { scope: [TargetScope.BOARD], tags: [CardTag.LAND] },
          resources: { [ResourceType.GOLD]: 2 },
        },
        {
          ...CardPassives[PassiveType.DESACTIVATE_OPTION],
          id: '208-2-2',
          options: [Options.ADVANCE],
        },
      ],
      actions: [{ id: '208-2-1', trigger: Trigger.END_OF_TURN, actionEffects: [flipTo(1, 1)] }],
    },
  ],
};
