import { makeState } from '../fixtures';
import { TurnEndedStrategy } from '@engine/application/gameEvent/TurnEndedStrategy';
import { GameEventType } from '@engine/domain/enums';
import type { TurnEndedEvent } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it } from 'vitest';

describe('TurnEndedStrategy', () => {
  const strategy = new TurnEndedStrategy();

  it('sets phase to END_TURN', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.TURN_ENDED,
      timestamp: 0,
      onTurnEndedEvents: [],
    } as TurnEndedEvent);
    expect(result.phase).toBe(Phase.END_TURN);
  });

  it('populates triggerPile from onTurnEndedEvents', () => {
    const gs = makeState();
    const fakeAction = { id: 'a1', actionEffects: [] };
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.TURN_ENDED,
      timestamp: 0,
      onTurnEndedEvents: [{ effectDef: fakeAction, sourceInstanceId: 7 }],
    } as TurnEndedEvent);
    const entries = Object.values(result.triggerPile);
    expect(entries).toHaveLength(1);
    expect(entries[0].sourceInstanceId).toBe(7);
  });

  it('replaces existing triggerPile', () => {
    const gs = makeState({
      triggerPile: { 'old-id': { effectDef: { id: 'x', actionEffects: [] }, sourceInstanceId: 1 } },
    });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.TURN_ENDED,
      timestamp: 0,
      onTurnEndedEvents: [],
    } as TurnEndedEvent);
    expect(Object.keys(result.triggerPile)).toHaveLength(0);
  });
});
