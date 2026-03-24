import { describe, it, expect } from 'vitest';
import { reducer, EMPTY_STATE, replayEvents, stateAtIndex } from '@engine/reducer';
import type { CardDef, CardInstance, GameEvent, StickerDef } from '@engine/types';

// ─── Fixtures ────────────────────────────────────────────────────────────────

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
      maxStickers: 2,
    },
  ],
};

const stayDef: CardDef = {
  id: 2,
  name: 'Castle',
  states: [{ id: 20, name: 'Castle', tags: [], stayInPlay: true }],
};

const trackDef: CardDef = {
  id: 3,
  name: 'Market',
  states: [
    {
      id: 30,
      name: 'Market',
      tags: [],
      track: {
        steps: [
          { index: 0, label: 'S0', reward: { type: 'resource', resource: 'or', amount: 2 } },
          { index: 1, label: 'S1', reward: { type: 'glory_points', amount: 3 } },
        ],
      },
    },
  ],
};

const defs: Record<number, CardDef> = { 1: simpleDef, 2: stayDef, 3: trackDef };

const stickerDefs: Record<number, StickerDef> = {
  1: {
    number: 1,
    label: 'Or',
    description: '+1 or',
    max: 10,
    effect: { type: 'resource', resource: 'or', amount: 1 },
  },
};

const makeInst = (uid: string, cardId = 1, stateId = 10): CardInstance => ({
  uid,
  cardId,
  stateId,
  stickers: [],
  blockedBy: null,
  trackProgress: null,
  tags: [],
});

const apply = (event: GameEvent, base = EMPTY_STATE) => reducer(base, event, defs, stickerDefs);

// ─── GAME_STARTED ─────────────────────────────────────────────────────────────

describe('GAME_STARTED', () => {
  const starter = makeInst('s1');
  const discovery = makeInst('d1');

  const state = apply({
    type: 'GAME_STARTED',
    payload: {
      initialInstances: [starter],
      discoveryInstances: [discovery],
      stickerStock: { 1: 5 },
    },
  });

  it('puts starter cards in deck', () => {
    expect(state.deck).toContain('s1');
  });

  it('puts discovery cards in discoveryPile', () => {
    expect(state.discoveryPile).toContain('d1');
  });

  it('registers all instances', () => {
    expect(state.instances['s1']).toBeDefined();
    expect(state.instances['d1']).toBeDefined();
  });

  it('sets stickerStock', () => {
    expect(state.stickerStock[1]).toBe(5);
  });
});

// ─── ROUND_STARTED ────────────────────────────────────────────────────────────

describe('ROUND_STARTED', () => {
  const added = makeInst('new1');
  const state = apply({
    type: 'ROUND_STARTED',
    payload: { round: 2, addedCards: [added], permanentUids: ['p1'], deckUids: ['a', 'b', 'new1'] },
  });

  it('sets round', () => expect(state.round).toBe(2));
  it('resets discard', () => expect(state.discard).toEqual([]));
  it('resets tableau', () => expect(state.tableau).toEqual([]));
  it('sets deck', () => expect(state.deck).toEqual(['a', 'b', 'new1']));
  it('sets permanents', () => expect(state.permanents).toEqual(['p1']));
  it('registers added instances', () => expect(state.instances['new1']).toBeDefined());
});

// ─── ROUND_ENDED ─────────────────────────────────────────────────────────────

describe('ROUND_ENDED', () => {
  const base = {
    ...EMPTY_STATE,
    tableau: ['a', 'b'],
    discard: ['c'],
    instances: { a: makeInst('a'), b: makeInst('b'), c: makeInst('c') },
  };
  const state = apply({ type: 'ROUND_ENDED', payload: { round: 1 } }, base);

  it('moves tableau into discard', () => {
    expect(state.discard).toContain('a');
    expect(state.discard).toContain('b');
    expect(state.discard).toContain('c');
  });

  it('clears tableau', () => expect(state.tableau).toEqual([]));
});

// ─── TURN_STARTED ─────────────────────────────────────────────────────────────

describe('TURN_STARTED', () => {
  const base = { ...EMPTY_STATE, deck: ['c', 'd'], tableau: ['a'] };
  const state = apply(
    { type: 'TURN_STARTED', payload: { turn: 3, drawnUids: ['c', 'd'], remainingDeck: [] } },
    base,
  );

  it('sets turn', () => expect(state.turn).toBe(3));
  it('adds drawn cards to tableau', () => {
    expect(state.tableau).toContain('a');
    expect(state.tableau).toContain('c');
    expect(state.tableau).toContain('d');
  });
  it('updates remaining deck', () => expect(state.deck).toEqual([]));
  it('resets resources', () => expect(state.resources).toEqual({}));
});

// ─── TURN_ENDED ───────────────────────────────────────────────────────────────

describe('TURN_ENDED', () => {
  const base = {
    ...EMPTY_STATE,
    tableau: ['a', 'b'],
    instances: { a: makeInst('a'), b: makeInst('b') },
  };
  const state = apply(
    {
      type: 'TURN_ENDED',
      payload: { reason: 'voluntary', discardedUids: ['a'], persistedUids: ['b'] },
    },
    base,
  );

  it('moves discardedUids to discard', () => expect(state.discard).toContain('a'));
  it('keeps persistedUids in tableau', () => expect(state.tableau).toEqual(['b']));
  it('clears resources', () => expect(state.resources).toEqual({}));
});

// ─── CARD_ACTIVATED ───────────────────────────────────────────────────────────

describe('CARD_ACTIVATED', () => {
  it('adds gained resources', () => {
    const base = { ...EMPTY_STATE, tableau: ['a'], instances: { a: makeInst('a') } };
    const state = apply(
      { type: 'CARD_ACTIVATED', payload: { cardUid: 'a', resourcesGained: { or: 2 } } },
      base,
    );
    expect(state.resources.or).toBe(2);
    expect(state.activated).toContain('a');
  });

  it('adds sticker resource bonuses', () => {
    const instWithSticker = {
      ...makeInst('a'),
      stickers: [
        { stickerNumber: 1, effect: { type: 'resource' as const, resource: 'or', amount: 1 } },
      ],
    };
    const base = { ...EMPTY_STATE, tableau: ['a'], instances: { a: instWithSticker } };
    const state = apply(
      { type: 'CARD_ACTIVATED', payload: { cardUid: 'a', resourcesGained: { or: 1 } } },
      base,
    );
    expect(state.resources.or).toBe(2); // 1 base + 1 sticker
  });

  it('moves non-permanent card to discard when discardedUid provided', () => {
    const base = { ...EMPTY_STATE, tableau: ['a'], instances: { a: makeInst('a') } };
    const state = apply(
      { type: 'CARD_ACTIVATED', payload: { cardUid: 'a', resourcesGained: {}, discardedUid: 'a' } },
      base,
    );
    expect(state.tableau).not.toContain('a');
    expect(state.discard).toContain('a');
  });

  it('does not discard permanent card', () => {
    const base = {
      ...EMPTY_STATE,
      permanents: ['a'],
      tableau: [],
      instances: { a: makeInst('a') },
    };
    const state = apply(
      { type: 'CARD_ACTIVATED', payload: { cardUid: 'a', resourcesGained: {}, discardedUid: 'a' } },
      base,
    );
    expect(state.permanents).toContain('a');
    expect(state.discard).not.toContain('a');
  });
});

// ─── CARD_BLOCKED / CARD_UNBLOCKED ───────────────────────────────────────────

describe('CARD_BLOCKED', () => {
  it('sets blockedBy on target', () => {
    const base = { ...EMPTY_STATE, instances: { a: makeInst('a'), b: makeInst('b') } };
    const state = apply(
      { type: 'CARD_BLOCKED', payload: { blockerUid: 'a', targetUid: 'b' } },
      base,
    );
    expect(state.instances['b'].blockedBy).toBe('a');
  });
});

describe('CARD_UNBLOCKED', () => {
  it('clears blockedBy on target', () => {
    const blockedInst = { ...makeInst('b'), blockedBy: 'a' };
    const base = { ...EMPTY_STATE, instances: { a: makeInst('a'), b: blockedInst } };
    const state = apply(
      { type: 'CARD_UNBLOCKED', payload: { blockerUid: 'a', targetUid: 'b' } },
      base,
    );
    expect(state.instances['b'].blockedBy).toBeNull();
  });
});

// ─── CARD_DESTROYED ───────────────────────────────────────────────────────────

describe('CARD_DESTROYED', () => {
  it('removes instance and removes from its zone', () => {
    const base = { ...EMPTY_STATE, deck: ['a'], instances: { a: makeInst('a') } };
    const state = apply(
      { type: 'CARD_DESTROYED', payload: { cardUid: 'a', fromZone: 'deck' } },
      base,
    );
    expect(state.instances['a']).toBeUndefined();
    expect(state.deck).not.toContain('a');
  });

  it('removes from discard zone', () => {
    const base = { ...EMPTY_STATE, discard: ['a'], instances: { a: makeInst('a') } };
    const state = apply(
      { type: 'CARD_DESTROYED', payload: { cardUid: 'a', fromZone: 'discard' } },
      base,
    );
    expect(state.discard).not.toContain('a');
  });
});

// ─── CARD_DISCOVERED ──────────────────────────────────────────────────────────

describe('CARD_DISCOVERED', () => {
  const inst = makeInst('new');

  it('adds to permanents', () => {
    const state = apply({
      type: 'CARD_DISCOVERED',
      payload: { instance: inst, addedTo: 'permanents' },
    });
    expect(state.permanents).toContain('new');
    expect(state.instances['new']).toBeDefined();
  });

  it('adds to deck top', () => {
    const base = { ...EMPTY_STATE, deck: ['existing'] };
    const state = apply(
      { type: 'CARD_DISCOVERED', payload: { instance: inst, addedTo: 'deck_top' } },
      base,
    );
    expect(state.deck[0]).toBe('new');
  });

  it('adds to deck bottom', () => {
    const base = { ...EMPTY_STATE, deck: ['existing'] };
    const state = apply(
      { type: 'CARD_DISCOVERED', payload: { instance: inst, addedTo: 'deck_bottom' } },
      base,
    );
    expect(state.deck[state.deck.length - 1]).toBe('new');
  });
});

// ─── STICKER_ADDED ───────────────────────────────────────────────────────────

describe('STICKER_ADDED', () => {
  const base = {
    ...EMPTY_STATE,
    tableau: ['a'],
    instances: { a: makeInst('a') }, // maxStickers: 2 via simpleDef
    stickerStock: { 1: 3 },
  };

  it('adds sticker to instance', () => {
    const state = apply(
      {
        type: 'STICKER_ADDED',
        payload: {
          cardUid: 'a',
          sticker: { stickerNumber: 1, effect: { type: 'resource', resource: 'or', amount: 1 } },
        },
      },
      base,
    );
    expect(state.instances['a'].stickers).toHaveLength(1);
  });

  it('decrements stickerStock', () => {
    const state = apply(
      {
        type: 'STICKER_ADDED',
        payload: {
          cardUid: 'a',
          sticker: { stickerNumber: 1, effect: { type: 'resource', resource: 'or', amount: 1 } },
        },
      },
      base,
    );
    expect(state.stickerStock[1]).toBe(2);
  });

  it('does not add when maxStickers reached', () => {
    const fullInst = {
      ...makeInst('a'),
      stickers: [
        { stickerNumber: 1, effect: { type: 'resource' as const, resource: 'or', amount: 1 } },
        { stickerNumber: 1, effect: { type: 'resource' as const, resource: 'or', amount: 1 } },
      ],
    };
    const fullBase = { ...base, instances: { a: fullInst } };
    const state = apply(
      {
        type: 'STICKER_ADDED',
        payload: {
          cardUid: 'a',
          sticker: { stickerNumber: 1, effect: { type: 'resource', resource: 'or', amount: 1 } },
        },
      },
      fullBase,
    );
    expect(state.instances['a'].stickers).toHaveLength(2);
  });

  it('does not add when stock is 0', () => {
    const emptyStock = { ...base, stickerStock: {} };
    const state = apply(
      {
        type: 'STICKER_ADDED',
        payload: {
          cardUid: 'a',
          sticker: { stickerNumber: 1, effect: { type: 'resource', resource: 'or', amount: 1 } },
        },
      },
      emptyStock,
    );
    expect(state.instances['a'].stickers).toHaveLength(0);
  });
});

// ─── TRACK_ADVANCED ───────────────────────────────────────────────────────────

describe('TRACK_ADVANCED', () => {
  const inst = makeInst('t1', 3, 30);

  it('updates trackProgress', () => {
    const base = { ...EMPTY_STATE, tableau: ['t1'], instances: { t1: inst } };
    const state = apply(
      {
        type: 'TRACK_ADVANCED',
        payload: {
          cardUid: 't1',
          fromStep: null,
          toStep: 0,
          stepsAdvanced: 1,
          rewards: [{ type: 'resource', resource: 'or', amount: 2 }],
        },
      },
      base,
    );
    expect(state.instances['t1'].trackProgress).toBe(0);
    expect(state.resources.or).toBe(2);
  });

  it('applies glory_points reward as sticker', () => {
    const base = { ...EMPTY_STATE, tableau: ['t1'], instances: { t1: inst } };
    const state = apply(
      {
        type: 'TRACK_ADVANCED',
        payload: {
          cardUid: 't1',
          fromStep: null,
          toStep: 1,
          stepsAdvanced: 2,
          rewards: [{ type: 'glory_points', amount: 3 }],
        },
      },
      base,
    );
    expect(state.instances['t1'].stickers.some(v => v.effect.type === 'glory_points')).toBe(true);
  });
});

// ─── PROGRESSED ───────────────────────────────────────────────────────────────

describe('PROGRESSED', () => {
  it('adds drawn cards to tableau and updates remaining deck', () => {
    const base = { ...EMPTY_STATE, deck: ['a', 'b', 'c'], tableau: ['x'] };
    const state = apply(
      { type: 'PROGRESSED', payload: { drawnUids: ['a', 'b'], remainingDeck: ['c'] } },
      base,
    );
    expect(state.tableau).toContain('x');
    expect(state.tableau).toContain('a');
    expect(state.tableau).toContain('b');
    expect(state.deck).toEqual(['c']);
  });
});

// ─── CARD_STATE_CHOSEN ────────────────────────────────────────────────────────

describe('CARD_STATE_CHOSEN', () => {
  const inst = makeInst('new');

  it('adds to permanents with chosen stateId', () => {
    const state = apply({
      type: 'CARD_STATE_CHOSEN',
      payload: { instance: inst, chosenStateId: 10, addedTo: 'permanents' },
    });
    expect(state.permanents).toContain('new');
    expect(state.instances['new'].stateId).toBe(10);
  });

  it('adds to deck top', () => {
    const base = { ...EMPTY_STATE, deck: ['existing'] };
    const state = apply(
      {
        type: 'CARD_STATE_CHOSEN',
        payload: { instance: inst, chosenStateId: 10, addedTo: 'deck_top' },
      },
      base,
    );
    expect(state.deck[0]).toBe('new');
  });

  it('adds to deck bottom', () => {
    const base = { ...EMPTY_STATE, deck: ['existing'] };
    const state = apply(
      {
        type: 'CARD_STATE_CHOSEN',
        payload: { instance: inst, chosenStateId: 10, addedTo: 'deck_bottom' },
      },
      base,
    );
    expect(state.deck[state.deck.length - 1]).toBe('new');
  });
});

// ─── ON_PLAY_TRIGGERED ────────────────────────────────────────────────────────

describe('ON_PLAY_TRIGGERED', () => {
  it('returns state unchanged', () => {
    const base = { ...EMPTY_STATE, round: 2, turn: 3 };
    const state = apply(
      { type: 'ON_PLAY_TRIGGERED', payload: { cardUid: 'a', actionLabel: 'test' } },
      base,
    );
    expect(state.round).toBe(2);
    expect(state.turn).toBe(3);
  });
});

// ─── CARD_ADDED_TO_DECK ───────────────────────────────────────────────────────

describe('CARD_ADDED_TO_DECK', () => {
  const newInst = makeInst('new');

  it('inserts card at top of deck', () => {
    const base = { ...EMPTY_STATE, deck: ['a', 'b'] };
    const state = apply(
      { type: 'CARD_ADDED_TO_DECK', payload: { instance: newInst, position: 'top' } },
      base,
    );
    expect(state.deck[0]).toBe('new');
    expect(state.instances['new']).toBeDefined();
  });

  it('inserts card at bottom of deck', () => {
    const base = { ...EMPTY_STATE, deck: ['a', 'b'] };
    const state = apply(
      { type: 'CARD_ADDED_TO_DECK', payload: { instance: newInst, position: 'bottom' } },
      base,
    );
    expect(state.deck[state.deck.length - 1]).toBe('new');
  });

  it('returns state unchanged when deck is empty', () => {
    const base = { ...EMPTY_STATE, deck: [] };
    const state = apply(
      { type: 'CARD_ADDED_TO_DECK', payload: { instance: newInst, position: 'top' } },
      base,
    );
    expect(state.deck).toEqual([]);
    expect(state.instances['new']).toBeUndefined();
  });
});

// ─── UPGRADE_CARD_EFFECT ──────────────────────────────────────────────────────

describe('UPGRADE_CARD_EFFECT', () => {
  it('updates stateId and clears trackProgress', () => {
    const inst = { ...makeInst('a'), trackProgress: 1 };
    const base = { ...EMPTY_STATE, tableau: ['a'], instances: { a: inst } };
    const state = apply(
      { type: 'UPGRADE_CARD_EFFECT', payload: { cardUid: 'a', toStateId: 11 } },
      base,
    );
    expect(state.instances['a'].stateId).toBe(11);
    expect(state.instances['a'].trackProgress).toBeNull();
  });

  it('returns state unchanged when card uid is not found', () => {
    const base = { ...EMPTY_STATE };
    const state = apply(
      { type: 'UPGRADE_CARD_EFFECT', payload: { cardUid: 'missing', toStateId: 11 } },
      base,
    );
    expect(state.instances).toEqual({});
  });
});

// ─── CARD_PLAYED_FROM_DISCARD ─────────────────────────────────────────────────

describe('CARD_PLAYED_FROM_DISCARD', () => {
  it('moves card from discard to tableau', () => {
    const base = { ...EMPTY_STATE, discard: ['a'], tableau: [], instances: { a: makeInst('a') } };
    const state = apply({ type: 'CARD_PLAYED_FROM_DISCARD', payload: { cardUid: 'a' } }, base);
    expect(state.discard).not.toContain('a');
    expect(state.tableau).toContain('a');
  });
});

// ─── ACTION_RESOLVED ──────────────────────────────────────────────────────────

describe('ACTION_RESOLVED', () => {
  it('spends cost and adds resources gained', () => {
    const base = {
      ...EMPTY_STATE,
      resources: { or: 5 },
      tableau: ['a'],
      instances: { a: makeInst('a') },
    };
    const state = apply(
      {
        type: 'ACTION_RESOLVED',
        payload: {
          activatedUids: [],
          actionCardUid: 'a',
          actionId: 'testAction',
          cost: { resources: [{ or: 2 }] },
          discardedUids: [],
          endsTurn: false,
          resourcesGained: { bois: 1 },
        },
      },
      base,
    );
    expect(state.resources.or).toBe(3);
    expect(state.resources.bois).toBe(1);
  });

  it('discards the action card and activated cards', () => {
    const base = {
      ...EMPTY_STATE,
      resources: { or: 2 },
      tableau: ['a', 'b'],
      instances: { a: makeInst('a'), b: makeInst('b') },
    };
    const state = apply(
      {
        type: 'ACTION_RESOLVED',
        payload: {
          activatedUids: ['b'],
          actionCardUid: 'a',
          actionId: 'testAction',
          cost: {},
          discardedUids: ['a', 'b'],
          endsTurn: false,
          resourcesGained: {},
        },
      },
      base,
    );
    expect(state.tableau).not.toContain('a');
    expect(state.tableau).not.toContain('b');
    expect(state.discard).toContain('a');
    expect(state.discard).toContain('b');
  });
});

// ─── UPGRADE_RESOLVED ────────────────────────────────────────────────────────

describe('UPGRADE_RESOLVED', () => {
  it('updates stateId on the upgraded card', () => {
    const inst = makeInst('a', 1, 10);
    const base = { ...EMPTY_STATE, tableau: ['a'], instances: { a: inst }, resources: { or: 3 } };
    const state = apply(
      {
        type: 'UPGRADE_RESOLVED',
        payload: {
          activatedUids: [],
          cardUid: 'a',
          fromStateId: 10,
          toStateId: 11,
          cost: { resources: [{ or: 2 }] },
          discardedUids: [],
        },
      },
      base,
    );
    expect(state.instances['a'].stateId).toBe(11);
    expect(state.instances['a'].trackProgress).toBeNull();
    expect(state.resources.or).toBe(1);
  });
});

// ─── CHOICE_MADE ─────────────────────────────────────────────────────────────

describe('CHOICE_MADE', () => {
  it('clears pendingChoice', () => {
    const base = {
      ...EMPTY_STATE,
      pendingChoice: {
        kind: 'discover_card' as const,
        actionCardUid: 'x',
        actionLabel: 'test',
        candidates: [1],
        pickCount: 1,
      },
    };
    const state = apply(
      {
        type: 'CHOICE_MADE',
        payload: { kind: 'discover_card', actionCardUid: 'x', chosenCardIds: [1] },
      },
      base,
    );
    expect(state.pendingChoice).toBeNull();
  });
});

// ─── replayEvents ─────────────────────────────────────────────────────────────

describe('replayEvents', () => {
  it('returns EMPTY_STATE for empty event list', () => {
    expect(replayEvents([], defs, stickerDefs)).toEqual(EMPTY_STATE);
  });

  it('replays a sequence correctly', () => {
    const inst = makeInst('a');
    const events: GameEvent[] = [
      {
        type: 'GAME_STARTED',
        payload: { initialInstances: [inst], discoveryInstances: [], stickerStock: {} },
      },
      {
        type: 'ROUND_STARTED',
        payload: { round: 1, addedCards: [], permanentUids: [], deckUids: ['a'] },
      },
      { type: 'TURN_STARTED', payload: { turn: 1, drawnUids: ['a'], remainingDeck: [] } },
    ];
    const state = replayEvents(events, defs, stickerDefs);
    expect(state.round).toBe(1);
    expect(state.turn).toBe(1);
    expect(state.tableau).toContain('a');
  });
});

// ─── stateAtIndex ─────────────────────────────────────────────────────────────

describe('stateAtIndex', () => {
  const inst = makeInst('a');
  const events: GameEvent[] = [
    {
      type: 'GAME_STARTED',
      payload: { initialInstances: [inst], discoveryInstances: [], stickerStock: {} },
    },
    {
      type: 'ROUND_STARTED',
      payload: { round: 1, addedCards: [], permanentUids: [], deckUids: ['a'] },
    },
    { type: 'TURN_STARTED', payload: { turn: 1, drawnUids: ['a'], remainingDeck: [] } },
  ];

  it('returns state after first event only', () => {
    const state = stateAtIndex(events, 0, defs, stickerDefs);
    expect(state.deck).toContain('a');
    expect(state.round).toBe(0); // ROUND_STARTED not yet applied
  });

  it('returns final state at last index', () => {
    const state = stateAtIndex(events, 2, defs, stickerDefs);
    expect(state.turn).toBe(1);
    expect(state.tableau).toContain('a');
  });
});
