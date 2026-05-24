import {
  ActionEffectType,
  CardTag,
  Options,
  PassiveType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const thunderstorm: CardDef = {
  id: 35,
  name: 'Thunderstorm',
  states: [
    {
      id: 1,
      name: 'Thunderstorm',
      negative: true,
      tags: [CardTag.EVENT],
      illustration: 'cards/35_1.jpg',
      actions: [
        {
          id: '35-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: {
                scope: [TargetScope.TOP_OF_DECK],
                pickNumber: 3,
              },
            },
            {
              id: 4,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [2] },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Rain',
      negative: true,
      tags: [CardTag.EVENT],
      illustration: 'cards/35_2.jpg',
      passives: [
        {
          ...CardPassives[PassiveType.ADJUST_PRODUCTION],
          id: '35-2-1',
          cards: {
            scope: [TargetScope.BOARD],
            tags: [CardTag.LAND],
          },
          resources: {
            gold: 2,
          },
        },
        {
          ...CardPassives[PassiveType.DESACTIVATE_OPTION],
          id: '35-2-2',
          options: [Options.ADVANCE],
        },
      ],
      actions: [
        {
          id: '35-2-3',
          trigger: Trigger.END_OF_TURN,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [1] },
            },
          ],
        },
      ],
    },
  ],
};
