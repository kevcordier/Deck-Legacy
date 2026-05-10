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
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/414d18f8-043c-4afb-ab36-5761975748f5/450x%3Cauto%3E_so_hm',
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
                scope: [TargetScope.BOARD],
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
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/455e17fd-b4d9-4734-b129-012990339b6b/450x%3Cauto%3E_so',
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
                scope: [TargetScope.BOARD],
                pickNumber: 1,
              },
            },
          ],
        },
      ],
    },
  ],
};
