import { makeInstance, makeState } from '../fixtures';
import { RoundEndedStrategy } from '@engine/application/gameEvent/RoundEndedStrategy';
import { Phase } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('RoundEndedStrategy', () => {
  const strategy = new RoundEndedStrategy();

  it('sets phase to PREROUND', () => {
    const gs = makeState();
    const event = { id: 'e1', timestamp: 0, endRoundTriggers: {}, type: 'ROUND_ENDED' };
    const result = strategy.apply(gs, event);
    expect(result.phase).toBe(Phase.ROUND_END);
  });

  it('moves board cards to discardPile', () => {
    const inst = makeInstance({ id: 10, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [10], instances: { 10: inst } });
    const event = { id: 'e2', timestamp: 0, endRoundTriggers: {}, type: 'ROUND_ENDED' };
    const result = strategy.apply(gs, event);
    expect(result.board).toEqual([]);
    expect(result.discardPile).toContain(10);
  });

  it('discovers up to 2 cards from discoveryPile', () => {
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({
      discoveryPile: [1, 2, 3],
      instances: { 1: inst1, 2: inst2, 3: inst3 },
    });
    const event = { id: 'e3', timestamp: 0, endRoundTriggers: {}, type: 'ROUND_ENDED' };
    const result = strategy.apply(gs, event);
    expect(result.discoveryPile).toEqual([1, 2, 3]);
  });

  it('does not add triggers for non-END_OF_ROUND actions', () => {
    const permInst = makeInstance({ id: 9, cardId: 4, stateId: 1 });
    const strat = new RoundEndedStrategy();
    const gs = makeState({
      permanents: [9],
      instances: { 9: permInst },
      triggerPile: {},
    });
    const event = { id: 'e4', timestamp: 0, endRoundTriggers: {}, type: 'ROUND_ENDED' };
    const result = strat.apply(gs, event);
    expect(Object.keys(result.triggerPile).length).toBe(0);
  });

  it('stays in current phase if triggers remain in triggerPile', () => {
    const gs = makeState({
      triggerPile: {
        'remaining-trigger': {
          effectDef: { id: 'x', actionEffects: [] },
          sourceInstanceId: 1,
        },
      },
      board: [],
      phase: Phase.ROUND_END,
    });
    const event = { id: 'e5', timestamp: 0, endRoundTriggers: {}, type: 'ROUND_ENDED' };
    const result = strategy.apply(gs, event);

    expect(result.phase).toBe(Phase.ROUND_END);
    expect(result.triggerPile['remaining-trigger']).toBeDefined();
  });
});
