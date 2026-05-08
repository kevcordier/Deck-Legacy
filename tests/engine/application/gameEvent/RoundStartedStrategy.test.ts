import { makeState } from '../fixtures';
import { RoundStartedStrategy } from '@engine/application/gameEvent/RoundStartedStrategy';
import { GameEventType, PassiveType } from '@engine/domain/enums';
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
    } as RoundStartedEvent);
    expect(result.round).toBe(2);
    expect(result.board).toEqual([]);
    expect(result.discardPile).toEqual([]);
    expect(result.drawPile).toEqual([1, 2, 3]);
    expect(result.phase).toBe(Phase.ROUND_START);
  });

  it('removes newCards from discoveryPile', () => {
    const gs = makeState({ discoveryPile: [10, 11, 12] });
    const event: RoundStartedEvent = {
      id: 'e1',
      type: GameEventType.ROUND_STARTED,
      timestamp: 0,
      round: 1,
      newDrawPile: [],
    };
    const result = strategy.apply(gs, event);
    expect(result.discoveryPile).toEqual([10, 11, 12]);
    expect(result.lastAddedCards).toEqual([]);
  });

  it('keeps only global boardEffects', () => {
    const gs = makeState({
      boardEffects: {
        1: [{ id: 'global', type: PassiveType.BLOCK, global: true }],
        2: [{ id: 'local', type: PassiveType.BLOCK }],
      },
    });
    const event: RoundStartedEvent = {
      id: 'e1',
      type: GameEventType.ROUND_STARTED,
      timestamp: 0,
      round: 1,
      newDrawPile: [],
    };
    const result = strategy.apply(gs, event);
    expect(result.boardEffects).toEqual({
      1: [{ id: 'global', type: PassiveType.BLOCK, global: true }],
    });
  });
});
