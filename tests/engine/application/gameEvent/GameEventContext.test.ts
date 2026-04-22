import { makeGameState, makeInstance } from '../testHelpers';
import { GameEventContext } from '@engine/application/gameEvent/GameEventContext';
import { GameEventType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('GameEventContext', () => {
  it('dispatches a GAME_STARTED event to the correct strategy', () => {
    const ctx = new GameEventContext({});
    const gs = makeGameState();
    const event = {
      id: 'evt-1',
      type: GameEventType.GAME_STARTED,
      timestamp: 0,
      cardInstances: [makeInstance(1, 10, 1)],
      initialDeck: [1],
      stickerStock: {},
      discoveryPile: [],
    };
    const result = ctx.apply(gs, event);
    expect(result).toBeDefined();
    expect(result.instances[1]).toBeDefined();
  });

  it('throws for an unknown event type', () => {
    const ctx = new GameEventContext({});
    const gs = makeGameState();
    const event = { id: 'evt-x', type: 'UNKNOWN_EVENT', timestamp: 0 };
    expect(() => ctx.apply(gs, event)).toThrow('Unknown event type: UNKNOWN_EVENT');
  });
});
