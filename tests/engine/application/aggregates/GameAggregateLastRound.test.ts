import { makeDef, makeInstance, makeState } from '../fixtures';
import { GameAggregate } from '@engine/application/aggregates/GameAggregate';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it } from 'vitest';

describe('GameAggregate last round flow', () => {
  it('does not auto-start next round when isLastRound is true', () => {
    const def = makeDef({ id: 1, states: [{ id: 1, name: 'S' }] });
    const instance = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = makeState({
      phase: Phase.PLAYING,
      round: 1,
      board: [1],
      instances: { 1: instance },
      isLastRound: true,
    });

    const agg = new GameAggregate(crypto.randomUUID(), state, { 1: def }, {}, []);
    const result = agg.roundEnded();

    expect(result.phase).toBe(Phase.ROUND_END);
    expect(result.round).toBe(1);
  });

  it('endGame transitions phase to GAME_OVER', () => {
    const agg = new GameAggregate(
      crypto.randomUUID(),
      makeState({ phase: Phase.ROUND_END, isLastRound: true }),
      { 1: makeDef({ id: 1 }) },
      {},
      [],
    );

    const result = agg.endGame();

    expect(result.phase).toBe(Phase.GAME_OVER);
  });

  it('marks round as last when expansion remaining rounds reaches 1', () => {
    const def = makeDef({ id: 1, states: [{ id: 1, name: 'S' }] });
    const instance = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = makeState({
      phase: Phase.ROUND_END,
      round: 1,
      drawPile: [1],
      instances: { 1: instance },
      expansionMaxRound: 2,
      isLastRound: false,
    });

    const agg = new GameAggregate(crypto.randomUUID(), state, { 1: def }, {}, []);
    const result = agg.roundStarted();

    expect(result.isLastRound).toBe(true);
    expect(result.phase).toBe(Phase.ROUND_START);
  });
});
