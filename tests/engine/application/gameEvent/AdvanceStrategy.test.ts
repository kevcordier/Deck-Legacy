import { makeGameState, makeInstance } from '../testHelpers';
import { AdvanceStrategy } from '@engine/application/gameEvent/AdvanceStrategy';
import { ActionType, GameEventType } from '@engine/domain/enums';
import type { CardAction } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const makeCardAction = (): CardAction => ({
  id: 'action-1',
  actionEffects: [{ id: 1, type: ActionType.ADD_RESOURCES }],
});

const makeEvent = (
  overrides: Partial<{
    turnCards: number[];
    onPlayEvents: { effectDef: CardAction; sourceInstanceId: number }[];
  }> = {},
) => ({
  id: 'evt-1',
  type: GameEventType.ADVANCE,
  timestamp: 0,
  turnCards: [],
  onPlayEvents: [],
  ...overrides,
});

describe('AdvanceStrategy', () => {
  const strategy = new AdvanceStrategy();

  it('draws turnCards onto the board', () => {
    const gs = makeGameState({
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 11, 1) },
      drawPile: [1, 2],
    });
    const result = strategy.apply(gs, makeEvent({ turnCards: [1, 2] }));
    expect(result.board).toContain(1);
    expect(result.board).toContain(2);
  });

  it('removes drawn cards from drawPile', () => {
    const gs = makeGameState({
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 11, 1),
        3: makeInstance(3, 12, 1),
      },
      drawPile: [1, 2, 3],
    });
    const result = strategy.apply(gs, makeEvent({ turnCards: [1] }));
    expect(result.drawPile).not.toContain(1);
    expect(result.drawPile).toContain(2);
    expect(result.drawPile).toContain(3);
  });

  it('preserves existing board cards', () => {
    const gs = makeGameState({
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 11, 1) },
      board: [1],
      drawPile: [2],
    });
    const result = strategy.apply(gs, makeEvent({ turnCards: [2] }));
    expect(result.board).toContain(1);
    expect(result.board).toContain(2);
  });

  it('populates triggerPile from onPlayEvents', () => {
    const effectDef = makeCardAction();
    const result = strategy.apply(
      makeGameState(),
      makeEvent({ onPlayEvents: [{ effectDef, sourceInstanceId: 5 }] }),
    );
    const entries = Object.values(result.triggerPile);
    expect(entries).toHaveLength(1);
    expect(entries[0].effectDef).toEqual(effectDef);
    expect(entries[0].sourceInstanceId).toBe(5);
  });

  it('creates empty triggerPile when no onPlayEvents', () => {
    const result = strategy.apply(makeGameState(), makeEvent());
    expect(result.triggerPile).toEqual({});
  });

  it('does not alter resources', () => {
    const gs = makeGameState({ resources: { gold: 3 } });
    const result = strategy.apply(gs, makeEvent());
    expect(result.resources).toEqual({ gold: 3 });
  });
});
