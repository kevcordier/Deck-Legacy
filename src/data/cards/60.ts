import { ActionEffectType, CardTag, PassiveType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const royalVisit: CardDef = {
  id: 60,
  name: 'Royal Visit',
  chooseState: true,
  states: [
    {
      id: 1,
      name: 'Royal Visit',
      tags: [CardTag.EVENT],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/292e1ca1-f3d6-4f2e-bdbd-fa3fa9935516/anim=false,width=450,optimized=true/00001-2621158977.jpeg',
      glory: { amount: 2 },
      actions: [
        {
          id: '60-1-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_BOARD_EFFECT,
              cards: {
                scope: [TargetScope.BOARD],
              },
              effect: {
                id: 'Royal Visit',
                type: PassiveType.ADJUST_UPDATE_COST,
              },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Inquisitor',
      tags: [CardTag.EVENT],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/f846b7a7-a6c7-4a7a-b96c-327ef05a5a12/anim=false,width=450,optimized=true/00076-1419421906.jpeg',
      productions: [{ gold: 1 }],
      actions: [
        {
          id: '60-2-1',
          cost: {
            destroy: { scope: [TargetScope.SELF] },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                scope: [TargetScope.ENEMY, TargetScope.BOARD],
              },
            },
          ],
        },
      ],
    },
  ],
};
