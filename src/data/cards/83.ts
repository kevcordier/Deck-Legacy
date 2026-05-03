import { ActionEffectType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

const makeGoldStep = (id: number) => ({
  id,
  effects: [{ id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { [ResourceType.GOLD]: 1 } }],
});

const makeGoodsStep = (id: number) => ({
  id,
  effects: [
    { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { [ResourceType.GOODS]: 1 } },
  ],
});

const makeGoldUpgradeStep = (id: number, upgradeTo: number) => ({
  id,
  effects: [
    { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { [ResourceType.GOLD]: 1 } },
    {
      id: 2,
      type: ActionEffectType.UPGRADE_CARD,
      cards: { scope: [TargetScope.SELF] },
      states: [upgradeTo],
    },
  ],
});

const makeGoodsUpgradeStep = (id: number, upgradeTo: number) => ({
  id,
  effects: [
    { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { [ResourceType.GOODS]: 1 } },
    {
      id: 2,
      type: ActionEffectType.UPGRADE_CARD,
      cards: { scope: [TargetScope.SELF] },
      states: [upgradeTo],
    },
  ],
});

const makeUpgradeStep = (id: number, upgradeTo: number) => ({
  id,
  effects: [
    {
      id: 1,
      type: ActionEffectType.UPGRADE_CARD,
      cards: { scope: [TargetScope.SELF] },
      states: [upgradeTo],
    },
  ],
});

const makeDiscardToDeckStep = (id: number) => ({
  id,
  effects: [
    {
      id: 1,
      type: ActionEffectType.SHUFFLE_DECK,
      deck: 'discard' as const,
    },
    {
      id: 1,
      type: ActionEffectType.PLACE_CARD_IN_DRAW_PILE,
      cards: {
        scope: [TargetScope.TOP_OF_DISCARD],
        pickNumber: 15,
      },
      position: 'bottom' as const,
    },
  ],
});

const makeSeafaringTrackAdvance = (actionId: string) => ({
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
