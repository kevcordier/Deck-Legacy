import { describe, it, expect } from 'vitest';
import {
  mergeResources,
  canAffordCost,
  spendCost,
  resolveTargets,
  computeScore,
  getActiveState,
  hasTag,
  hasEffect,
  type CardDef,
  type CardInstance,
  type GameState,
} from '@engine/types';
import { EMPTY_STATE } from '@engine/reducer';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeInstance = (overrides: Partial<CardInstance> = {}): CardInstance => ({
  uid: 'test-uid',
  cardId: 1,
  stateId: 10,
  stickers: [],
  blockedBy: null,
  trackProgress: null,
  tags: [],
  ...overrides,
});

const simpleDef: CardDef = {
  id: 1,
  name: 'Village',
  states: [
    {
      id: 10,
      name: 'Village',
      tags: ['Settlement'],
      productions: [{ or: 1 }],
      glory: 2,
    },
  ],
};

const defs: Record<number, CardDef> = { 1: simpleDef };

// ─── mergeResources ───────────────────────────────────────────────────────────

describe('mergeResources', () => {
  it('merges two disjoint resource maps', () => {
    expect(mergeResources({ or: 1 }, { bois: 2 })).toEqual({ or: 1, bois: 2 });
  });

  it('sums overlapping keys', () => {
    expect(mergeResources({ or: 3 }, { or: 2, bois: 1 })).toEqual({ or: 5, bois: 1 });
  });

  it('handles empty objects', () => {
    expect(mergeResources({}, { or: 1 })).toEqual({ or: 1 });
    expect(mergeResources({ or: 1 }, {})).toEqual({ or: 1 });
    expect(mergeResources({}, {})).toEqual({});
  });
});

// ─── canAffordCost ────────────────────────────────────────────────────────────

describe('canAffordCost', () => {
  it('returns true when no resources required', () => {
    expect(canAffordCost({}, {})).toBe(true);
    expect(canAffordCost({}, { resources: [] })).toBe(true);
  });

  it('returns true when resources are sufficient', () => {
    expect(canAffordCost({ or: 3, bois: 2 }, { resources: [{ or: 2 }] })).toBe(true);
  });

  it('returns false when resources are insufficient', () => {
    expect(canAffordCost({ or: 1 }, { resources: [{ or: 2 }] })).toBe(false);
  });

  it('returns false when resource key is missing', () => {
    expect(canAffordCost({ bois: 5 }, { resources: [{ or: 1 }] })).toBe(false);
  });
});

// ─── spendCost ────────────────────────────────────────────────────────────────

describe('spendCost', () => {
  it('subtracts resources', () => {
    expect(spendCost({ or: 5, bois: 2 }, { resources: [{ or: 2 }] })).toEqual({
      or: 3,
      bois: 2,
    });
  });

  it('removes key when resource reaches zero', () => {
    const result = spendCost({ or: 2 }, { resources: [{ or: 2 }] });
    expect(result.or).toBeUndefined();
  });

  it('returns unchanged resources when cost has no resources', () => {
    expect(spendCost({ or: 3 }, {})).toEqual({ or: 3 });
  });
});

// ─── getActiveState ───────────────────────────────────────────────────────────

describe('getActiveState', () => {
  it('returns the matching state', () => {
    const inst = makeInstance({ cardId: 1, stateId: 10 });
    expect(getActiveState(inst, defs).name).toBe('Village');
  });

  it('throws when card def is missing', () => {
    const inst = makeInstance({ cardId: 99, stateId: 10 });
    expect(() => getActiveState(inst, defs)).toThrow();
  });

  it('throws when state id is missing', () => {
    const inst = makeInstance({ cardId: 1, stateId: 99 });
    expect(() => getActiveState(inst, defs)).toThrow();
  });
});

// ─── hasTag ───────────────────────────────────────────────────────────────────

describe('hasTag', () => {
  it('returns true when tag is present', () => {
    const inst = makeInstance({ tags: ['Person', 'Hero'] });
    expect(hasTag(inst, 'Hero')).toBe(true);
  });

  it('returns false when tag is absent', () => {
    const inst = makeInstance({ tags: ['Person'] });
    expect(hasTag(inst, 'Enemy')).toBe(false);
  });
});

// ─── hasEffect ────────────────────────────────────────────────────────────────

describe('hasEffect', () => {
  it('returns false when no passive effects', () => {
    const inst = makeInstance({ cardId: 1, stateId: 10 });
    expect(hasEffect(inst, defs, 'reste_en_jeu')).toBe(false);
  });

  it('returns true when sticker adds the passive effect', () => {
    const inst = makeInstance({
      cardId: 1,
      stateId: 10,
      stickers: [
        {
          stickerNumber: 99,
          effect: { type: 'add_passive_effect', effectId: 'reste_en_jeu' },
        },
      ],
    });
    expect(hasEffect(inst, defs, 'reste_en_jeu')).toBe(true);
  });

  it('returns true when stayInPlay is set on the card state', () => {
    const stayDef: CardDef = {
      id: 2,
      name: 'Castle',
      states: [{ id: 20, name: 'Castle', tags: [], stayInPlay: true }],
    };
    const inst = makeInstance({ cardId: 2, stateId: 20 });
    expect(hasEffect(inst, { 2: stayDef }, 'reste_en_jeu')).toBe(true);
  });
});

// ─── resolveTargets ───────────────────────────────────────────────────────────

describe('resolveTargets', () => {
  const uid = (id: string): CardInstance => makeInstance({ uid: id, cardId: 1, stateId: 10 });

  const buildState = (overrides: Partial<GameState> = {}): GameState => ({
    ...EMPTY_STATE,
    instances: {
      a: uid('a'),
      b: uid('b'),
      c: uid('c'),
      d: uid('d'),
    },
    deck: ['a'],
    tableau: ['b'],
    discard: ['c'],
    permanents: ['d'],
    ...overrides,
  });

  it('scope any returns all zones', () => {
    const state = buildState();
    expect(resolveTargets({ scope: 'any' }, state).sort()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('scope deck returns only deck', () => {
    expect(resolveTargets({ scope: 'deck' }, buildState())).toEqual(['a']);
  });

  it('scope tableau returns only tableau', () => {
    expect(resolveTargets({ scope: 'tableau' }, buildState())).toEqual(['b']);
  });

  it('scope discard returns only discard', () => {
    expect(resolveTargets({ scope: 'discard' }, buildState())).toEqual(['c']);
  });

  it('scope permanents returns only permanents', () => {
    expect(resolveTargets({ scope: 'permanents' }, buildState())).toEqual(['d']);
  });

  it('scope blocked returns cards with blockedBy set', () => {
    const state = buildState({
      instances: {
        a: uid('a'),
        b: { ...uid('b'), blockedBy: 'a' },
        c: uid('c'),
        d: uid('d'),
      },
    });
    expect(resolveTargets({ scope: 'blocked' }, state)).toEqual(['b']);
  });

  it('scope tagged filters by tag', () => {
    const taggedInst: CardInstance = { ...uid('b'), tags: ['Hero'] };
    const state = buildState({
      instances: { a: uid('a'), b: taggedInst, c: uid('c'), d: uid('d') },
    });
    expect(resolveTargets({ scope: 'tagged', tag: 'Hero' }, state)).toEqual(['b']);
    expect(resolveTargets({ scope: 'tagged', tag: 'Enemy' }, state)).toEqual([]);
  });
});

// ─── computeScore ─────────────────────────────────────────────────────────────

describe('computeScore', () => {
  it('returns 0 for empty state', () => {
    expect(computeScore(EMPTY_STATE, {})).toBe(0);
  });

  it('sums glory from card states', () => {
    const inst = makeInstance({ uid: 'a', cardId: 1, stateId: 10 });
    const state: GameState = { ...EMPTY_STATE, tableau: ['a'], instances: { a: inst } };
    expect(computeScore(state, defs)).toBe(2);
  });

  it('adds glory from stickers', () => {
    const inst = makeInstance({
      uid: 'a',
      cardId: 1,
      stateId: 10,
      stickers: [{ stickerNumber: 0, effect: { type: 'glory_points', amount: 3 } }],
    });
    const state: GameState = { ...EMPTY_STATE, tableau: ['a'], instances: { a: inst } };
    expect(computeScore(state, defs)).toBe(5);
  });

  it('counts cards in all zones', () => {
    const mkInst = (uid: string): CardInstance => makeInstance({ uid, cardId: 1, stateId: 10 });
    const state: GameState = {
      ...EMPTY_STATE,
      deck: ['a'],
      tableau: ['b'],
      discard: ['c'],
      permanents: ['d'],
      instances: { a: mkInst('a'), b: mkInst('b'), c: mkInst('c'), d: mkInst('d') },
    };
    expect(computeScore(state, defs)).toBe(8); // 4 × glory 2
  });
});
