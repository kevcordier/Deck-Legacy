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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/ba519c84-b1d1-4b49-8d58-23f053a0dea5/anim=false,width=450,optimized=true/2260031F3D278EFDAD6D5BF7D74CF4523228DD96C276BF7B0DFAE6268C3611FA.jpeg',
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
              },
            },
            {
              id: 2,
              type: ActionEffectType.DISCARD_CARD,
              cards: {
                scope: [TargetScope.TOP_OF_DECK],
              },
            },
            {
              id: 3,
              type: ActionEffectType.DISCARD_CARD,
              cards: {
                scope: [TargetScope.TOP_OF_DECK],
              },
            },
            {
              id: 4,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: [2],
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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/71abe2bf-814f-4e24-9928-460126c484cb/anim=false,width=450,optimized=true/00377-1961154424.jpeg',
      passives: [
        {
          ...CardPassives[PassiveType.INCREASE_PRODUCTION],
          cards: {
            scope: [TargetScope.BOARD],
            tags: [CardTag.LAND],
          },
          resources: {
            gold: 2,
          },
        },
        { ...CardPassives[PassiveType.DESACTIVATE_OPTION], options: [Options.ADVANCE] },
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
              states: [1],
            },
          ],
        },
      ],
    },
  ],
};
