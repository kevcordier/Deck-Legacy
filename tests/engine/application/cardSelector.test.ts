import { makeInstance, makeState, makeStickerDefs } from './fixtures';
import { cardSelector } from '@engine/application/cardSelector';
import { PassiveType, TargetScope } from '@engine/domain/enums';
import type { CardDef, Sticker } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const defA: CardDef = {
  id: 1,
  name: 'A',
  states: [{ id: 1, name: 'S1', tags: ['building' as never] }],
};
const defB: CardDef = {
  id: 2,
  name: 'B',
  states: [{ id: 1, name: 'S2', negative: true }],
};
const defC: CardDef = {
  id: 3,
  name: 'C',
  states: [{ id: 1, name: 'S3', productions: [{ gold: 1 }] }],
};

const instA = makeInstance({ id: 10, cardId: 1, stateId: 1 });
const instB = makeInstance({ id: 20, cardId: 2, stateId: 1 });
const instC = makeInstance({ id: 30, cardId: 3, stateId: 1 });

const defs: Record<number, CardDef> = { 1: defA, 2: defB, 3: defC };

const stickerDefs: Record<number, Sticker> = makeStickerDefs();

function baseState() {
  return makeState({
    board: [10, 20],
    drawPile: [30],
    discardPile: [],
    instances: { 10: instA, 20: instB, 30: instC },
  });
}

describe('cardSelector – shortcuts', () => {
  it('returns ids directly when scope is ANY and ids provided', () => {
    const gs = baseState();
    const result = cardSelector(
      { ids: [10, 20], scope: [TargetScope.ANY] },
      99,
      gs,
      defs,
      stickerDefs,
    );
    expect(result).toEqual([10, 20]);
  });

  it('returns instanceId for SELF scope', () => {
    const result = cardSelector({ scope: [TargetScope.SELF] }, 10, baseState(), defs, stickerDefs);
    expect(result).toEqual([10]);
  });

  it('returns top of deck for TOP_OF_DECK scope', () => {
    const gs = makeState({ drawPile: [30, 10], instances: { 10: instA, 30: instC } });
    const result = cardSelector({ scope: [TargetScope.TOP_OF_DECK] }, 99, gs, defs, stickerDefs);
    expect(result).toEqual([30]);
  });

  it('returns empty for TOP_OF_DECK when drawPile is empty', () => {
    const result = cardSelector(
      { scope: [TargetScope.TOP_OF_DECK] },
      99,
      makeState(),
      defs,
      stickerDefs,
    );
    expect(result).toEqual([]);
  });
});

describe('cardSelector – location scopes', () => {
  it('BOARD scope returns board cards (excluding self)', () => {
    const gs = baseState();
    const result = cardSelector({ scope: [TargetScope.BOARD] }, 10, gs, defs, stickerDefs);
    expect(result).toContain(20);
    expect(result).not.toContain(10);
  });

  it('DECK scope returns drawPile cards', () => {
    const result = cardSelector({ scope: [TargetScope.DECK] }, 99, baseState(), defs, stickerDefs);
    expect(result).toContain(30);
  });

  it('DISCARD scope returns discardPile cards', () => {
    const gs = makeState({
      discardPile: [10],
      instances: { 10: instA },
    });
    const result = cardSelector({ scope: [TargetScope.DISCARD] }, 99, gs, defs, stickerDefs);
    expect(result).toContain(10);
  });

  it('DISCOVERY scope returns discoveryPile cards', () => {
    const gs = makeState({ discoveryPile: [10], instances: { 10: instA } });
    const result = cardSelector({ scope: [TargetScope.DISCOVERY] }, 99, gs, defs, stickerDefs);
    expect(result).toContain(10);
  });

  it('PERMANENTS scope returns permanents', () => {
    const gs = makeState({ permanents: [10], instances: { 10: instA } });
    const result = cardSelector({ scope: [TargetScope.PERMANENTS] }, 99, gs, defs, stickerDefs);
    expect(result).toContain(10);
  });

  it('ANY scope includes board, drawPile, discardPile, permanents', () => {
    const gs = makeState({
      board: [10],
      drawPile: [30],
      discardPile: [20],
      permanents: [],
      instances: { 10: instA, 20: instB, 30: instC },
    });
    const result = cardSelector({ scope: [TargetScope.ANY] }, 99, gs, defs, stickerDefs);
    expect(result).toContain(10);
    expect(result).toContain(30);
    expect(result).toContain(20);
  });

  it('empty scope falls back to all instances', () => {
    const gs = makeState({
      board: [],
      drawPile: [],
      instances: { 10: instA },
    });
    const result = cardSelector({ scope: [] }, 99, gs, defs, stickerDefs);
    expect(result).toContain(10);
  });
});

describe('cardSelector – BLOCKED scope', () => {
  it('includes blocked cards when BLOCKED scope is set', () => {
    const gs = makeState({
      board: [10, 20],
      instances: { 10: instA, 20: instB },
      boardEffects: {
        10: [{ id: 'block', type: PassiveType.BLOCK, cards: { ids: [20] } }],
      },
    });
    const result = cardSelector({ scope: [TargetScope.BLOCKED] }, 99, gs, defs, stickerDefs);
    expect(result).toContain(20);
  });

  it('excludes blocked cards without BLOCKED scope', () => {
    const gs = makeState({
      board: [10, 20],
      instances: { 10: instA, 20: instB },
      boardEffects: {
        10: [{ id: 'block', type: PassiveType.BLOCK, cards: { ids: [20] } }],
      },
    });
    const result = cardSelector({ scope: [TargetScope.BOARD] }, 10, gs, defs, stickerDefs);
    expect(result).not.toContain(20);
  });
});

describe('cardSelector – alignment filters', () => {
  it('FRIENDLY scope excludes negative cards', () => {
    const gs = baseState();
    const result = cardSelector(
      { scope: [TargetScope.BOARD, TargetScope.FRIENDLY] },
      99,
      gs,
      defs,
      stickerDefs,
    );
    expect(result).toContain(10);
    expect(result).not.toContain(20);
  });

  it('ENEMY scope keeps only negative cards', () => {
    const gs = baseState();
    const result = cardSelector(
      { scope: [TargetScope.BOARD, TargetScope.ENEMY] },
      99,
      gs,
      defs,
      stickerDefs,
    );
    expect(result).not.toContain(10);
    expect(result).toContain(20);
  });
});

describe('cardSelector – tag filter', () => {
  it('filters by tags', () => {
    const gs = baseState();
    const result = cardSelector(
      { scope: [TargetScope.BOARD], tags: ['building' as never] },
      99,
      gs,
      defs,
      stickerDefs,
    );
    expect(result).toContain(10);
    expect(result).not.toContain(20);
  });

  it('requires all tags to match', () => {
    const gs = baseState();
    const result = cardSelector(
      { scope: [TargetScope.BOARD], tags: ['building' as never, 'person' as never] },
      99,
      gs,
      defs,
      stickerDefs,
    );
    expect(result).toHaveLength(0);
  });
});

describe('cardSelector – produces filter', () => {
  it('filters by produces', () => {
    const gs = makeState({
      board: [10, 30],
      instances: { 10: instA, 30: instC },
    });
    const result = cardSelector(
      { scope: [TargetScope.BOARD], produces: ['gold' as never] },
      99,
      gs,
      defs,
      stickerDefs,
    );
    expect(result).toContain(30);
    expect(result).not.toContain(10);
  });
});

describe('cardSelector – ids filter', () => {
  it('filters by specific ids within a scope', () => {
    const gs = baseState();
    const result = cardSelector(
      { scope: [TargetScope.BOARD], ids: [10] },
      99,
      gs,
      defs,
      stickerDefs,
    );
    expect(result).toEqual([10]);
  });
});

describe('cardSelector – name filter', () => {
  it('filters by state name', () => {
    const defNamed: CardDef = { id: 5, name: 'X', states: [{ id: 1, name: 'Hero' }] };
    const defOther: CardDef = { id: 6, name: 'Y', states: [{ id: 1, name: 'Villain' }] };
    const iNamed = makeInstance({ id: 50, cardId: 5, stateId: 1 });
    const iOther = makeInstance({ id: 60, cardId: 6, stateId: 1 });
    const gs = makeState({ board: [50, 60], instances: { 50: iNamed, 60: iOther } });
    const localDefs = { 5: defNamed, 6: defOther };
    const result = cardSelector(
      { scope: [TargetScope.BOARD], name: 'Hero' },
      99,
      gs,
      localDefs,
      stickerDefs,
    );
    expect(result).toContain(50);
    expect(result).not.toContain(60);
  });
});

describe('cardSelector – missing def or state', () => {
  it('excludes cards with no matching def', () => {
    const gs = makeState({ board: [99], instances: { 99: makeInstance({ id: 99, cardId: 99 }) } });
    const result = cardSelector({ scope: [TargetScope.BOARD] }, 1, gs, defs, stickerDefs);
    expect(result).not.toContain(99);
  });

  it('excludes cards with no matching state', () => {
    const gs = makeState({
      board: [10],
      instances: { 10: makeInstance({ id: 10, cardId: 1, stateId: 99 }) },
    });
    const result = cardSelector({ scope: [TargetScope.BOARD] }, 99, gs, defs, stickerDefs);
    expect(result).not.toContain(10);
  });

  it('excludes board cards with no matching instance', () => {
    const gs = makeState({ board: [99] }); // 99 in board but no instance
    const result = cardSelector({ scope: [TargetScope.BOARD] }, 1, gs, defs, stickerDefs);
    expect(result).not.toContain(99);
  });
});

describe('cardSelector – TOP_OF_DISCOVERY scope', () => {
  it('returns first card in discoveryPile', () => {
    const gs = makeState({ discoveryPile: [10, 20], instances: { 10: instA, 20: instB } });
    const result = cardSelector(
      { scope: [TargetScope.TOP_OF_DISCOVERY] },
      99,
      gs,
      defs,
      stickerDefs,
    );
    expect(result).toEqual([10]);
  });

  it('returns empty when discoveryPile is empty', () => {
    const result = cardSelector(
      { scope: [TargetScope.TOP_OF_DISCOVERY] },
      99,
      makeState(),
      defs,
      stickerDefs,
    );
    expect(result).toEqual([]);
  });
});

describe('cardSelector – having filter', () => {
  const defWithGlory: CardDef = {
    id: 7,
    name: 'G',
    states: [{ id: 1, name: 'S', glory: { amount: 3 } }],
  };
  const instG = makeInstance({ id: 70, cardId: 7, stateId: 1 });
  const localDefs = { 7: defWithGlory };

  it('includes card when glory meets minGlory', () => {
    const gs = makeState({ board: [70], instances: { 70: instG } });
    const result = cardSelector(
      { scope: [TargetScope.BOARD], having: { minGlory: 3 } },
      99,
      gs,
      localDefs,
      stickerDefs,
    );
    expect(result).toContain(70);
  });

  it('excludes card when glory is below minGlory', () => {
    const gs = makeState({ board: [70], instances: { 70: instG } });
    const result = cardSelector(
      { scope: [TargetScope.BOARD], having: { minGlory: 5 } },
      99,
      gs,
      localDefs,
      stickerDefs,
    );
    expect(result).not.toContain(70);
  });

  it('includes card when glory meets maxGlory', () => {
    const gs = makeState({ board: [70], instances: { 70: instG } });
    const result = cardSelector(
      { scope: [TargetScope.BOARD], having: { maxGlory: 5 } },
      99,
      gs,
      localDefs,
      stickerDefs,
    );
    expect(result).toContain(70);
  });

  it('excludes card when glory exceeds maxGlory', () => {
    const gs = makeState({ board: [70], instances: { 70: instG } });
    const result = cardSelector(
      { scope: [TargetScope.BOARD], having: { maxGlory: 2 } },
      99,
      gs,
      localDefs,
      stickerDefs,
    );
    expect(result).not.toContain(70);
  });
});

describe('cardSelector – DRAWN scope', () => {
  it('DRAWN scope returns lastDrawnCards', () => {
    const inst = makeInstance({ id: 5, cardId: 1, stateId: 1 });
    const gs = makeState({ lastDrawnCards: [5], instances: { 5: inst } });
    const result = cardSelector({ scope: [TargetScope.DRAWN] }, 99, gs, defs, stickerDefs);
    expect(result).toContain(5);
  });
});
