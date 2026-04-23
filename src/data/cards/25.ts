import { ActionType, CardTag, TargetScope } from '@engine/domain/enums';
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
          cost: {
            destroy: {
              scope: [TargetScope.BOARD],
              name: 'Lumberjack',
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionType.DISCOVER_CARD,
              cards: {
                ids: [100],
              },
            },
          ],
        },
        {
          id: '25-1-2',
          cost: {
            destroy: {
              scope: [TargetScope.BOARD],
              name: 'Food Barns',
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionType.DISCOVER_CARD,
              cards: {
                ids: [101],
              },
            },
          ],
        },
        {
          id: '25-1-3',
          cost: {
            destroy: {
              scope: [TargetScope.BOARD],
              name: 'Fishing Boats',
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionType.DISCOVER_CARD,
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
      illustration: 'https://www.the-trench.org/wp-content/uploads/2022/04/Trebuchet-horse-2.png',
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
              type: ActionType.DESTROY_CARD,
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
              type: ActionType.TRACK_ADVANCE,
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
