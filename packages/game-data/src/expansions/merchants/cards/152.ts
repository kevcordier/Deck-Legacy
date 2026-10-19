import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type {
  ActionEffect,
  CardAction,
  CardDef,
  CardState,
} from '@deck-legacy/engine/domain/types';

const toState = (stateId: number): ActionEffect => ({
  id: 1,
  type: ActionEffectType.UPGRADE_CARD,
  cards: { scope: [TargetScope.SELF] },
  states: { ids: [stateId] },
});

/** A spice: mark 1 box for its effect; once its 4 boxes are marked, back to Spices for good. */
const spice = (
  stateId: number,
  name: string,
  firstStep: number,
  effect: ActionEffect,
): CardState => ({
  id: stateId,
  name,
  tags: [CardTag.ITEM],
  actions: [
    {
      id: `152-${stateId}-1`,
      actionEffects: [
        { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
      ],
    },
    { id: `152-${stateId}-2`, trigger: Trigger.ON_TRACK_END, actionEffects: [toState(1)] },
  ],
  // Each side keeps its own boxes (step ids), crossed out for the rest of the game.
  track: {
    inOrder: true,
    steps: [0, 1, 2, 3].map(i => ({ id: firstStep + i, effects: [effect] })),
  },
});

const rotate: CardAction = {
  id: '152-1-1',
  cost: { discard: [{ scope: [TargetScope.BOARD], tags: [CardTag.PERSON], pickNumber: 1 }] },
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.UPGRADE_CARD,
      cards: { scope: [TargetScope.SELF] },
      states: { ids: [2, 3, 4] },
    },
  ],
};

export const spices: CardDef = {
  id: 152,
  name: 'Spices',
  states: [
    {
      id: 1,
      name: 'Spices',
      tags: [CardTag.ITEM],
      productions: [{ [ResourceType.GOODS]: 1 }],
      actions: [rotate],
    },
    spice(2, 'Cummin', 1, {
      id: 1,
      type: ActionEffectType.ADD_RESOURCES,
      resources: { [ResourceType.GOLD]: 3 },
    }),
    spice(3, 'Coriander', 5, {
      id: 1,
      type: ActionEffectType.ADD_RESOURCES,
      resources: { cards: { scope: [TargetScope.BOARD], tags: [CardTag.PERSON] } },
    }),
    spice(4, 'Turmeric', 9, {
      id: 1,
      type: ActionEffectType.USE_CARD_ACTION,
      cards: { scope: [TargetScope.BOARD], tags: [CardTag.PERSON] },
    }),
  ],
};
