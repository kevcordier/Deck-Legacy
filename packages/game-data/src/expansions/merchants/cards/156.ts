import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardDef, StepDef } from '@deck-legacy/engine/domain/types';

const markBox = (id: string, cost?: { resources: { goods: number }[] }) => ({
  id,
  ...(cost ? { endsTurn: true, cost } : {}),
  actionEffects: [
    { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
  ],
});

const goodsSticker = (cards: ActionEffect['cards'], id = 1): ActionEffect => ({
  id,
  type: ActionEffectType.ADD_STICKER,
  stickers: { ids: [6] },
  cards,
});

// Grapes: the goods sticker replaces another production of the land (crossed out).
const grapesStep = (id: number): StepDef => ({
  id,
  effects: [
    {
      id: 1,
      type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
      resourceScopes: ['production'],
      resources: {
        choice: [
          { [ResourceType.GOLD]: 1 },
          { [ResourceType.WOOD]: 1 },
          { [ResourceType.STONE]: 1 },
          { [ResourceType.IRON]: 1 },
          { [ResourceType.WEAPON]: 1 },
        ],
      },
      cards: { scope: [TargetScope.BOARD], tags: [CardTag.LAND], pickNumber: 1 },
    },
    goodsSticker({ scope: [TargetScope.LAST_SELECTED] }, 2),
  ],
});

const wineStep = (id: number): StepDef => ({
  id,
  effects: [goodsSticker({ scope: [TargetScope.SELF] })],
});

export const grapes: CardDef = {
  id: 156,
  name: 'Grapes',
  states: [
    {
      id: 1,
      name: 'Grapes',
      tags: [CardTag.ITEM],
      productions: [{ [ResourceType.GOODS]: 1 }],
      actions: [markBox('156-1-1')],
      track: { inOrder: true, steps: [grapesStep(1), grapesStep(2), grapesStep(3)] },
      upgrade: [{ cost: { resources: [{ [ResourceType.GOODS]: 3 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Wine',
      tags: [CardTag.ITEM],
      productions: [{ [ResourceType.GOODS]: 1 }],
      actions: [markBox('156-2-1', { resources: [{ goods: 2 }] })],
      track: { inOrder: true, steps: [wineStep(4), wineStep(5), wineStep(6)] },
    },
  ],
};
