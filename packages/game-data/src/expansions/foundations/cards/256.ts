import { CHURCH_CARDS } from './churchConstants';
import { markPermanents } from './markPermanents';
import { RESOURCE_STICKERS } from './scienceConstants';
import { scienceGoal } from './scienceGoal';
import { spendScience } from './spendScience';
import { ActionEffectType, CardTag, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardDef } from '@deck-legacy/engine/domain/types';

const { school, experiments, printingPress, theologyOfScience } = CHURCH_CARDS;

const sticker = (ids: number[], tags: CardTag[]): ActionEffect => ({
  id: 1,
  type: ActionEffectType.ADD_STICKER,
  cards: { scope: [TargetScope.ANY, TargetScope.FRIENDLY], tags, pickNumber: 1 },
  stickers: { ids, pickNumber: 1 },
});

const discover = (id: number): ActionEffect => ({
  id: 1,
  type: ActionEffectType.DISCOVER_CARD,
  cards: { ids: [id] },
});

const boost = (id: number): ActionEffect => ({
  id,
  type: ActionEffectType.BOOST_CARD,
  cards: { scope: [TargetScope.ANY], pickNumber: 1 },
});

/** New Paradigm (Foundations 83): a second science track, found by Gregorius. */
export const newParadigm: CardDef = {
  id: 256,
  name: 'New Paradigm',
  states: [
    {
      id: 1,
      name: 'New Paradigm',
      tags: [CardTag.PERMANENT],
      glory: { amount: 0 },
      actions: [
        spendScience('256-1-1'),
        scienceGoal('256-1-2', 10, [sticker([62], [CardTag.PERSON])]),
        scienceGoal('256-1-3', 20, [discover(school)]),
        scienceGoal('256-1-4', 30, [discover(experiments[0])]),
        scienceGoal('256-1-5', 40, [sticker(RESOURCE_STICKERS, [CardTag.PERSON])]),
        scienceGoal('256-1-6', 55, [sticker(RESOURCE_STICKERS, [CardTag.BUILDING])]),
        scienceGoal('256-1-7', 75, [discover(experiments[1])]),
        scienceGoal('256-1-8', 125, [
          // A new tally on the other side
          {
            id: 1,
            type: ActionEffectType.SET_CUMULATED,
            cards: { scope: [TargetScope.SELF] },
            value: 0,
          },
          {
            id: 2,
            type: ActionEffectType.UPGRADE_CARD,
            cards: { scope: [TargetScope.SELF] },
            states: { ids: [2] },
          },
        ]),
      ],
    },
    {
      id: 2,
      name: 'Practical Science',
      tags: [CardTag.PERMANENT],
      glory: { amount: 25 },
      actions: [
        spendScience('256-2-1'),
        scienceGoal('256-2-2', 25, [
          {
            id: 1,
            type: ActionEffectType.ADD_STICKER,
            cards: { scope: [TargetScope.ANY, TargetScope.FRIENDLY], pickNumber: 3 },
            stickers: { ids: [1] },
          },
        ]),
        // shortcut: the 3 boosts may pick the same card; the card says 3 cards
        scienceGoal('256-2-3', 75, [boost(1), boost(2), boost(3)]),
        scienceGoal('256-2-4', 125, markPermanents(1)),
        scienceGoal('256-2-5', 175, markPermanents(2)),
        scienceGoal('256-2-6', 225, [discover(printingPress)]),
        scienceGoal('256-2-7', 300, [discover(theologyOfScience)]),
      ],
    },
  ],
};
