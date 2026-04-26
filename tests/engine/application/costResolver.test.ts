import { makeInstance, makeState } from './fixtures';
import { resolveCost } from '@engine/application/costResolver';
import { TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const defs: Record<number, CardDef> = {
  1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
};

describe('resolveCost – resources', () => {
  it('returns empty resolved cost for empty cost', () => {
    const [resolved, pending] = resolveCost({}, 1, makeState(), defs);
    expect(resolved).toEqual({ resources: {}, discardedCardIds: [], destroyedCardIds: [] });
    expect(pending).toHaveLength(0);
  });

  it('resolves single resource cost directly', () => {
    const [resolved, pending] = resolveCost({ resources: [{ gold: 2 }] }, 1, makeState(), defs);
    expect(resolved.resources).toEqual({ gold: 2 });
    expect(pending).toHaveLength(0);
  });

  it('creates pending choice for multiple resource options', () => {
    const [resolved, pending] = resolveCost(
      { resources: [{ gold: 1 }, { wood: 1 }] },
      5,
      makeState(),
      defs,
    );
    expect(resolved.resources).toEqual({});
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('choose_resource');
    expect(pending[0].sourceInstanceId).toBe(5);
  });

  it('passes isMandatory to pending choice', () => {
    const [, pending] = resolveCost(
      { resources: [{ gold: 1 }, { wood: 1 }] },
      5,
      makeState(),
      defs,
      true,
    );
    expect(pending[0].isMandatory).toBe(true);
  });
});

describe('resolveCost – discard', () => {
  it('resolves empty discardedCardIds when no candidates on board', () => {
    const gs = makeState({ board: [] });
    const [resolved, pending] = resolveCost(
      { discard: { scope: [TargetScope.BOARD] } },
      1,
      gs,
      defs,
    );
    expect(resolved.discardedCardIds).toEqual([]);
    expect(pending).toHaveLength(0);
  });

  it('resolves discard directly when exactly one candidate matches', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst } });
    const [resolved, pending] = resolveCost(
      { discard: { scope: [TargetScope.BOARD], number: 1 } },
      99,
      gs,
      defs,
    );
    expect(resolved.discardedCardIds).toEqual([2]);
    expect(pending).toHaveLength(0);
  });

  it('creates pending choice when more candidates than needed', () => {
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2, 3], instances: { 2: inst2, 3: inst3 } });
    const [, pending] = resolveCost(
      { discard: { scope: [TargetScope.BOARD], number: 1 } },
      99,
      gs,
      defs,
    );
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('choose_card');
    expect(pending[0].pickCount).toBe(1);
  });

  it('uses explicit number for pickCount in pending choice', () => {
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const inst4 = makeInstance({ id: 4, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2, 3, 4], instances: { 2: inst2, 3: inst3, 4: inst4 } });
    const [, pending] = resolveCost(
      { discard: { scope: [TargetScope.BOARD], number: 2 } },
      99,
      gs,
      defs,
    );
    expect(pending[0].pickCount).toBe(2);
  });

  it('defaults pickCount to 1 when discard number is not specified', () => {
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2, 3], instances: { 2: inst2, 3: inst3 } });
    const [, pending] = resolveCost({ discard: { scope: [TargetScope.BOARD] } }, 99, gs, defs);
    expect(pending[0].pickCount).toBe(1);
  });

  it('resolves destroy directly when candidates equal number needed', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst } });
    const [resolved, pending] = resolveCost(
      { destroy: { scope: [TargetScope.BOARD], number: 1 } },
      99,
      gs,
      defs,
    );
    expect(resolved.destroyedCardIds).toEqual([2]);
    expect(pending).toHaveLength(0);
  });

  it('creates pending choice when more candidates than needed for destroy', () => {
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2, 3], instances: { 2: inst2, 3: inst3 } });
    const [, pending] = resolveCost(
      { destroy: { scope: [TargetScope.BOARD], number: 1 } },
      99,
      gs,
      defs,
    );
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('choose_card');
  });

  it('only considers board cards for destroy candidates', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ drawPile: [2], instances: { 2: inst } });
    const [resolved] = resolveCost({ destroy: { scope: [TargetScope.BOARD] } }, 99, gs, defs);
    expect(resolved.destroyedCardIds).toEqual([]);
  });

  it('auto-resolves destroy with one candidate and no explicit number', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst } });
    const [resolved, pending] = resolveCost(
      { destroy: { scope: [TargetScope.BOARD] } }, // no number, defaults to 1
      99,
      gs,
      defs,
    );
    expect(resolved.destroyedCardIds).toEqual([2]);
    expect(pending).toHaveLength(0);
  });

  it('creates pending choice with default pickCount when no number specified', () => {
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2, 3], instances: { 2: inst2, 3: inst3 } });
    const [, pending] = resolveCost(
      { destroy: { scope: [TargetScope.BOARD] } }, // no number, defaults to 1
      99,
      gs,
      defs,
    );
    expect(pending).toHaveLength(1);
    expect(pending[0].pickCount).toBe(1);
  });
});
