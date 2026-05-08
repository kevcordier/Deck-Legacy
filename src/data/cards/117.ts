import { ActionEffectType, CardTag, PassiveType, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef, Cost, StepDef } from '@engine/domain/types';

function makeStep(id: number, cost: Cost): StepDef {
  return {
    id,
    cost,
    effects: [
      {
        id: 1,
        type: ActionEffectType.ADD_CUMULATED,
        value: 1,
      },
    ],
  };
}

export const handsomeRival: CardDef = {
  id: 117,
  name: 'Handsome Rival',
  states: [
    {
      id: 1,
      name: 'Handsome Rival',
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/ac7bd0bd-ded9-475b-9e18-7522ff4920d5/450x%3Cauto%3E_so',
      tags: [CardTag.PERSON],
      glory: { amount: 20, valuePerElement: { accumulation: true, amount: -5 } },
      passives: [
        {
          id: 'cant_be_destroyed',
          type: PassiveType.CANT_BE_DESTROYED,
          condition: {
            type: 'cardCount',
            cards: { scope: [TargetScope.ANY], name: 'Lord Nimrod' },
            min: 1,
          },
        },
      ],
      actions: [
        {
          id: '117-1-1',
          cost: {
            discard: [{ name: 'Lord Nimrod' }],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: { scope: [TargetScope.SELF] },
            },
          ],
        },
        {
          id: '117-1-2',
          trigger: Trigger.ON_TRACK_END,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [2] },
            },
          ],
        },
      ],
      track: {
        inOrder: false,
        steps: [
          makeStep(1, { resources: [{ gold: 5 }] }),
          makeStep(2, { resources: [{ weapon: 2 }] }),
          makeStep(3, { resources: [{ weapon: 3 }] }),
          makeStep(4, { resources: [{ goods: 3 }] }),
        ],
      },
    },
    {
      id: 2,
      name: 'Noble Ally',
      tags: [CardTag.PERSON],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/ac7bd0bd-ded9-475b-9e18-7522ff4920d5/450x%3Cauto%3E_so',
      glory: { amount: 6 },
      actions: [
        {
          id: '117-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              cards: { scope: [TargetScope.BOARD], tags: [CardTag.PERSON] },
            },
          ],
        },
      ],
    },
  ],
};
