import { makeDefs, makeInstance, makeState } from '../fixtures';
import { AdvanceStrategy } from '@engine/application/gameEvent/AdvanceStrategy';
import { GameEventType } from '@engine/domain/enums';
import type { AdvanceEvent } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

describe('AdvanceStrategy', () => {
  const strategy = new AdvanceStrategy(makeDefs());

  it('draws turnCards from drawPile to board', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ drawPile: [1, 2], instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.ADVANCE,
      timestamp: 0,
      turnCards: [1],
      onPlayEvents: [],
    } as AdvanceEvent);
    expect(result.board).toContain(1);
    expect(result.drawPile).not.toContain(1);
  });

  it('populates triggerPile from onPlayEvents', () => {
    const gs = makeState();
    const fakeAction = { id: 'a1', actionEffects: [] };
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.ADVANCE,
      timestamp: 0,
      turnCards: [],
      onPlayEvents: [{ effectDef: fakeAction, sourceInstanceId: 3 }],
    } as AdvanceEvent);
    const entries = Object.values(result.triggerPile);
    expect(entries).toHaveLength(1);
    expect(entries[0].sourceInstanceId).toBe(3);
  });

  it('replaces triggerPile completely', () => {
    const gs = makeState({
      triggerPile: { old: { effectDef: { id: 'x', actionEffects: [] }, sourceInstanceId: 1 } },
    });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.ADVANCE,
      timestamp: 0,
      turnCards: [],
      onPlayEvents: [],
    } as AdvanceEvent);
    expect(Object.keys(result.triggerPile)).toHaveLength(0);
  });
});
