import { makeInstance, makeState } from '../fixtures';
import { GameStartedStrategy } from '@engine/application/gameEvent/GameStartedStrategy';
import { GameEventType } from '@engine/domain/enums';
import type { GameStartedEvent } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it } from 'vitest';

describe('GameStartedStrategy', () => {
  const strategy = new GameStartedStrategy();

  it('populates instances, drawPile, stickerStock, discoveryPile', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const result = strategy.apply(makeState(), {
      id: 'e1',
      type: GameEventType.GAME_STARTED,
      timestamp: 0,
      cardInstances: [inst],
      initialDeck: [1],
      stickerStock: { 1: 3 },
      discoveryPile: [2],
    } as GameStartedEvent);
    expect(result.instances[1]).toMatchObject({ id: 1 });
    expect(result.drawPile).toEqual([1]);
    expect(result.stickerStock).toEqual({ 1: 3 });
    expect(result.discoveryPile).toEqual([2]);
    expect(result.phase).toBe(Phase.PREGAME);
  });

  it('normalizes card instance fields (stickers, trackProgress, etc.)', () => {
    const bare = { id: 5, cardId: 1, stateId: 1 } as never;
    const result = strategy.apply(makeState(), {
      id: 'e1',
      type: GameEventType.GAME_STARTED,
      timestamp: 0,
      cardInstances: [bare],
      initialDeck: [],
      stickerStock: {},
      discoveryPile: [],
    } as GameStartedEvent);
    expect(result.instances[5].stickers).toEqual({});
    expect(result.instances[5].trackProgress).toEqual([]);
    expect(result.instances[5].cumulated).toEqual({});
    expect(result.instances[5].usedActionIds).toEqual([]);
  });
});
