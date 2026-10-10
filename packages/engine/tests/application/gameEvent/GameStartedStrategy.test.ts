import { makeDefs, makeState } from '../fixtures';
import { GameStartedStrategy } from '@engine/application/gameEvent/GameStartedStrategy';
import { GameEventType, Phase } from '@engine/domain/enums';
import type { GameStartedEvent } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

describe('GameStartedStrategy', () => {
  const strategy = new GameStartedStrategy(makeDefs());

  it('populates instances, drawPile, stickerStock, discoveryPile', () => {
    const result = strategy.apply(makeState(), {
      id: 'e1',
      type: GameEventType.GAME_STARTED,
      timestamp: 0,
      deck: [
        { id: 1, cardId: 1 },
        { id: 2, cardId: 1 },
      ],
      initialDeck: [1],
      stickerStock: { 1: 3 },
      discoveryPile: [2],
    } as GameStartedEvent);
    expect(result.instances[1]).toMatchObject({ id: 1 });
    expect(result.drawPile).toEqual([1]);
    expect(result.stickerStock).toEqual({ 1: 3 });
    expect(result.discoveryPile).toEqual([2]);
    expect(result.isLastRound).toBe(false);
    expect(result.phase).toBe(Phase.PRE_GAME);
  });

  it('normalizes card instance fields (stickers, trackProgress, etc.)', () => {
    const result = strategy.apply(makeState(), {
      id: 'e1',
      type: GameEventType.GAME_STARTED,
      timestamp: 0,
      deck: [{ id: 1, cardId: 1 }],
      initialDeck: [1],
      stickerStock: {},
      discoveryPile: [],
    } as GameStartedEvent);
    expect(result.instances[1].stickers).toEqual({});
    expect(result.instances[1].trackProgress).toEqual([]);
    expect(result.instances[1].cumulated).toBe(0);
    expect(result.instances[1].usedActionIds).toEqual([]);
  });
});
