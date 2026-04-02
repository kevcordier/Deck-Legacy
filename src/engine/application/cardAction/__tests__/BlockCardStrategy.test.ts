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

  it('registers sourceInstanceId blocking the target instanceId', () => {
    const gs = makeGameState();
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.BLOCK_CARD,
      sourceInstanceId: 5,
      instanceId: 10,
    });
    expect(result.blockingCards[5]).toBe(10);
  });

  it('overwrites an existing blocking entry for the source', () => {
    const gs = makeGameState({ blockingCards: { 5: 99 } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.BLOCK_CARD,
      sourceInstanceId: 5,
      instanceId: 42,
    });
    expect(result.blockingCards[5]).toBe(42);
  });

  it('does not affect other entries in blockingCards', () => {
    const gs = makeGameState({ blockingCards: { 3: 7 } });
    strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.BLOCK_CARD,
      sourceInstanceId: 5,
      instanceId: 10,
    });
    expect(gs.blockingCards[3]).toBe(7);
  });
});
