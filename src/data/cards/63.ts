import { ActionEffectType, CardTag, PassiveType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const pirate: CardDef = {
  id: 63,
  name: 'Pirate',
  states: [
    {
      id: 1,
      name: 'Pirate',
      tags: [CardTag.ENEMY],
      negative: true,
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/f5407050-6e4c-4723-f561-91ffb1b29900/450x%3Cauto%3E_so',
      glory: { amount: -2 },
      passives: [
        CardPassives[PassiveType.STAY_IN_PLAY],
        {
          id: 'decrease_gold',
          type: PassiveType.ADJUST_PRODUCTION,
          resources: {
            gold: -1,
          },
        },
        {
          id: 'steal_gold',
          type: PassiveType.ADJUST_ADD_RESOURCES,
          resources: {
            gold: -1,
          },
        },
      ],
      actions: [
        {
          id: '63-1-1',
          cost: {
            resources: [
              {
                weapon: 2,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
            },
            {
              id: 2,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [77],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                gold: 4,
                iron: 1,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Skilled Ally',
      tags: [CardTag.PERSON, CardTag.SEAFARING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/064e7f8a-d137-4f38-bb2e-8d2b860d8639/anim=false,width=450,optimized=true/00046-1058393588.jpeg',
      glory: { amount: 3 },
      productions: [
        {
          weapon: 1,
        },
        {
          iron: 1,
        },
      ],
      actions: [
        {
          id: '63-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [93],
              },
            },
          ],
        },
      ],
    },
  ],
};
