import { describe, it, expect, beforeEach } from 'vitest';
import {
  shuffle,
  generateUid,
  resetUidCounter,
  createInstance,
  buildTurnStartedEvent,
  buildTurnEndedEvent,
  buildRoundStartedEvent,
  buildTrackAdvancedEvent,
} from '@engine/init';
import type { CardDef, CardInstance } from '@engine/types';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const simpleDef: CardDef = {
  id: 1,
  states: [{ id: 10, name: 'Village', tags: ['Settlement'], glory: 1 }],
  name: 'Village',
};

const stayDef: CardDef = {
  id: 2,
  states: [{ id: 20, name: 'Castle', tags: [], stayInPlay: true, glory: 3 }],
  name: 'Castle',
};

const trackDef: CardDef = {
  id: 3,
  states: [
    {
      id: 30,
      name: 'Market',
      tags: [],
      track: {
        steps: [
          { index: 0, label: 'Step 1', reward: { type: 'resource', resource: 'or', amount: 1 } },
          { index: 1, label: 'Step 2', reward: { type: 'glory_points', amount: 2 } },
          { index: 2, label: 'Step 3', reward: { type: 'resource', resource: 'bois', amount: 1 } },
        ],
      },
    },
  ],
  name: 'Market',
};

const defs: Record<number, CardDef> = { 1: simpleDef, 2: stayDef, 3: trackDef };

const makeInstance = (overrides: Partial<CardInstance> = {}): CardInstance => ({
  uid: 'uid-a',
  cardId: 1,
  stateId: 10,
  stickers: [],
  blockedBy: null,
  trackProgress: null,
  tags: [],
  ...overrides,
});

// ─── shuffle ──────────────────────────────────────────────────────────────────

describe('shuffle', () => {
  it('returns an array of the same length', () => {
    expect(shuffle([1, 2, 3, 4, 5])).toHaveLength(5);
  });

  it('contains the same elements', () => {
    const original = [1, 2, 3, 4, 5];
    expect(shuffle(original).sort()).toEqual([...original].sort());
  });

  it('does not mutate the original array', () => {
    const original = [1, 2, 3];
    shuffle(original);
    expect(original).toEqual([1, 2, 3]);
  });

  it('handles empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('handles single element', () => {
    expect(shuffle([42])).toEqual([42]);
  });
});

// ─── generateUid / resetUidCounter ───────────────────────────────────────────

describe('generateUid', () => {
  beforeEach(() => resetUidCounter());

  it('generates a non-empty string', () => {
    expect(typeof generateUid(1, 10)).toBe('string');
    expect(generateUid(1, 10).length).toBeGreaterThan(0);
  });

  it('generates unique ids on successive calls', () => {
    const a = generateUid(1, 10);
    const b = generateUid(1, 10);
    expect(a).not.toBe(b);
  });

  it('includes cardId and stateId in the uid', () => {
    const uid = generateUid(5, 42);
    expect(uid).toContain('c5');
    expect(uid).toContain('s42');
  });

  it('counter resets after resetUidCounter', () => {
    const first = generateUid(1, 10);
    resetUidCounter();
    const afterReset = generateUid(1, 10);
    // Both have counter = 1 but random suffix differs — they still start with the same prefix
    expect(first.split('_')[0]).toBe(afterReset.split('_')[0]);
  });
});

// ─── createInstance ───────────────────────────────────────────────────────────

describe('createInstance', () => {
  beforeEach(() => resetUidCounter());

  it('creates an instance with correct cardId and stateId', () => {
    const inst = createInstance(1, 10, defs);
    expect(inst.cardId).toBe(1);
    expect(inst.stateId).toBe(10);
  });

  it('initialises with empty stickers and no block', () => {
    const inst = createInstance(1, 10, defs);
    expect(inst.stickers).toEqual([]);
    expect(inst.blockedBy).toBeNull();
    expect(inst.trackProgress).toBeNull();
  });

  it('throws when card def is not found', () => {
    expect(() => createInstance(99, 10, defs)).toThrow();
  });

  it('throws when state id is not found', () => {
    expect(() => createInstance(1, 99, defs)).toThrow();
  });
});

// ─── buildTurnStartedEvent ────────────────────────────────────────────────────

describe('buildTurnStartedEvent', () => {
  it('draws up to 4 cards by default', () => {
    const deck = ['a', 'b', 'c', 'd', 'e'];
    const event = buildTurnStartedEvent(1, deck);
    expect(event.type).toBe('TURN_STARTED');
    const payload = event.payload as { turn: number; drawnUids: string[]; remainingDeck: string[] };
    expect(payload.drawnUids).toEqual(['a', 'b', 'c', 'd']);
    expect(payload.remainingDeck).toEqual(['e']);
    expect(payload.turn).toBe(1);
  });

  it('draws less when deck is smaller than count', () => {
    const payload = buildTurnStartedEvent(2, ['x', 'y']).payload as {
      drawnUids: string[];
      remainingDeck: string[];
    };
    expect(payload.drawnUids).toEqual(['x', 'y']);
    expect(payload.remainingDeck).toEqual([]);
  });

  it('respects custom count parameter', () => {
    const payload = buildTurnStartedEvent(1, ['a', 'b', 'c', 'd', 'e'], 2).payload as {
      drawnUids: string[];
    };
    expect(payload.drawnUids).toHaveLength(2);
  });

  it('handles empty deck', () => {
    const payload = buildTurnStartedEvent(1, []).payload as {
      drawnUids: string[];
      remainingDeck: string[];
    };
    expect(payload.drawnUids).toEqual([]);
    expect(payload.remainingDeck).toEqual([]);
  });
});

// ─── buildTurnEndedEvent ──────────────────────────────────────────────────────

describe('buildTurnEndedEvent', () => {
  it('discards cards without stayInPlay', () => {
    const inst = makeInstance({ uid: 'a', cardId: 1, stateId: 10 });
    const instances = { a: inst };
    const event = buildTurnEndedEvent(['a'], instances, defs, 'voluntary');
    const payload = event.payload as { discardedUids: string[]; persistedUids: string[] };
    expect(payload.discardedUids).toEqual(['a']);
    expect(payload.persistedUids).toEqual([]);
  });

  it('persists cards with stayInPlay', () => {
    const inst = makeInstance({ uid: 'b', cardId: 2, stateId: 20 });
    const instances = { b: inst };
    const event = buildTurnEndedEvent(['b'], instances, defs, 'action');
    const payload = event.payload as { discardedUids: string[]; persistedUids: string[] };
    expect(payload.persistedUids).toEqual(['b']);
    expect(payload.discardedUids).toEqual([]);
  });

  it('persists cards with reste_en_jeu sticker', () => {
    const inst = makeInstance({
      uid: 'c',
      cardId: 1,
      stateId: 10,
      stickers: [
        { stickerNumber: 0, effect: { type: 'add_passive_effect', effectId: 'reste_en_jeu' } },
      ],
    });
    const instances = { c: inst };
    const event = buildTurnEndedEvent(['c'], instances, defs, 'voluntary');
    const payload = event.payload as { persistedUids: string[] };
    expect(payload.persistedUids).toEqual(['c']);
  });
});

// ─── buildRoundStartedEvent ───────────────────────────────────────────────────

describe('buildRoundStartedEvent', () => {
  it('merges deck + discard + new non-permanent cards into deckUids', () => {
    const inst = makeInstance({ uid: 'new1', cardId: 1, stateId: 10 });
    const instances = { new1: inst };
    const event = buildRoundStartedEvent(2, ['a', 'b'], ['c'], [], ['new1'], instances, defs);
    const payload = event.payload as { deckUids: string[]; permanentUids: string[] };
    expect(payload.deckUids).toHaveLength(4); // a, b, c, new1 — shuffled
    expect(payload.permanentUids).toEqual([]);
    expect((event.payload as { round: number }).round).toBe(2);
  });

  it('routes permanent cards to permanentUids', () => {
    const permDef: CardDef = {
      id: 4,
      permanent: true,
      states: [{ id: 40, name: 'Fort', tags: [] }],
      name: '',
    };
    const inst = makeInstance({ uid: 'perm1', cardId: 4, stateId: 40 });
    const localDefs = { ...defs, 4: permDef };
    const instances = { perm1: inst };
    const event = buildRoundStartedEvent(
      1,
      [],
      [],
      ['existingPerm'],
      ['perm1'],
      instances,
      localDefs,
    );
    const payload = event.payload as { permanentUids: string[]; deckUids: string[] };
    expect(payload.permanentUids).toContain('existingPerm');
    expect(payload.permanentUids).toContain('perm1');
    expect(payload.deckUids).not.toContain('perm1');
  });
});

// ─── buildTrackAdvancedEvent ──────────────────────────────────────────────────

describe('buildTrackAdvancedEvent', () => {
  const inst = makeInstance({ uid: 'track1', cardId: 3, stateId: 30, trackProgress: null });
  const instances = { track1: inst };

  it('returns null when card has no track', () => {
    const noTrackInst = makeInstance({ uid: 'x', cardId: 1, stateId: 10 });
    expect(buildTrackAdvancedEvent('x', null, 1, defs, { x: noTrackInst })).toBeNull();
  });

  it('advances from start and collects rewards', () => {
    const event = buildTrackAdvancedEvent('track1', null, 2, defs, instances);
    expect(event).not.toBeNull();
    const payload = event?.payload as {
      fromStep: number | null;
      toStep: number;
      rewards: unknown[];
    };
    expect(payload.fromStep).toBeNull();
    expect(payload.toStep).toBe(1);
    expect(payload.rewards).toHaveLength(2); // step 0 + step 1
  });

  it('advances from current progress', () => {
    const inst2 = { ...inst, trackProgress: 0 };
    const event = buildTrackAdvancedEvent('track1', 0, 1, defs, { track1: inst2 });
    const payload = event?.payload as { fromStep: number; toStep: number };
    expect(payload.fromStep).toBe(0);
    expect(payload.toStep).toBe(1);
  });

  it('returns null when already at max step', () => {
    const maxInst = { ...inst, trackProgress: 2 };
    const event = buildTrackAdvancedEvent('track1', 2, 1, defs, { track1: maxInst });
    expect(event).toBeNull();
  });

  it('caps at the last step', () => {
    const event = buildTrackAdvancedEvent('track1', null, 10, defs, instances);
    const payload = event?.payload as { toStep: number };
    expect(payload.toStep).toBe(2); // max index
  });
});
