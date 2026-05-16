import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef, StepDef } from '@engine/domain/types';

function makeStep(id: number): StepDef {
  return {
    id,
    effects: [
      {
        id: 1,
        type: ActionEffectType.ADD_CUMULATED,
        value: 1,
      },
    ],
  };
}

export const ravine: CardDef = {
  id: 111,
  name: 'Ravine',
  states: [
    {
      id: 1,
      name: 'Ravine',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/0b21b870-c44e-435f-b766-22ffd4ed524e/450x%3Cauto%3E_so',
      upgrade: [
        {
          cost: { resources: [{ gold: 2, wood: 2 }] },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Chasm',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/15a05f29-8c4e-4a88-87c2-f72dd98b43dc/450x%3Cauto%3E_so',
      upgrade: [
        {
          cost: { discard: [{ tags: [CardTag.PERSON], pickNumber: 2 }] },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Ancient Ruins',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/338e9817-0f17-4d47-8e9e-c2f7e0f6b3b8/450x%3Cauto%3E_so',
      upgrade: [
        {
          cost: { discard: [{ tags: [CardTag.PERSON], pickNumber: 3 }] },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Excavation Site',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/bbaf597f-6734-453c-90b3-3425e932621e/450x%3Cauto%3E_so',
      productions: [{ gold: 1, goods: 1 }],
      glory: { amount: 0, valuePerElement: { amount: 7, accumulation: true } },
      actions: [
        {
          id: '111-4-1',
          endsTurn: true,
          cost: { discard: [{ tags: [CardTag.PERSON] }], resources: [{ stone: 3 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: { scope: [TargetScope.SELF] },
            },
          ],
        },
      ],
      track: {
        inOrder: true,
        steps: [
          makeStep(1),
          makeStep(2),
          makeStep(3),
          makeStep(4),
          makeStep(5),
          makeStep(6),
          makeStep(7),
        ],
      },
    },
  ],
};
