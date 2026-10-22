import { markPermanents } from './markPermanents';
import { SCIENCE, SCIENCE_CARDS } from './scienceConstants';
import { scienceGoal } from './scienceGoal';
import { spendScience } from './spendScience';
import { stickersOnOneCard } from './stickersOnOneCard';
import { ActionEffectType, CardTag, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardDef } from '@deck-legacy/engine/domain/types';

const scienceSticker = (tags: CardTag[]): ActionEffect => ({
  id: 1,
  type: ActionEffectType.ADD_STICKER,
  cards: { scope: [TargetScope.ANY, TargetScope.FRIENDLY], tags, pickNumber: 1 },
  stickers: { ids: [62] },
});

const discover = (id: number): ActionEffect => ({
  id: 1,
  type: ActionEffectType.DISCOVER_CARD,
  cards: { ids: [id] },
});

/** Science (Foundations 46): spend science, its goals are reached between rounds. */
export const scienceTrack: CardDef = {
  id: 219,
  name: 'Science',
  states: [
    {
      id: 1,
      name: 'Science',
      tags: [CardTag.PERMANENT],
      glory: { amount: 0 },
      actions: [
        spendScience('219-1-1'),
        scienceGoal('219-1-2', 10, [scienceSticker([CardTag.PERSON])]),
        scienceGoal('219-1-3', 20, [scienceSticker([CardTag.BUILDING])]),
        scienceGoal('219-1-4', 30, [scienceSticker([CardTag.BUILDING])]),
        scienceGoal('219-1-5', 40, [discover(SCIENCE_CARDS.experiments)]),
        scienceGoal('219-1-6', 55, [discover(SCIENCE_CARDS.metallurgy)]),
        scienceGoal('219-1-7', 75, [discover(SCIENCE_CARDS.aerostats)]),
        scienceGoal('219-1-8', 100, [
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
      name: 'Science',
      tags: [CardTag.PERMANENT],
      glory: { amount: 25 },
      actions: [
        spendScience('219-2-1'),
        scienceGoal('219-2-2', 25, [discover(SCIENCE_CARDS.stoneRoads)]),
        scienceGoal(
          '219-2-3',
          50,
          stickersOnOneCard(2, { scope: [TargetScope.ANY, TargetScope.FRIENDLY], pickNumber: 1 }),
        ),
        scienceGoal(
          '219-2-4',
          75,
          stickersOnOneCard(3, { scope: [TargetScope.ANY], produces: [SCIENCE], pickNumber: 1 }),
        ),
        scienceGoal('219-2-5', 100, markPermanents(1)),
        scienceGoal('219-2-6', 150, markPermanents(2)),
        scienceGoal('219-2-7', 200, [discover(SCIENCE_CARDS.appliedScience)]),
      ],
    },
  ],
};
