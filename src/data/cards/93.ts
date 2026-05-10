import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const smallGuild: CardDef = {
  id: 93,
  name: 'Small Guild',
  states: [
    {
      id: 1,
      name: 'Small Guild',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/6b549f75-fb43-45ef-9ff3-a64835d8efce/450x%3Cauto%3E_so',
      productions: [{ gold: 1 }],
      upgrade: [
        {
          cost: {
            resources: [{ wood: 2 }],
            discard: [{ scope: [TargetScope.BOARD], tags: [CardTag.PERSON] }],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Guild',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/7231155a-ac0f-40ed-9a4a-b514c61394eb/450x%3Cauto%3E_so',
      productions: [{ gold: 1 }, { wood: 1 }],
      glory: { amount: 2 },
      upgrade: [
        {
          cost: {
            resources: [{ stone: 2 }],
            discard: [{ scope: [TargetScope.BOARD], tags: [CardTag.PERSON], pickNumber: 2 }],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Guild Hall',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/7e764bba-0e2a-435a-a87e-0e042806e819/450x%3Cauto%3E_so',
      productions: [{ gold: 1 }, { wood: 1 }, { stone: 1 }],
      glory: { amount: 3 },
      upgrade: [
        {
          cost: {
            resources: [{ stone: 4 }],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Grand Guild Hall',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/f8a0478f-76af-4d77-afdc-38e06821eae0/450x%3Cauto%3E_so',
      productions: [{ gold: 1, wood: 1, stone: 1 }],
      glory: { amount: 0, emptyValues: 3 },
      actions: [
        {
          id: '93-4-1',
          cost: { discard: [{ scope: [TargetScope.BOARD], tags: [CardTag.PERSON], pickMin: 1 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_GLORY,
              cards: { scope: [TargetScope.SELF] },
              valuePerElement: {
                amount: 1,
                cards: { scope: [TargetScope.DISCARDED] },
              },
            },
          ],
        },
      ],
    },
  ],
};
