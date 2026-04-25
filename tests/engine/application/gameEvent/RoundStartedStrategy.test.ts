import { makeState } from '../fixtures';
import { RoundStartedStrategy } from '@engine/application/gameEvent/RoundStartedStrategy';
import { GameEventType } from '@engine/domain/enums';
import type { RoundStartedEvent } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it } from 'vitest';

describe('RoundStartedStrategy', () => {
  const strategy = new RoundStartedStrategy();

  it('sets round, clears board/discard, applies new draw pile', () => {
    const gs = makeState({ board: [1], discardPile: [2], discoveryPile: [3, 4] });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.ROUND_STARTED,
      timestamp: 0,
      round: 2,
      newCards: [3],
      newDrawPile: [1, 2, 3],
      onDiscoverEvents: [],
    } as RoundStartedEvent);
    expect(result.round).toBe(2);
    expect(result.board).toEqual([]);
    expect(result.discardPile).toEqual([]);
    expect(result.drawPile).toEqual([1, 2, 3]);
    expect(result.phase).toBe(Phase.START_ROUND);
  });

  it('removes newCards from discoveryPile', () => {
    const gs = makeState({ discoveryPile: [10, 11, 12] });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.ROUND_STARTED,
      timestamp: 0,
      round: 1,
      newCards: [10, 11],
      newDrawPile: [],
      onDiscoverEvents: [],
    } as RoundStartedEvent);
    expect(result.discoveryPile).toEqual([12]);
    expect(result.lastAddedIds).toEqual([10, 11]);
  });

  it('populates triggerPile from onDiscoverEvents', () => {
    const gs = makeState();
    const fakeAction = { id: 'a1', actionEffects: [] };
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.ROUND_STARTED,
      timestamp: 0,
      round: 1,
      newCards: [],
      newDrawPile: [],
      onDiscoverEvents: [{ effectDef: fakeAction, sourceInstanceId: 5 }],
    } as RoundStartedEvent);
    const entries = Object.values(result.triggerPile);
    expect(entries).toHaveLength(1);
    expect(entries[0].sourceInstanceId).toBe(5);
  });

  it('clears boardEffects', () => {
    const gs = makeState({ boardEffects: { 1: [{ id: 'b', type: 'BLOCK' as never }] } });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.ROUND_STARTED,
      timestamp: 0,
      round: 1,
      newCards: [],
      newDrawPile: [],
      onDiscoverEvents: [],
    } as RoundStartedEvent);
    expect(result.boardEffects).toEqual({});
  });

  it('resets turn to 0', () => {
    const gs = makeState({ turn: 5 });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.ROUND_STARTED,
      timestamp: 0,
      round: 2,
      newCards: [],
      newDrawPile: [],
      onDiscoverEvents: [],
    } as RoundStartedEvent);
    expect(result.turn).toBe(0);
  });
});
