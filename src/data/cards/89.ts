import { ActionEffectType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const priest: CardDef = {
  id: 89,
  name: 'Priest',
  states: [
    {
      id: 1,
      name: 'Priest',
      tags: [CardTag.PERSON],
      illustration: 'cards/89_1.jpg',
      actions: [
        {
          id: '89-1-1',
          cost: { resources: [{ gold: 2 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              payingCost: true,
              cards: {
                scope: [TargetScope.BOARD, TargetScope.UPGRADABLE],
                pickNumber: 1,
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
                [ResourceType.GOLD]: 6,
                [ResourceType.GOODS]: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Cardinal',
      tags: [CardTag.PERSON],
      illustration: 'cards/89_2.jpg',
      glory: { amount: 5 },
      actions: [
        {
          id: '89-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              payingCost: true,
              cards: {
                scope: [TargetScope.BOARD, TargetScope.UPGRADABLE],
                pickNumber: 1,
              },
            },
          ],
        },
      ],
    },
  ],
};
