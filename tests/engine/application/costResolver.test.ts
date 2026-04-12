import { makeDef, makeGameState, makeInstance } from './testHelpers';
import { resolveCost } from '@engine/application/costResolver';
import { PendingChoiceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

// — no cost —

describe('resolveCost — empty cost', () => {
  it('returns empty resolved cost with no pending choices', () => {
    const gs = makeGameState();
    const [resolved, pending] = resolveCost({}, 1, gs, {});
    expect(resolved.resources).toEqual({});
    expect(resolved.discardedCardIds).toEqual([]);
    expect(resolved.destroyedCardIds).toEqual([]);
    expect(pending).toEqual([]);
  });
});

// — resource cost —

describe('resolveCost — resources', () => {
  it('resolves single resource option directly', () => {
    const gs = makeGameState();
    const [resolved, pending] = resolveCost({ resources: [{ gold: 2 }] }, 1, gs, {});
    expect(resolved.resources).toEqual({ gold: 2 });
    expect(pending).toEqual([]);
  });

  it('creates a pending choice when multiple resource options exist', () => {
    const gs = makeGameState();
    const [resolved, pending] = resolveCost({ resources: [{ gold: 2 }, { wood: 3 }] }, 1, gs, {});
    expect(resolved.resources).toEqual({});
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe(PendingChoiceType.CHOOSE_RESOURCE);
    expect(pending[0].id).toBe('1-cost');
    expect(pending[0].choices).toEqual([{ gold: 2 }, { wood: 3 }]);
  });
});

// — discard cost —

describe('resolveCost — discard', () => {
  it('uses pickCount of 1 when number is omitted', () => {
    const gs = makeGameState({
      board: [2, 3],
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 10, 1),
        3: makeInstance(3, 10, 1),
      },
    });
    const defs: Record<number, CardDef> = { 10: makeDef(10) };
    const [, pending] = resolveCost(
      { discard: { scope: TargetScope.BOARD } }, // no number specified
      1,
      gs,
      defs,
    );
    expect(pending[0].pickCount).toBe(1);
  });

  it('resolves directly when only one candidate matches', () => {
    const gs = makeGameState({
      board: [2, 3],
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 10, 1),
        3: makeInstance(3, 10, 1),
      },
    });
    const defs: Record<number, CardDef> = { 10: makeDef(10) };
    const [resolved, pending] = resolveCost(
      { discard: { scope: TargetScope.BOARD, number: 1 } },
      1,
      gs,
      defs,
    );
    // Both 2 and 3 are on the board, so we need a pending choice (2 candidates for 1 slot)
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe(PendingChoiceType.CHOOSE_CARD);
    expect(pending[0].id).toBe('1-discard');
    expect(resolved.discardedCardIds).toEqual([]);
  });

  it('auto-resolves when candidates count matches required number', () => {
    const gs = makeGameState({
      board: [2],
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 10, 1),
      },
    });
    const defs: Record<number, CardDef> = { 10: makeDef(10) };
    const [resolved, pending] = resolveCost(
      { discard: { scope: TargetScope.BOARD, number: 1 } },
      1,
      gs,
      defs,
    );
    expect(resolved.discardedCardIds).toEqual([2]);
    expect(pending).toEqual([]);
  });

  it('sets empty discardedCardIds when no candidates', () => {
    const gs = makeGameState({
      board: [],
      instances: { 1: makeInstance(1, 10, 1) },
    });
    const defs: Record<number, CardDef> = { 10: makeDef(10) };
    const [resolved, pending] = resolveCost(
      { discard: { scope: TargetScope.BOARD, number: 1 } },
      1,
      gs,
      defs,
    );
    expect(resolved.discardedCardIds).toEqual([]);
    expect(pending).toEqual([]);
  });
});

// — destroy cost —

describe('resolveCost — destroy', () => {
  it('creates pending choice when multiple candidates exist', () => {
    const gs = makeGameState({
      board: [1, 2, 3],
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 10, 1),
        3: makeInstance(3, 10, 1),
      },
    });
    const defs: Record<number, CardDef> = { 10: makeDef(10) };
    const [resolved, pending] = resolveCost(
      { destroy: { scope: TargetScope.BOARD, number: 1 } },
      1,
      gs,
      defs,
    );
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe(PendingChoiceType.CHOOSE_CARD);
    expect(pending[0].id).toBe('1-destroy');
    expect(resolved.destroyedCardIds).toEqual([]);
  });

  it('uses pickCount of 1 when number is omitted for destroy', () => {
    const gs = makeGameState({
      board: [1, 2, 3],
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 10, 1),
        3: makeInstance(3, 10, 1),
      },
    });
    const defs: Record<number, CardDef> = { 10: makeDef(10) };
    const [, pending] = resolveCost(
      { destroy: { scope: TargetScope.BOARD } }, // no number specified
      1,
      gs,
      defs,
    );
    expect(pending[0].pickCount).toBe(1);
  });

  it('auto-resolves when candidates count exactly matches required number', () => {
    const gs = makeGameState({
      board: [1, 2, 3],
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 10, 1),
        3: makeInstance(3, 10, 1),
      },
    });
    const defs: Record<number, CardDef> = { 10: makeDef(10) };
    const [resolved, pending] = resolveCost(
      { destroy: { scope: TargetScope.BOARD, number: 2 } },
      1, // instanceId 1 is excluded, leaving [2, 3] — exactly 2
      gs,
      defs,
    );
    expect(resolved.destroyedCardIds).toEqual([2, 3]);
    expect(pending).toEqual([]);
  });

  it('sets empty destroyedCardIds when no other cards on board', () => {
    const gs = makeGameState({
      board: [1],
      instances: { 1: makeInstance(1, 10, 1) },
    });
    const defs: Record<number, CardDef> = { 10: makeDef(10) };
    const [resolved, pending] = resolveCost(
      { destroy: { scope: TargetScope.BOARD, number: 1 } },
      1,
      gs,
      defs,
    );
    expect(resolved.destroyedCardIds).toEqual([]);
    expect(pending).toEqual([]);
  });
});
