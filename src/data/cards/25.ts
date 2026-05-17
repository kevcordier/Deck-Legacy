import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const engineer: CardDef = {
  id: 25,
  name: 'Engineer',
  states: [
    {
      id: 1,
      name: 'Engineer',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/d1e13140-c150-41fa-91e1-b67ad84a742e/anim=false,width=450,optimized=true/00459-honey2D_v30_3241350609_scaled.jpeg',
      actions: [
        {
          id: '25-1-1',
          limitedTime: 1,
          cost: {
            destroy: {
              scope: [TargetScope.BOARD],
              name: 'Lumberjack',
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [100],
              },
            },
          ],
        },
        {
          id: '25-1-2',
          limitedTime: 1,
          cost: {
            destroy: {
              scope: [TargetScope.BOARD],
              name: 'Food Barns',
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [101],
              },
            },
          ],
        },
        {
          id: '25-1-3',
          limitedTime: 1,
          cost: {
            destroy: {
              scope: [TargetScope.BOARD],
              name: 'Fishing Boat',
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [102],
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
                wood: 2,
                iron: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Trebuchet',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/f2db8879-ac24-4c7d-9d09-eb2927f806fa/anim=false,width=450,optimized=true/00007-2893402591.jpeg',
      productions: [
        {
          weapon: 1,
        },
      ],
      actions: [
        {
          id: '25-2-1',
          cost: {
            destroy: {
              scope: [TargetScope.SELF],
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                scope: [
                  TargetScope.ENEMY,
                  TargetScope.BOARD,
                  TargetScope.DISCARD,
                  TargetScope.PERMANENTS,
                ],
              },
            },
            {
              id: 2,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: {
                ids: [25],
              },
            },
          ],
        },
      ],
    },
  ],
};
