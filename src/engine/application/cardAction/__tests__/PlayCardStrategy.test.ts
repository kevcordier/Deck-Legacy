import { describe, it, expect } from 'vitest';
import { PlayCardStrategy } from '@engine/application/cardAction/PlayCardStrategy';
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

describe('PlayCardStrategy', () => {
  const strategy = new PlayCardStrategy();

  it('adds the card to the board', () => {
    const gs = makeGameState({ board: [1] });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.PLAY_CARD,
      sourceInstanceId: 99,
      instanceId: 5,
    });
    expect(result.board).toContain(5);
    expect(result.board).toContain(1);
  });

  it('removes the card from discoveryPile', () => {
    const gs = makeGameState({ discoveryPile: [5, 6] });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.PLAY_CARD,
      sourceInstanceId: 99,
      instanceId: 5,
    });
    expect(result.discoveryPile).toEqual([6]);
  });

  it('removes the card from drawPile', () => {
    const gs = makeGameState({ drawPile: [5, 7] });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.PLAY_CARD,
      sourceInstanceId: 99,
      instanceId: 5,
    });
    expect(result.drawPile).toEqual([7]);
  });

  it('removes the card from discardPile', () => {
    const gs = makeGameState({ discardPile: [5, 8] });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.PLAY_CARD,
      sourceInstanceId: 99,
      instanceId: 5,
    });
    expect(result.discardPile).toEqual([8]);
  });

  it('removes the card from destroyedPile', () => {
    const gs = makeGameState({ destroyedPile: [5, 9] });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.PLAY_CARD,
      sourceInstanceId: 99,
      instanceId: 5,
    });
    expect(result.destroyedPile).toEqual([9]);
  });
});
