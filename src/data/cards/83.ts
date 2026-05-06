import { ActionEffectType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardAction, CardDef, StepDef } from '@engine/domain/types';

const makeGoldStep = (id: number): StepDef => ({
  id,
  effects: [{ id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { [ResourceType.GOLD]: 1 } }],
});

const makeGoodsStep = (id: number): StepDef => ({
  id,
  effects: [
    { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { [ResourceType.GOODS]: 1 } },
  ],
});

const makeGoldUpgradeStep = (id: number, upgradeTo: number): StepDef => ({
  id,
  effects: [
    { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { [ResourceType.GOLD]: 1 } },
    {
      id: 2,
      type: ActionEffectType.UPGRADE_CARD,
      cards: { scope: [TargetScope.SELF] },
      states: { ids: [upgradeTo] },
    },
  ],
});

const makeGoodsUpgradeStep = (id: number, upgradeTo: number): StepDef => ({
  id,
  effects: [
    { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { [ResourceType.GOODS]: 1 } },
    {
      id: 2,
      type: ActionEffectType.UPGRADE_CARD,
      cards: { scope: [TargetScope.SELF] },
      states: { ids: [upgradeTo] },
    },
  ],
});

const makeUpgradeStep = (id: number, upgradeTo: number): StepDef => ({
  id,
  effects: [
    {
      id: 1,
      type: ActionEffectType.UPGRADE_CARD,
      cards: { scope: [TargetScope.SELF] },
      states: { ids: [upgradeTo] },
    },
  ],
});

const makeDiscardToDeckStep = (id: number): StepDef => ({
  id,
  effects: [
    {
      id: 1,
      type: ActionEffectType.SHUFFLE_DECK,
      deck: 'discard' as const,
    },
    {
      id: 1,
      type: ActionEffectType.PLACE_CARD_IN_PILE,
      cards: {
        scope: [TargetScope.TOP_OF_DISCARD],
        pickNumber: 15,
      },
      deck: 'draw' as const,
      position: 'bottom' as const,
    },
  ],
});

const makeSeafaringTrackAdvance = (actionId: string): CardAction => ({
  id: actionId,
  endsTurn: true,
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.TRACK_ADVANCE,
      cards: { scope: [TargetScope.SELF] },
      valuePerElement: {
        amount: 1,
        cards: { scope: [TargetScope.BOARD], tags: [CardTag.SEAFARING] },
      },
    },
  ],
});

export const compass: CardDef = {
  id: 83,
  name: 'Compass',
  states: [
    {
      id: 1,
      name: 'Compass',
      tags: [CardTag.SEAFARING],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/23da17e2-311e-44d5-872d-33cc49975f18/450x%3Cauto%3E_so',
      glory: { amount: 2 },
      actions: [makeSeafaringTrackAdvance('83-1-1')],
      track: {
        inOrder: true,
        steps: [
          { id: 1 },
          { id: 2 },
          { id: 3 },
          { id: 4 },
          makeGoldStep(5),
          makeGoldStep(6),
          makeGoldStep(7),
          makeGoldUpgradeStep(8, 2),
        ],
      },
    },
    {
      id: 2,
      name: 'Navigation',
      tags: [CardTag.SEAFARING],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/fb3b1461-799e-4316-b862-52d4157dd8ce/450x%3Cauto%3E_so',
      glory: { amount: 8 },
      actions: [makeSeafaringTrackAdvance('83-2-1')],
      track: {
        inOrder: true,
        steps: [
          makeGoldStep(9),
          makeGoldStep(10),
          makeGoldStep(11),
          makeGoldStep(12),
          makeGoodsStep(13),
          makeGoodsStep(14),
          makeGoodsStep(15),
          makeGoodsUpgradeStep(16, 3),
        ],
      },
    },
    {
      id: 3,
      name: 'Astrolabe',
      tags: [CardTag.SEAFARING],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/04ca154b-2ac4-4e5b-a95d-48b443328f12/450x%3Cauto%3E_so',
      glory: { amount: 15 },
      actions: [makeSeafaringTrackAdvance('83-3-1')],
      track: {
        inOrder: true,
        steps: [
          { id: 17 },
          { id: 18 },
          { id: 19 },
          { id: 20 },
          { id: 21 },
          { id: 22 },
          { id: 23 },
          makeUpgradeStep(24, 4),
        ],
      },
    },
    {
      id: 4,
      name: 'Calendar',
      tags: [CardTag.INVENTION],
      illustration:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Calendar_%28part_of_a_set%29_MET_DP-13486-011.jpg/1920px-Calendar_%28part_of_a_set%29_MET_DP-13486-011.jpg',
      glory: { amount: 15 },
      actions: [
        {
          id: '83-4-1',
          endsTurn: true,
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
          makeDiscardToDeckStep(25),
          makeDiscardToDeckStep(26),
          makeDiscardToDeckStep(27),
          makeDiscardToDeckStep(28),
        ],
      },
      upgrade: [
        {
          cost: {},
          upgradeTo: 3,
        },
      ],
    },
  ],
};
