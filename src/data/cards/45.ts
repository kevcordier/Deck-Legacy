import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const scribe: CardDef = {
  id: 45,
  name: 'Scribe',
  states: [
    {
      id: 1,
      name: 'Scribe',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/21b496ce-859c-4690-a638-eba0aaf0691c/anim=false,width=450,optimized=true/13653-2490342710-score_9,%20score_8_up,%20score_7_up,%20masterpiece,%20Dark%20fantasy,%20highly%20detailed,%20Painting,%20realistic,%20Moody,%20soft%20glow,%20intricate%20li.jpeg',
      actions: [
        {
          id: '45-1-1',
          trigger: Trigger.END_OF_TURN,
          optional: true,
          cost: {
            discard: [
              {
                scope: [TargetScope.SELF],
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_BOARD_EFFECT,
              cards: {
                scope: [TargetScope.BOARD],
              },
              effect: CardPassives[PassiveType.STAY_IN_PLAY],
              pickMin: 0,
              pickMax: 2,
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 5,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Architect',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/d4319180-8403-4c99-934b-5cb16a6cbaf9/anim=false,width=450,optimized=true/scribe%204%20kawaii.jpeg',

      productions: [{ [ResourceType.STONE]: 1 }],
      actions: [
        {
          id: '45-2-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [78, 79],
              },
            },
            {
              id: 2,
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
