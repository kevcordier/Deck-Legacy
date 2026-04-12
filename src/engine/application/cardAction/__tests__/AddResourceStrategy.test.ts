import { AddResourceStrategy } from '@engine/application/cardAction/AddResourceStrategy';
import { ActionType } from '@engine/domain/enums';
import type { GameState } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

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

describe('AddResourceStrategy', () => {
  const strategy = new AddResourceStrategy();

  it('adds resources to the game state', () => {
    const gs = makeGameState({ resources: { gold: 2 } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.ADD_RESOURCES,
      sourceInstanceId: 1,
      resources: { gold: 3, wood: 1 },
    });
    expect(result.resources).toEqual({ gold: 5, wood: 1 });
  });

  it('handles empty starting resources', () => {
    const gs = makeGameState();
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.ADD_RESOURCES,
      sourceInstanceId: 1,
      resources: { stone: 4 },
    });
    expect(result.resources).toEqual({ stone: 4 });
  });

  it('handles empty resource payload', () => {
    const gs = makeGameState({ resources: { gold: 3 } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.ADD_RESOURCES,
      sourceInstanceId: 1,
      resources: {},
    });
    expect(result.resources).toEqual({ gold: 3 });
  });

  it('returns the same game state object (mutates in place)', () => {
    const gs = makeGameState();
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.ADD_RESOURCES,
      sourceInstanceId: 1,
      resources: { gold: 1 },
    });
    expect(result).toEqual({ ...gs, resources: { gold: 1 } }); // should return the same game state object
  });
});
