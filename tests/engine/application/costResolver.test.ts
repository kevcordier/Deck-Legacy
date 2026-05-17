import { makeInstance, makeState, makeStickerDefs } from './fixtures';
import { resolveCost } from '@engine/application/costResolver';
import { PassiveType, TargetScope } from '@engine/domain/enums';
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
    ).toThrow('errors.cost.notEnoughResources');
  });

  it('resolves resource cost with equivalence when there is a unique valid payment', () => {
    const sourceInstanceId = 85;
    const [resolved, pending] = resolveCost(
      { resources: [{ wood: 2 }] },
      sourceInstanceId,
      makeState({
        resources: { wood: 1, goods: 1 },
        boardEffects: {
          [sourceInstanceId]: [
            {
              id: '85-4-1',
              type: PassiveType.RESOURCE_EQUIVALENCE,
              resources: { wood: 1, goods: 1 },
            },
          ],
        },
      }),
      defs,
      stickerDefs,
    );

    expect(resolved.resources).toEqual({ wood: 1, goods: 1 });
    expect(pending).toHaveLength(0);
  });

  it('creates a CHOOSE_RESOURCE pending choice when equivalence allows multiple payments', () => {
    const sourceInstanceId = 85;
    const [resolved, pending] = resolveCost(
      { resources: [{ wood: 1 }] },
      sourceInstanceId,
      makeState({
        resources: { wood: 1, goods: 1 },
        boardEffects: {
          [sourceInstanceId]: [
            {
              id: '85-4-1',
              type: PassiveType.RESOURCE_EQUIVALENCE,
              resources: { wood: 1, goods: 1 },
            },
          ],
        },
      }),
      defs,
      stickerDefs,
    );

    expect(resolved.resources).toEqual({});
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('choose_resource');
    expect(pending[0].choices).toContainEqual({ wood: 1 });
    expect(pending[0].choices).toContainEqual({ goods: 1 });
  });

  it('throws when resources are still insufficient with equivalence', () => {
    const sourceInstanceId = 85;

    expect(() =>
      resolveCost(
        { resources: [{ wood: 3 }] },
        sourceInstanceId,
        makeState({
          resources: { wood: 1, goods: 1 },
          boardEffects: {
            [sourceInstanceId]: [
              {
                id: '85-4-1',
                type: PassiveType.RESOURCE_EQUIVALENCE,
                resources: { wood: 1, goods: 1 },
              },
            ],
          },
        }),
        defs,
        stickerDefs,
      ),
    ).toThrow('errors.cost.notEnoughResources');
  });

  it('resolves resource cost with equivalence provided by another source in play', () => {
    const payerInstanceId = 42;
    const passiveSourceId = 85;

    const [resolved, pending] = resolveCost(
      { resources: [{ wood: 1 }] },
      payerInstanceId,
      makeState({
        board: [payerInstanceId, passiveSourceId],
        resources: { goods: 1 },
        instances: {
          [payerInstanceId]: makeInstance({ id: payerInstanceId, cardId: 1, stateId: 1 }),
          [passiveSourceId]: makeInstance({ id: passiveSourceId, cardId: 1, stateId: 1 }),
        },
        boardEffects: {
          [passiveSourceId]: [
            {
              id: '85-4-1',
              type: PassiveType.RESOURCE_EQUIVALENCE,
              resources: { wood: 1, goods: 1 },
            },
          ],
        },
      }),
      defs,
      stickerDefs,
    );

    expect(resolved.resources).toEqual({ goods: 1 });
    expect(pending).toHaveLength(0);
  });
});

describe('resolveCost – discard', () => {
  it('throws when no cards on board and no pickNumber', () => {
    const gs = makeState({ board: [] });
    expect(() =>
      resolveCost({ discard: [{ scope: [TargetScope.BOARD] }] }, 1, gs, defs, stickerDefs),
    ).toThrow('errors.cost.notEnoughCardsToDiscard');
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

  it('resolves discard directly when only SELF is targeted', () => {
    const self = makeInstance({ id: 99, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [99], instances: { 99: self } });

    const [resolved, pending] = resolveCost(
      { discard: [{ scope: [TargetScope.SELF] }] },
      99,
      gs,
      defs,
      stickerDefs,
    );

    expect(resolved.discardedCardIds).toEqual([99]);
    expect(pending).toHaveLength(0);
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
    ).toThrow('errors.cost.notEnoughCardsToDestroy');
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

  it('resolves destroy directly when only SELF is targeted', () => {
    const self = makeInstance({ id: 99, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [99], instances: { 99: self } });

    const [resolved, pending] = resolveCost(
      { destroy: { scope: [TargetScope.SELF] } },
      99,
      gs,
      defs,
      stickerDefs,
    );

    expect(resolved.destroyedCardIds).toEqual([99]);
    expect(pending).toHaveLength(0);
  });
});
