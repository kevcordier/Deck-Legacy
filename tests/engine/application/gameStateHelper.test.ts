import { makeDefs, makeInstance, makeState, makeStickerDefs } from './fixtures';
import {
  canUseOptions,
  computeGameStateDiff,
  destroyCards,
  discardCards,
  drawCards,
  mergeResources,
  pickPermanentBoardEffects,
  spendResources,
  syncInstancePassivesInBoardEffects,
} from '@engine/application/gameStateHelper';
import { Options, PassiveType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

// ─── mergeResources ───────────────────────────────────────────────────────────

describe('mergeResources', () => {
  it('returns a copy when b is undefined', () => {
    const result = mergeResources({ gold: 3 });
    expect(result).toEqual({ gold: 3 });
  });

  it('merges two resource objects', () => {
    expect(mergeResources({ gold: 1, wood: 2 }, { gold: 4, stone: 1 })).toEqual({
      gold: 5,
      wood: 2,
      stone: 1,
    });
  });

  it('handles empty sources', () => {
    expect(mergeResources({}, {})).toEqual({});
  });
});

// ─── discardCards ─────────────────────────────────────────────────────────────

describe('discardCards', () => {
  it('moves a card from board to discardPile', () => {
    const inst = makeInstance({ id: 10, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [10], instances: { 10: inst } });
    const result = discardCards(gs, [10], makeDefs(), makeStickerDefs());
    expect(result.board).not.toContain(10);
    expect(result.discardPile).toContain(10);
  });

  it('removes card from drawPile', () => {
    const inst = makeInstance({ id: 5 });
    const gs = makeState({ drawPile: [5], instances: { 5: inst } });
    const result = discardCards(gs, [5], makeDefs(), makeStickerDefs());
    expect(result.drawPile).not.toContain(5);
    expect(result.discardPile).toContain(5);
  });

  it('removes card from discoveryPile', () => {
    const inst = makeInstance({ id: 7 });
    const gs = makeState({ discoveryPile: [7], instances: { 7: inst } });
    const result = discardCards(gs, [7], makeDefs(), makeStickerDefs());
    expect(result.discoveryPile).not.toContain(7);
    expect(result.discardPile).toContain(7);
  });

  it('skips cards already in destroyedPile', () => {
    const inst = makeInstance({ id: 3 });
    const gs = makeState({ destroyedPile: [3], board: [3], instances: { 3: inst } });
    const result = discardCards(gs, [3], makeDefs(), makeStickerDefs());
    expect(result.board).toContain(3);
    expect(result.discardPile).not.toContain(3);
  });

  it('clears boardEffects for discarded card', () => {
    const inst = makeInstance({ id: 2 });
    const gs = makeState({
      board: [2],
      instances: { 2: inst },
      boardEffects: { 2: [{ id: 'x', type: PassiveType.BLOCK }] },
    });
    const result = discardCards(gs, [2], makeDefs(), makeStickerDefs());
    expect(result.boardEffects[2]).toBeUndefined();
  });

  it('removes boardEffects for discarded card', () => {
    const inst = makeInstance({ id: 12 });
    const gs = makeState({
      board: [12],
      instances: { 12: inst },
      boardEffects: { 12: [{ id: 'g', type: PassiveType.BLOCK }] },
    });
    const result = discardCards(gs, [12], makeDefs(), makeStickerDefs());
    expect(result.boardEffects[12]).toBeUndefined();
  });

  it('does not duplicate in discardPile', () => {
    const inst = makeInstance({ id: 4 });
    const gs = makeState({ discardPile: [4], instances: { 4: inst } });
    const result = discardCards(gs, [4], makeDefs(), makeStickerDefs());
    expect(result.discardPile.filter(id => id === 4)).toHaveLength(1);
  });
});

// ─── drawCards ────────────────────────────────────────────────────────────────

describe('drawCards', () => {
  it('moves cards from drawPile to board', () => {
    const inst = makeInstance({ id: 1 });
    const gs = makeState({ drawPile: [1, 2], instances: { 1: inst } });
    const result = drawCards(gs, [1], makeDefs(), makeStickerDefs());
    expect(result.drawPile).not.toContain(1);
    expect(result.board).toContain(1);
  });
});

// ─── destroyCards ─────────────────────────────────────────────────────────────

describe('destroyCards', () => {
  it('moves a card to destroyedPile', () => {
    const inst = makeInstance({ id: 6 });
    const gs = makeState({ board: [6], instances: { 6: inst } });
    const result = destroyCards(gs, [6]);
    expect(result.board).not.toContain(6);
    expect(result.destroyedPile).toContain(6);
  });

  it('removes from all piles', () => {
    const inst = makeInstance({ id: 8 });
    const gs = makeState({
      drawPile: [8],
      discardPile: [8],
      discoveryPile: [8],
      board: [8],
      instances: { 8: inst },
    });
    const result = destroyCards(gs, [8]);
    expect(result.drawPile).not.toContain(8);
    expect(result.discardPile).not.toContain(8);
    expect(result.discoveryPile).not.toContain(8);
    expect(result.board).not.toContain(8);
    expect(result.destroyedPile).toContain(8);
  });

  it('clears boardEffects for destroyed card', () => {
    const inst = makeInstance({ id: 11 });
    const gs = makeState({
      board: [11],
      instances: { 11: inst },
      boardEffects: { 11: [{ id: 'y', type: PassiveType.BLOCK }] },
    });
    const result = destroyCards(gs, [11]);
    expect(result.boardEffects[11]).toBeUndefined();
  });

  it('removes boardEffects for destroyed card', () => {
    const inst = makeInstance({ id: 13 });
    const gs = makeState({
      board: [13],
      instances: { 13: inst },
      boardEffects: { 13: [{ id: 'g', type: PassiveType.BLOCK }] },
    });
    const result = destroyCards(gs, [13]);
    expect(result.boardEffects[13]).toBeUndefined();
  });
});

// ─── spendResources ───────────────────────────────────────────────────────────

describe('spendResources', () => {
  it('reduces existing resources', () => {
    const gs = makeState({ resources: { gold: 5, wood: 2 } });
    const result = spendResources(gs, { gold: 3 });
    expect(result.resources.gold).toBe(2);
    expect(result.resources.wood).toBe(2);
  });

  it('removes resource key when it reaches zero', () => {
    const gs = makeState({ resources: { gold: 2 } });
    const result = spendResources(gs, { gold: 2 });
    expect(result.resources.gold).toBeUndefined();
  });

  it('removes resource key when it goes below zero', () => {
    const gs = makeState({ resources: { gold: 1 } });
    const result = spendResources(gs, { gold: 5 });
    expect(result.resources.gold).toBeUndefined();
  });

  it('treats missing resource key as 0 when spending', () => {
    const gs = makeState({ resources: {} });
    const result = spendResources(gs, { gold: 3 });
    expect(result.resources.gold).toBeUndefined();
  });
});

// ─── computeGameStateDiff ─────────────────────────────────────────────────────

describe('computeGameStateDiff', () => {
  it('returns empty object when states are identical', () => {
    const gs = makeState({ resources: { gold: 1 } });
    expect(computeGameStateDiff(gs, gs)).toEqual({});
  });

  it('returns only changed keys', () => {
    const before = makeState({ resources: { gold: 1 } });
    const after = makeState({ resources: { gold: 2 } });
    const diff = computeGameStateDiff(before, after);
    expect(diff).toHaveProperty('resources', { gold: 2 });
    expect(Object.keys(diff)).toHaveLength(1);
  });

  it('includes newly added keys', () => {
    const before = makeState({});
    const after = makeState({ board: [1] });
    const diff = computeGameStateDiff(before, after);
    expect(diff).toHaveProperty('board', [1]);
  });

  it('returns only changed instances when instances differ', () => {
    const before = makeState({
      instances: { 1: makeInstance({ id: 1, stateId: 1 }), 2: makeInstance({ id: 2, stateId: 1 }) },
    });
    const after = makeState({
      instances: { 1: makeInstance({ id: 1, stateId: 2 }), 2: makeInstance({ id: 2, stateId: 1 }) },
    });
    const diff = computeGameStateDiff(before, after);
    expect(diff.instances).toBeDefined();
    expect(Object.keys(diff.instances ?? {})).toEqual(['1']);
  });
});

// ─── drawCards with passives ──────────────────────────────────────────────────

describe('drawCards – card with passives', () => {
  it('adds passives to boardEffects when drawn card has passives', () => {
    const passive = { id: 'sip', type: PassiveType.STAY_IN_PLAY };
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S', passives: [passive] }] },
    };
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ drawPile: [1], instances: { 1: inst } });
    const result = drawCards(gs, [1], defs, makeStickerDefs());
    expect(result.boardEffects[1]).toHaveLength(1);
    expect(result.boardEffects[1][0].id).toBe('sip');
  });
});

// ─── canUseOptions ────────────────────────────────────────────────────────────

describe('canUseOptions', () => {
  it('returns true when no board effects', () => {
    expect(canUseOptions(makeState(), Options.ACTION)).toBe(true);
  });

  it('returns true when board effects do not include DESACTIVATE_OPTION', () => {
    const gs = makeState({
      boardEffects: {
        1: [{ id: 'b', type: PassiveType.BLOCK }],
      },
    });
    expect(canUseOptions(gs, Options.ACTION)).toBe(true);
  });

  it('returns false when DESACTIVATE_OPTION passive blocks the given option', () => {
    const gs = makeState({
      boardEffects: {
        1: [
          {
            id: 'da',
            type: PassiveType.DESACTIVATE_OPTION,
            options: [Options.ACTION],
          },
        ],
      },
    });
    expect(canUseOptions(gs, Options.ACTION)).toBe(false);
  });

  it('returns true when DESACTIVATE_OPTION blocks a different option', () => {
    const gs = makeState({
      boardEffects: {
        1: [
          {
            id: 'da',
            type: PassiveType.DESACTIVATE_OPTION,
            options: [Options.ADVANCE],
          },
        ],
      },
    });
    expect(canUseOptions(gs, Options.ACTION)).toBe(true);
  });
});

describe('syncInstancePassivesInBoardEffects', () => {
  it('returns state unchanged when instance does not exist', () => {
    const gs = makeState({ instances: {} });
    const result = syncInstancePassivesInBoardEffects(gs, 999, makeDefs());
    expect(result).toEqual(gs);
  });

  it('removes boardEffects entry when active state has no passives', () => {
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
    };
    const gs = makeState({
      instances: { 1: makeInstance({ id: 1, cardId: 1, stateId: 1 }) },
      boardEffects: { 1: [{ id: 'x', type: PassiveType.BLOCK }] },
    });

    const result = syncInstancePassivesInBoardEffects(gs, 1, defs);

    expect(result.boardEffects[1]).toBeUndefined();
  });
});

describe('pickPermanentBoardEffects', () => {
  it('keeps only board effects from permanent instance ids', () => {
    const result = pickPermanentBoardEffects(
      {
        1: [{ id: 'a', type: PassiveType.BLOCK }],
        2: [{ id: 'b', type: PassiveType.COUNT_AS_2 }],
      },
      [2, 3],
    );

    expect(result).toEqual({ 2: [{ id: 'b', type: PassiveType.COUNT_AS_2 }] });
  });
});
