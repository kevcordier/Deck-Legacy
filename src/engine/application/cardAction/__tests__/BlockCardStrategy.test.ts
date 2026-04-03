import { describe, it, expect } from 'vitest';
import { BlockCardStrategy } from '@engine/application/cardAction/BlockCardStrategy';
import { ActionType } from '@engine/domain/enums';
import type { GameState } from '@engine/domain/types';

const makeGameState = (overrides: Partial<GameState> = {}): GameState => ({
  instances: {},
  drawPile: [],
  discardPile: [],
  board: [],
  destroyedPile: [],
  permanents: [],
  blockingCards: {},
  resources: {},
  stickerStock: {},
  discoveryPile: [],
  triggerPile: {},
  lastAddedIds: [],
  round: 0,
  turn: 0,
  ...overrides,
});

describe('BlockCardStrategy', () => {
  const strategy = new BlockCardStrategy();

  it('returns the modified game state', () => {
    const gs = makeGameState();
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.BLOCK_CARD,
      sourceInstanceId: 5,
      instanceId: 10,
    });
    expect(result).toEqual({ ...gs, blockingCards: { ...gs.blockingCards, 5: 10 } }); // should return the same game state object
    expect(result.blockingCards[5]).toBe(10);
  });

  it('does not modify blockingCards if instanceId is undefined', () => {
    const gs = makeGameState({ blockingCards: { 5: 99 } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.BLOCK_CARD,
      sourceInstanceId: 5,
    });
    expect(result.blockingCards[5]).toBe(99); // should remain unchanged
  });
});
