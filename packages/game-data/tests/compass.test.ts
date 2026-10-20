import { loadGameCatalog } from '../src';
import { GameAggregate } from '@deck-legacy/engine/domain/aggregates/GameAggregate';
import { getStateActions } from '@deck-legacy/engine/domain/cards/selection/getStateActions';
import { Phase } from '@deck-legacy/engine/domain/enums';
import { createInstance } from '@deck-legacy/engine/domain/factory';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/state/emptyState';
import type { GameState } from '@deck-legacy/engine/domain/types';
import { describe, expect, it } from 'vitest';

const catalog = loadGameCatalog();
// Instance ids of the base deck (deck.json): Compass and another seafaring card (card 78)
const COMPASS = 98;
const SHIP = 93;

function playCompass(board: number[], trackProgress: number[] = []) {
  const compass = { ...createInstance(COMPASS, 83, 1, catalog.cards), trackProgress };
  const agg = new GameAggregate(
    'game',
    {
      ...(JSON.parse(JSON.stringify(EMPTY_STATE)) as GameState),
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
      board,
      drawPile: [],
      instances: {
        [COMPASS]: compass,
        [SHIP]: createInstance(SHIP, 78, 1, catalog.cards),
      },
    },
    catalog.cards,
    catalog.stickers,
  );
  const [action] = getStateActions(
    agg.getGameState().instances[COMPASS],
    catalog.cards,
    catalog.stickers,
  );
  agg.cardAction(action, COMPASS);
  return agg;
}

/** The player picks the boxes to mark: the Compass track is marked in any order. */
function markSteps(agg: GameAggregate, stepIds: number[]) {
  const [choice] = agg.getCurrentCardAction()?.getPendingChoices() ?? [];
  expect(choice?.pickMax).toBe(stepIds.length);
  agg.resolveCardActionChoice(
    { id: choice.id, type: choice.kind, sourceInstanceId: choice.sourceInstanceId, stepIds },
    choice.type,
  );
  return agg;
}

describe('Compass', () => {
  it('marks 1 step for each seafaring card in play, including itself', () => {
    const alone = markSteps(playCompass([COMPASS]), [1]);
    expect(alone.getGameState().instances[COMPASS].trackProgress).toEqual([1]);
    const withShip = markSteps(playCompass([COMPASS, SHIP]), [1, 2]);
    expect(withShip.getGameState().instances[COMPASS].trackProgress).toEqual([1, 2]);
  });

  it('upgrades once its track is complete, without ending the turn', () => {
    const agg = markSteps(playCompass([COMPASS], [1, 2, 3, 4, 5, 6, 7]), [8]);
    const [[triggerId, entry]] = Object.entries(agg.getGameState().triggerPile);
    expect(entry.effectDef.id).toBe('83-1-2');

    agg.cardAction(entry.effectDef, COMPASS, triggerId);

    const state = agg.getGameState();
    expect(state.instances[COMPASS].stateId).toBe(2);
    expect(state.triggerPile).toEqual({});
    expect(state.phase).toBe(Phase.PLAYING);
  });
});
