import { makeInstance, makeState } from '../fixtures';
import { AddStickerStrategy } from '@engine/application/cardAction/AddStickerStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('AddStickerStrategy', () => {
  const strategy = new AddStickerStrategy();

  it('returns state unchanged when targetId is missing', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_STICKER,
      sourceInstanceId: 1,
      stickerIds: [3],
    });
    expect(result).toBe(gs);
  });

  it('returns state unchanged when stickerIds is missing', () => {
    const inst = makeInstance({ id: 2 });
    const gs = makeState({ instances: { 2: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_STICKER,
      sourceInstanceId: 1,
      instanceIds: [2],
    });
    expect(result).toBe(gs);
  });

  it('adds sticker to target instance and decrements stock', () => {
    const inst = makeInstance({ id: 2, stateId: 1 });
    const gs = makeState({ instances: { 2: inst }, stickerStock: { 5: 3 } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_STICKER,
      sourceInstanceId: 1,
      instanceIds: [2],
      stickerIds: [5],
    });
    expect(result.instances[2].stickers[1]).toContain(5);
    expect(result.stickerStock[5]).toBe(2);
  });

  it('initializes sticker array for state if not present', () => {
    const inst = makeInstance({ id: 2, stateId: 1, stickers: {} });
    const gs = makeState({ instances: { 2: inst }, stickerStock: { 5: 1 } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_STICKER,
      sourceInstanceId: 1,
      instanceIds: [2],
      stickerIds: [5],
    });
    expect(result.instances[2].stickers[1]).toEqual([5]);
  });

  it('appends sticker to existing sticker list', () => {
    const inst = makeInstance({ id: 2, stateId: 1, stickers: { 1: [4] } });
    const gs = makeState({ instances: { 2: inst }, stickerStock: { 5: 2 } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_STICKER,
      sourceInstanceId: 1,
      instanceIds: [2],
      stickerIds: [5],
    });
    expect(result.instances[2].stickers[1]).toEqual([4, 5]);
  });

  it('adds sticker on payload.stateId when provided', () => {
    const inst = makeInstance({ id: 2, stateId: 4, stickers: { 1: [], 2: [], 3: [], 4: [] } });
    const gs = makeState({ instances: { 2: inst }, stickerStock: { 6: 1 } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_STICKER,
      sourceInstanceId: 1,
      instanceIds: [2],
      stateId: 2,
      stickerIds: [6],
    });

    expect(result.instances[2].stickers[2]).toEqual([6]);
    expect(result.instances[2].stickers[4]).toEqual([]);
    expect(result.stickerStock[6]).toBe(0);
  });
});
