import { describe, it, expect } from 'vitest';
import { UpgradeCardStrategy } from '@engine/application/cardAction/UpgradeCardStrategy';
import { ActionType } from '@engine/domain/enums';
import type { CardInstance, GameState } from '@engine/domain/types';

const makeInstance = (id: number, cardId: number, stateId: number): CardInstance => ({
  id,
  cardId,
  stateId,
  stickers: {},
  trackProgress: [],
});

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

describe('UpgradeCardStrategy', () => {
  const strategy = new UpgradeCardStrategy();

  it('updates the stateId of the target instance', () => {
    const gs = makeGameState({
      board: [1],
      instances: { 1: makeInstance(1, 10, 1) },
    });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.UPGRADE_CARD,
      sourceInstanceId: 99,
      instanceId: 1,
      stateId: 3,
    });
    expect(result.instances[1].stateId).toBe(3);
  });

  it('moves the upgraded card to the discard pile', () => {
    const gs = makeGameState({
      board: [1, 2],
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 11, 1),
      },
    });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.UPGRADE_CARD,
      sourceInstanceId: 99,
      instanceId: 1,
      stateId: 2,
    });
    expect(result.board).toEqual([2]);
    expect(result.discardPile).toContain(1);
  });
});
