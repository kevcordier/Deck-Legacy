import { makeInstance, makeState } from '../fixtures';
import { TurnStartedStrategy } from '@engine/application/gameEvent/TurnStartedStrategy';
import { GameEventType } from '@engine/domain/enums';
import type { CardDef, TurnStartedEvent } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it } from 'vitest';

const defs: Record<number, CardDef> = {
  1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
};

describe('TurnStartedStrategy', () => {
  const strategy = new TurnStartedStrategy(defs);

  it('moves turnCards from drawPile to board', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ drawPile: [1, 2], instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.TURN_STARTED,
      timestamp: 0,
      turn: 1,
      turnCards: [1],
      onPlayEvents: [],
    } as TurnStartedEvent);
    expect(result.board).toContain(1);
    expect(result.drawPile).not.toContain(1);
  });

  it('sets phase to PLAYING', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.TURN_STARTED,
      timestamp: 0,
      turn: 1,
      turnCards: [],
      onPlayEvents: [],
    } as TurnStartedEvent);
    expect(result.phase).toBe(Phase.PLAYING);
  });

  it('populates triggerPile from onPlayEvents', () => {
    const gs = makeState();
    const fakeAction = { id: 'a1', actionEffects: [] };
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.TURN_STARTED,
      timestamp: 0,
      turn: 1,
      turnCards: [],
      onPlayEvents: [{ effectDef: fakeAction, sourceInstanceId: 5 }],
    } as TurnStartedEvent);
    const entries = Object.values(result.triggerPile);
    expect(entries).toHaveLength(1);
    expect(entries[0].sourceInstanceId).toBe(5);
  });

  it('discards non-permanent board cards from previous turn', () => {
    const inst = makeInstance({ id: 10, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [10], instances: { 10: inst } });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.TURN_STARTED,
      timestamp: 0,
      turn: 2,
      turnCards: [],
      onPlayEvents: [],
    } as TurnStartedEvent);
    expect(result.discardPile).toContain(10);
  });
});
