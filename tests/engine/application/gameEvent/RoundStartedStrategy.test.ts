import { makeGameState, makeInstance } from '../testHelpers';
import { RoundStartedStrategy } from '@engine/application/gameEvent/RoundStartedStrategy';
import { ActionType, GameEventType } from '@engine/domain/enums';
import type { CardAction } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it } from 'vitest';

const makeCardAction = (): CardAction => ({
  id: 'action-1',
  actionEffects: [{ id: 1, type: ActionType.ADD_RESOURCES }],
});

const makeEvent = (
  overrides: Partial<{
    round: number;
    newCards: number[];
    newDrawPile: number[];
    onDiscoverEvents: { effectDef: CardAction; sourceInstanceId: number }[];
  }> = {},
) => ({
  id: 'evt-1',
  type: GameEventType.ROUND_STARTED,
  timestamp: 0,
  round: 1,
  newCards: [],
  newDrawPile: [],
  onDiscoverEvents: [],
  ...overrides,
});

describe('RoundStartedStrategy', () => {
  const strategy = new RoundStartedStrategy();

  it('sets round from the event', () => {
    const result = strategy.apply(makeGameState(), makeEvent({ round: 3 }));
    expect(result.round).toBe(3);
  });

  it('resets turn to 0', () => {
    const result = strategy.apply(makeGameState({ turn: 4 }), makeEvent());
    expect(result.turn).toBe(0);
  });

  it('sets phase to START_ROUND', () => {
    const result = strategy.apply(makeGameState(), makeEvent());
    expect(result.phase).toBe(Phase.START_ROUND);
  });

  it('removes newCards from discoveryPile', () => {
    const gs = makeGameState({ discoveryPile: [1, 2, 3, 4] });
    const result = strategy.apply(gs, makeEvent({ newCards: [2, 4] }));
    expect(result.discoveryPile).toEqual([1, 3]);
  });

  it('sets lastAddedIds to newCards', () => {
    const result = strategy.apply(makeGameState(), makeEvent({ newCards: [5, 6] }));
    expect(result.lastAddedIds).toEqual([5, 6]);
  });

  it('sets drawPile from newDrawPile', () => {
    const result = strategy.apply(makeGameState(), makeEvent({ newDrawPile: [7, 8, 9] }));
    expect(result.drawPile).toEqual([7, 8, 9]);
  });

  it('resets board, discardPile and boardEffects', () => {
    const gs = makeGameState({
      board: [1],
      discardPile: [2],
      boardEffects: { 3: [] },
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 10, 1) },
    });
    const result = strategy.apply(gs, makeEvent());
    expect(result.board).toEqual([]);
    expect(result.discardPile).toEqual([]);
    expect(result.boardEffects).toEqual({});
  });

  it('populates triggerPile from onDiscoverEvents', () => {
    const effectDef = makeCardAction();
    const result = strategy.apply(
      makeGameState(),
      makeEvent({ onDiscoverEvents: [{ effectDef, sourceInstanceId: 42 }] }),
    );
    const entries = Object.values(result.triggerPile);
    expect(entries).toHaveLength(1);
    expect(entries[0].effectDef).toEqual(effectDef);
    expect(entries[0].sourceInstanceId).toBe(42);
  });

  it('creates empty triggerPile when no onDiscoverEvents', () => {
    const result = strategy.apply(makeGameState(), makeEvent({ onDiscoverEvents: [] }));
    expect(result.triggerPile).toEqual({});
  });
});
