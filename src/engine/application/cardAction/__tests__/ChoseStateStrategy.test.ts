import { describe, it, expect } from 'vitest';
import { ChoseStateStrategy } from '@engine/application/cardAction/ChoseStateStrategy';
import { ActionType } from '@engine/domain/enums';
import type { CardInstance, GameState } from '@engine/domain/types';

const makeInstance = (id: number, cardId: number, stateId: number): CardInstance => ({
  id,
  cardId,
  stateId,
  stickers: {},
  trackProgress: null,
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

describe('ChoseStateStrategy', () => {
  const strategy = new ChoseStateStrategy();

  it('updates the stateId of the target instance', () => {
    const gs = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
    });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.CHOOSE_STATE,
      sourceInstanceId: 99,
      instanceId: 1,
      stateId: 3,
    });
    expect(result.instances[1].stateId).toBe(3);
  });

  it('does not affect other instances', () => {
    const gs = makeGameState({
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 11, 2),
      },
    });
    strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.CHOOSE_STATE,
      sourceInstanceId: 99,
      instanceId: 1,
      stateId: 5,
    });
    expect(gs.instances[2].stateId).toBe(2);
  });
});
