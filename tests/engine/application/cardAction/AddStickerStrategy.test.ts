import { makeGameState, makeInstance } from '../testHelpers';
import { AddStickerStrategy } from '@engine/application/cardAction/AddStickerStrategy';
import { ActionType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('AddStickerStrategy', () => {
  const strategy = new AddStickerStrategy();

  it('adds a sticker to the target card for its current state', () => {
    const gs = makeGameState({
      instances: { 1: makeInstance(1, 10, 2) },
      stickerStock: { 101: 3 },
    });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.ADD_STICKER,
      sourceInstanceId: 99,
      stickerId: 101,
      instanceId: 1,
    });
    expect(result.instances[1].stickers[2]).toContain(101);
  });

  it('decrements the sticker stock', () => {
    const gs = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      stickerStock: { 101: 5 },
    });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.ADD_STICKER,
      sourceInstanceId: 99,
      stickerId: 101,
      instanceId: 1,
    });
    expect(result.stickerStock[101]).toBe(4);
  });

  it('appends to existing stickers on the card state', () => {
    const gs = makeGameState({
      instances: {
        1: {
          id: 1,
          cardId: 10,
          stateId: 1,
          stickers: { 1: [100] },
          trackProgress: [],
          cumulated: 0,
        },
      },
      stickerStock: { 101: 2 },
    });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.ADD_STICKER,
      sourceInstanceId: 99,
      stickerId: 101,
      instanceId: 1,
    });
    expect(result.instances[1].stickers[1]).toEqual([100, 101]);
  });
});
