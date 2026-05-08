import { makeInstance, makeState, makeStickerDefs } from './fixtures';
import { resolveCost } from '@engine/application/costResolver';
import { TargetScope } from '@engine/domain/enums';
import type { CardDef, Sticker } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const defs: Record<number, CardDef> = {
  1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
};

const stickerDefs: Record<number, Sticker> = makeStickerDefs();

describe('resolveCost – resources', () => {
  it('returns empty resolved cost for empty cost', () => {
    const [resolved, pending] = resolveCost({}, 1, makeState(), defs, stickerDefs);
    expect(resolved).toEqual({ resources: {}, discardedCardIds: [], destroyedCardIds: [] });
    expect(pending).toHaveLength(0);
  });

  it('resolves single resource cost directly', () => {
    const [resolved, pending] = resolveCost(
      { resources: [{ gold: 2 }] },
      1,
      makeState({ resources: { gold: 2 } }),
      defs,
      stickerDefs,
    );
    expect(resolved.resources).toEqual({ gold: 2 });
    expect(pending).toHaveLength(0);
  });

  it('creates pending choice for multiple resource options', () => {
    const [resolved, pending] = resolveCost(
      { resources: [{ gold: 1 }, { wood: 1 }] },
      5,
      makeState({ resources: { gold: 1, wood: 1 } }),
      defs,
      stickerDefs,
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
      makeState({ resources: { gold: 1, wood: 1 } }),
      defs,
      stickerDefs,
      true,
    );
    expect(pending[0].isMandatory).toBe(true);
  });

  it('throws when no resource option is affordable', () => {
    expect(() =>
      resolveCost(
        { resources: [{ gold: 2 }] },
        1,
        makeState({ resources: { gold: 1 } }),
        defs,
        stickerDefs,
      ),
    ).toThrow('Not enough resources to pay this cost.');
  });
});

describe('resolveCost – discard', () => {
  it('throws when no cards on board and no pickNumber', () => {
    const gs = makeState({ board: [] });
    expect(() =>
      resolveCost({ discard: [{ scope: [TargetScope.BOARD] }] }, 1, gs, defs, stickerDefs),
    ).toThrow('Not enough cards available to pay this discard cost.');
  });

  it('creates pending choice when more candidates than needed', () => {
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2, 3], instances: { 2: inst2, 3: inst3 } });
    const [, pending] = resolveCost(
      { discard: [{ scope: [TargetScope.BOARD], pickNumber: 1 }] },
      99,
      gs,
      defs,
      stickerDefs,
    );
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('choose_card');
    expect(pending[0].pickMax).toBe(1);
  });

  it('uses explicit number for pickNumber in pending choice', () => {
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const inst4 = makeInstance({ id: 4, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2, 3, 4], instances: { 2: inst2, 3: inst3, 4: inst4 } });
    const [, pending] = resolveCost(
      { discard: [{ scope: [TargetScope.BOARD], pickNumber: 2 }] },
      99,
      gs,
      defs,
      stickerDefs,
    );
    expect(pending[0].pickMax).toBe(2);
  });

  it('passes undefined pickNumber when discard number is not specified', () => {
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2, 3], instances: { 2: inst2, 3: inst3 } });
    const [, pending] = resolveCost(
      { discard: [{ scope: [TargetScope.BOARD] }] },
      99,
      gs,
      defs,
      stickerDefs,
    );
    expect(pending[0].pickMax).toBe(1);
  });

  it('creates pending choice when more candidates than needed for destroy', () => {
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2, 3], instances: { 2: inst2, 3: inst3 } });
    const [, pending] = resolveCost(
      { destroy: { scope: [TargetScope.BOARD], pickNumber: 1 } },
      99,
      gs,
      defs,
      stickerDefs,
    );
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('choose_card');
  });

  it('throws when no cards on board for destroy and no pickNumber', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ drawPile: [2], instances: { 2: inst } });
    expect(() =>
      resolveCost({ destroy: { scope: [TargetScope.BOARD] } }, 99, gs, defs, stickerDefs),
    ).toThrow('Not enough cards available to pay this destroy cost.');
  });

  it('creates pending choice with undefined pickNumber when no number specified', () => {
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2, 3], instances: { 2: inst2, 3: inst3 } });
    const [, pending] = resolveCost(
      { destroy: { scope: [TargetScope.BOARD] } }, // no number
      99,
      gs,
      defs,
      stickerDefs,
    );
    expect(pending).toHaveLength(1);
    expect(pending[0].pickMax).toBe(1);
  });
});
