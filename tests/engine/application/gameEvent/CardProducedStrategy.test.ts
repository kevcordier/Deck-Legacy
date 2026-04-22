import { makeGameState, makeInstance } from '../testHelpers';
import { CardProducedStrategy } from '@engine/application/gameEvent/CardProducedStrategy';
import { GameEventType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

const makeEvent = (
  overrides: Partial<{ cardInstanceId: number; productions: Record<string, number> }> = {},
) => ({
  id: 'evt-1',
  type: GameEventType.CARD_PRODUCED,
  timestamp: 0,
  cardInstanceId: 1,
  productions: {},
  ...overrides,
});

describe('CardProducedStrategy', () => {
  const strategy = new CardProducedStrategy();

  it('merges productions into resources', () => {
    const gs = makeGameState({ resources: { gold: 2 } });
    const result = strategy.apply(gs, makeEvent({ productions: { gold: 3, wood: 1 } }));
    expect(result.resources).toEqual({ gold: 5, wood: 1 });
  });

  it('handles empty starting resources', () => {
    const gs = makeGameState();
    const result = strategy.apply(gs, makeEvent({ productions: { stone: 4 } }));
    expect(result.resources).toEqual({ stone: 4 });
  });

  it('handles empty productions', () => {
    const gs = makeGameState({ resources: { gold: 3 } });
    const result = strategy.apply(gs, makeEvent({ productions: {} }));
    expect(result.resources).toEqual({ gold: 3 });
  });

  it('moves the produced card from board to discardPile', () => {
    const gs = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
    });
    const result = strategy.apply(gs, makeEvent({ cardInstanceId: 1 }));
    expect(result.board).not.toContain(1);
    expect(result.discardPile).toContain(1);
  });

  it('does not affect other cards on the board', () => {
    const gs = makeGameState({
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 11, 1) },
      board: [1, 2],
    });
    const result = strategy.apply(gs, makeEvent({ cardInstanceId: 1 }));
    expect(result.board).toContain(2);
    expect(result.discardPile).not.toContain(2);
  });
});
