import { makeInstance, makeState, makeStickerDefs } from '../fixtures';
import { TurnStartedStrategy } from '@engine/application/gameEvent/TurnStartedStrategy';
import { GameEventType } from '@engine/domain/enums';
import type { CardDef, TurnStartedEvent } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it } from 'vitest';

const defs: Record<number, CardDef> = {
  1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
};

describe('TurnStartedStrategy', () => {
  const strategy = new TurnStartedStrategy(defs, makeStickerDefs());

  it('moves turnCards from drawPile to board', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ drawPile: [1, 2], instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.TURN_STARTED,
      timestamp: 0,
      turn: 1,
      turnCards: [1],
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
    } as TurnStartedEvent);
    expect(result.phase).toBe(Phase.PLAYING);
  });
});
