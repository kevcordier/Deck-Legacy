import { makeInstance, makeState, makeStickerDefs } from './fixtures';
import { matchHaving, stateSelector } from '@engine/application/stateSelector';
import type { CardDef, Sticker } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const defs: Record<number, CardDef> = {
  1: {
    id: 1,
    name: 'Test Card',
    states: [
      {
        id: 1,
        name: 'Low',
        glory: { amount: 1 },
        productions: [{ gold: 1 }],
      },
      {
        id: 2,
        name: 'High',
        glory: { amount: 3 },
        productions: [{ gold: 3 }],
      },
    ],
  },
};

const stickerDefs: Record<number, Sticker> = makeStickerDefs();

function baseState() {
  const instance = makeInstance({
    id: 1,
    cardId: 1,
    stateId: 1,
    stickers: {
      1: [1],
      2: [1, 1],
    },
  });

  return makeState({
    instances: { 1: instance },
  });
}

describe('stateSelector', () => {
  it('returns empty array when ids is undefined', () => {
    const result = stateSelector({}, 1, baseState(), defs, stickerDefs);
    expect(result).toEqual([]);
  });

  it('returns all ids when having is not provided', () => {
    const result = stateSelector({ ids: [1, 2] }, 1, baseState(), defs, stickerDefs);
    expect(result).toEqual([1, 2]);
  });

  it('filters by glory boundaries', () => {
    const result = stateSelector(
      { ids: [1, 2], having: { minGlory: 2, maxGlory: 3 } },
      1,
      baseState(),
      defs,
      stickerDefs,
    );

    expect(result).toEqual([2]);
  });

  it('filters by production boundaries', () => {
    const result = stateSelector(
      { ids: [1, 2], having: { minProduction: 4, maxProduction: 4 } },
      1,
      baseState(),
      defs,
      stickerDefs,
    );

    expect(result).toEqual([2]);
  });

  it('filters by sticker boundaries', () => {
    const result = stateSelector(
      { ids: [1, 2], having: { minStickers: 2, maxStickers: 2 } },
      1,
      baseState(),
      defs,
      stickerDefs,
    );

    expect(result).toEqual([2]);
  });

  it('excludes states when sticker count is above maxStickers', () => {
    const result = stateSelector(
      { ids: [1, 2], having: { maxStickers: 1 } },
      1,
      baseState(),
      defs,
      stickerDefs,
    );

    expect(result).toEqual([1]);
  });

  it('treats states without productions as 0 production for minProduction checks', () => {
    const defsNoProduction: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'NoProd',
        states: [
          { id: 1, name: 'S1' },
          { id: 2, name: 'S2' },
        ],
      },
    };

    const result = stateSelector(
      { ids: [1, 2], having: { minProduction: 1 } },
      1,
      baseState(),
      defsNoProduction,
      stickerDefs,
    );

    expect(result).toEqual([]);
  });

  it('treats missing stickers for a state as an empty array', () => {
    const instance = makeInstance({
      id: 1,
      cardId: 1,
      stateId: 1,
      stickers: {
        1: [1],
      },
    });
    const gs = makeState({ instances: { 1: instance } });

    const result = stateSelector(
      { ids: [2], having: { maxStickers: 0 } },
      1,
      gs,
      defs,
      stickerDefs,
    );

    expect(result).toEqual([2]);
  });
});

describe('matchHaving', () => {
  it('returns true when selector.having is undefined', () => {
    const result = matchHaving(1, 1, {
      gameState: baseState(),
      defs,
      stickerDefs,
      selector: {},
    });

    expect(result).toBe(true);
  });
});
