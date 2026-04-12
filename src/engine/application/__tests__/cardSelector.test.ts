import { cardSelector } from '@engine/application/cardSelector';
import { CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef, CardInstance, GameState } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

// — fixtures —

const makeInstance = (id: number, cardId: number, stateId: number): CardInstance => ({
  id,
  cardId,
  stateId,
  stickers: {},
  trackProgress: [],
});

const makeState = (id: number, overrides: Partial<CardDef['states'][number]> = {}) => ({
  id,
  name: `State ${id}`,
  ...overrides,
});

const makeDef = (id: number, states: CardDef['states']): CardDef => ({
  id,
  name: `Card ${id}`,
  states,
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

// — SELF scope —

describe('cardSelector — SELF', () => {
  it('returns the instance id of the caller', () => {
    const gs = makeGameState({ instances: { 5: makeInstance(5, 10, 1) } });
    const result = cardSelector({ scope: TargetScope.SELF }, 5, gs);
    expect(result).toEqual([5]);
  });
});

// — TOP_OF_DECK scope —

describe('cardSelector — TOP_OF_DECK', () => {
  it('returns the top card of the draw pile', () => {
    const gs = makeGameState({
      drawPile: [1, 2, 3],
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 11, 1),
        3: makeInstance(3, 12, 1),
      },
    });
    const result = cardSelector({ scope: TargetScope.TOP_OF_DECK }, 99, gs);
    expect(result).toEqual([3]); // last element = top
  });

  it('returns empty array when draw pile is empty', () => {
    const gs = makeGameState({ drawPile: [], instances: {} });
    const result = cardSelector({ scope: TargetScope.TOP_OF_DECK }, 99, gs);
    expect(result).toEqual([]);
  });
});

// — DECK scope —

describe('cardSelector — DECK', () => {
  it('returns all cards in the draw pile (excluding self)', () => {
    const gs = makeGameState({
      drawPile: [1, 2, 3],
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 11, 1),
        3: makeInstance(3, 12, 1),
      },
    });
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [makeState(1)]),
      11: makeDef(11, [makeState(1)]),
      12: makeDef(12, [makeState(1)]),
    };
    const result = cardSelector({ scope: TargetScope.DECK }, 1, gs, defs);
    expect(result).toEqual([2, 3]);
  });
});

// — BOARD scope —

describe('cardSelector — BOARD', () => {
  it('returns all board cards excluding self', () => {
    const gs = makeGameState({
      board: [1, 2, 3],
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 11, 1),
        3: makeInstance(3, 12, 1),
      },
    });
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [makeState(1)]),
      11: makeDef(11, [makeState(1)]),
      12: makeDef(12, [makeState(1)]),
    };
    const result = cardSelector({ scope: TargetScope.BOARD }, 1, gs, defs);
    expect(result).toEqual([2, 3]);
  });
});

// — DISCARD scope —

describe('cardSelector — DISCARD', () => {
  it('returns all cards in the discard pile', () => {
    const gs = makeGameState({
      discardPile: [4, 5],
      instances: {
        4: makeInstance(4, 10, 1),
        5: makeInstance(5, 11, 1),
      },
    });
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [makeState(1)]),
      11: makeDef(11, [makeState(1)]),
    };
    const result = cardSelector({ scope: TargetScope.DISCARD }, 99, gs, defs);
    expect(result).toEqual([4, 5]);
  });
});

// — BLOCKED scope —

describe('cardSelector — BLOCKED', () => {
  it('returns all values of blockingCards', () => {
    const gs = makeGameState({
      blockingCards: { 1: 2, 3: 4 },
      instances: {
        2: makeInstance(2, 10, 1),
        4: makeInstance(4, 11, 1),
      },
    });
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [makeState(1)]),
      11: makeDef(11, [makeState(1)]),
    };
    const result = cardSelector({ scope: TargetScope.BLOCKED }, 99, gs, defs);
    expect(result).toContain(2);
    expect(result).toContain(4);
  });
});

// — tag filtering —

describe('cardSelector — tag filtering', () => {
  it('returns only cards with the specified tag', () => {
    const gs = makeGameState({
      board: [1, 2],
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 11, 1),
      },
    });
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [makeState(1, { tags: [CardTag.BUILDING] })]),
      11: makeDef(11, [makeState(1, { tags: [CardTag.SEAFARING] })]),
    };
    const result = cardSelector(
      { scope: TargetScope.BOARD, tags: [CardTag.BUILDING] },
      99,
      gs,
      defs,
    );
    expect(result).toEqual([1]);
  });
});

// — produces filtering —

describe('cardSelector — produces filtering', () => {
  it('returns only cards that produce the specified resource', () => {
    const gs = makeGameState({
      board: [1, 2],
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 11, 1),
      },
    });
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [makeState(1, { productions: [{ gold: 2 }] })]),
      11: makeDef(11, [makeState(1, { productions: [{ wood: 1 }] })]),
    };
    const result = cardSelector(
      { scope: TargetScope.BOARD, produces: [ResourceType.GOLD] },
      99,
      gs,
      defs,
    );
    expect(result).toEqual([1]);
  });
});

// — ids filtering —

describe('cardSelector — ids filtering', () => {
  it('returns only cards whose ids are in the list', () => {
    const gs = makeGameState({
      board: [1, 2, 3],
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 11, 1),
        3: makeInstance(3, 12, 1),
      },
    });
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [makeState(1)]),
      11: makeDef(11, [makeState(1)]),
      12: makeDef(12, [makeState(1)]),
    };
    const result = cardSelector({ scope: TargetScope.BOARD, ids: [2, 3] }, 99, gs, defs);
    expect(result).toEqual([2, 3]);
  });
});

// — missing instance fallback —

describe('cardSelector — missing instance in pool', () => {
  it('excludes pool entries that have no matching instance', () => {
    const gs = makeGameState({
      board: [1, 999], // 999 has no instance
      instances: { 1: makeInstance(1, 10, 1) },
    });
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [makeState(1)]),
    };
    const result = cardSelector({ scope: TargetScope.BOARD }, 99, gs, defs);
    expect(result).toEqual([1]);
    expect(result).not.toContain(999);
  });
});

// — PERMANENTS scope —

describe('cardSelector — PERMANENTS', () => {
  it('returns all cards in the permanents pile', () => {
    const gs = makeGameState({
      permanents: [7, 8],
      instances: {
        7: makeInstance(7, 10, 1),
        8: makeInstance(8, 11, 1),
      },
    });
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [makeState(1)]),
      11: makeDef(11, [makeState(1)]),
    };
    const result = cardSelector({ scope: TargetScope.PERMANENTS }, 99, gs, defs);
    expect(result).toContain(7);
    expect(result).toContain(8);
  });
});

// — ANY scope —

describe('cardSelector — ANY', () => {
  it('returns cards from drawPile, board, discardPile and permanents', () => {
    const gs = makeGameState({
      drawPile: [1],
      board: [2],
      discardPile: [3],
      permanents: [4],
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 10, 1),
        3: makeInstance(3, 10, 1),
        4: makeInstance(4, 10, 1),
      },
    });
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [makeState(1)]),
    };
    const result = cardSelector({ scope: TargetScope.ANY }, 99, gs, defs);
    expect(result).toContain(1);
    expect(result).toContain(2);
    expect(result).toContain(3);
    expect(result).toContain(4);
  });
});

// — blocked card exclusion —

describe('cardSelector — blocked card exclusion', () => {
  it('excludes blocked cards from non-BLOCKED scope results', () => {
    const gs = makeGameState({
      board: [1, 2, 3],
      blockingCards: { 99: 2 }, // card 2 is blocked by 99
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 10, 1),
        3: makeInstance(3, 10, 1),
      },
    });
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [makeState(1)]),
    };
    const result = cardSelector({ scope: TargetScope.BOARD }, 99, gs, defs);
    expect(result).not.toContain(2);
    expect(result).toContain(1);
    expect(result).toContain(3);
  });
});

// — FRIENDLY / ENEMY scope —

describe('cardSelector — FRIENDLY / ENEMY', () => {
  it('FRIENDLY excludes negative cards', () => {
    const gs = makeGameState({
      board: [1, 2],
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 11, 1),
      },
    });
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [makeState(1, { negative: false })]),
      11: makeDef(11, [makeState(1, { negative: true })]),
    };
    const result = cardSelector({ scope: TargetScope.FRIENDLY }, 99, gs, defs);
    expect(result).toContain(1);
    expect(result).not.toContain(2);
  });

  it('ENEMY returns only negative cards', () => {
    const gs = makeGameState({
      board: [1, 2],
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 11, 1),
      },
    });
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [makeState(1, { negative: false })]),
      11: makeDef(11, [makeState(1, { negative: true })]),
    };
    const result = cardSelector({ scope: TargetScope.ENEMY }, 99, gs, defs);
    expect(result).toEqual([2]);
  });
});
