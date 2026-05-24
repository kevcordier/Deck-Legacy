import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const royalVisit: CardDef = {
  id: 60,
  name: 'Royal Visit',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Royal Visit',
      tags: [CardTag.EVENT],
      illustration: 'cards/60_1.jpg',
      glory: { amount: 2 },
      actions: [
        {
          id: '60-1-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
              cards: {
                scope: [TargetScope.BOARD],
              },
              resources: {
                choice: [
                  { gold: 1 },
                  { wood: 1 },
                  { stone: 1 },
                  { iron: 1 },
                  { weapon: 1 },
                  { goods: 1 },
                ],
              },
              resourceScopes: ['upgradeCost'],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Inquisitor',
      tags: [CardTag.PERSON],
      illustration: 'cards/60_2.jpg',
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
