import { makeDef, makeGameState, makeInstance } from '../testHelpers';
import { TurnStartedStrategy } from '@engine/application/gameEvent/TurnStartedStrategy';
import { ActionType, GameEventType } from '@engine/domain/enums';
import type { CardAction, CardDef } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it } from 'vitest';

const makeCardAction = (): CardAction => ({
  id: 'action-1',
  actionEffects: [{ id: 1, type: ActionType.ADD_RESOURCES }],
});

const makeEvent = (
  overrides: Partial<{
    turn: number;
    turnCards: number[];
    onPlayEvents: { effectDef: CardAction; sourceInstanceId: number }[];
  }> = {},
) => ({
  id: 'evt-1',
  type: GameEventType.TURN_STARTED,
  timestamp: 0,
  turn: 1,
  turnCards: [],
  onPlayEvents: [],
  ...overrides,
});

describe('TurnStartedStrategy', () => {
  const makeDefs = (...ids: number[]): Record<number, CardDef> =>
    Object.fromEntries(ids.map(id => [id, makeDef(id)]));

  it('sets phase to PLAYING', () => {
    const strategy = new TurnStartedStrategy({});
    const result = strategy.apply(makeGameState(), makeEvent());
    expect(result.phase).toBe(Phase.PLAYING);
  });

  it('draws turnCards onto the board', () => {
    const defs = makeDefs(10, 11);
    const gs = makeGameState({
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 11, 1) },
      drawPile: [1, 2],
    });
    const strategy = new TurnStartedStrategy(defs);
    const result = strategy.apply(gs, makeEvent({ turnCards: [1, 2] }));
    expect(result.board).toContain(1);
    expect(result.board).toContain(2);
  });

  it('removes drawn cards from drawPile', () => {
    const defs = makeDefs(10, 11, 12);
    const gs = makeGameState({
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 11, 1),
        3: makeInstance(3, 12, 1),
      },
      drawPile: [1, 2, 3],
    });
    const strategy = new TurnStartedStrategy(defs);
    const result = strategy.apply(gs, makeEvent({ turnCards: [1, 2] }));
    expect(result.drawPile).not.toContain(1);
    expect(result.drawPile).not.toContain(2);
    expect(result.drawPile).toContain(3);
  });

  it('populates triggerPile from onPlayEvents', () => {
    const strategy = new TurnStartedStrategy({});
    const effectDef = makeCardAction();
    const result = strategy.apply(
      makeGameState(),
      makeEvent({ onPlayEvents: [{ effectDef, sourceInstanceId: 7 }] }),
    );
    const entries = Object.values(result.triggerPile);
    expect(entries).toHaveLength(1);
    expect(entries[0].effectDef).toEqual(effectDef);
    expect(entries[0].sourceInstanceId).toBe(7);
  });

  it('resets resources via endTurn', () => {
    const defs = makeDefs(10);
    const gs = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      resources: { gold: 5, wood: 2 },
    });
    const strategy = new TurnStartedStrategy(defs);
    const result = strategy.apply(gs, makeEvent());
    expect(result.resources).toEqual({});
  });
});
