import { makeDefs, makeInstance, makeState, makeStickerDefs } from '../fixtures';
import { UpgradeCardStrategy } from '@engine/application/cardAction/UpgradeCardStrategy';
import * as cardHelpers from '@engine/application/cardHelpers';
import { ActionEffectType } from '@engine/domain/enums';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('UpgradeCardStrategy', () => {
  const strategy = new UpgradeCardStrategy(
    makeDefs({
      states: [
        { id: 1, name: 'State 1' },
        { id: 2, name: 'State 2' },
      ],
    }),
    makeStickerDefs(),
  );

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns state unchanged when instanceId missing', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.UPGRADE_CARD,
      sourceInstanceId: 1,
      stateId: 2,
    });
    expect(result).toBe(gs);
  });

  it('uses the first upgrade on the current state when stateId is missing', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    const strategyWithUpgrade = new UpgradeCardStrategy(
      makeDefs({
        states: [
          { id: 1, name: 'State 1', upgrade: [{ cost: {}, upgradeTo: 2 }] },
          { id: 2, name: 'State 2' },
        ],
      }),
      makeStickerDefs(),
    );
    vi.spyOn(cardHelpers, 'getActiveState').mockImplementation(instance =>
      instance.stateId === 1
        ? { id: 1, name: 'State 1', upgrade: [{ cost: {}, upgradeTo: 2 }] }
        : { id: 2, name: 'State 2', permanent: false },
    );
    const result = strategyWithUpgrade.apply(gs, {
      id: 'x',
      type: ActionEffectType.UPGRADE_CARD,
      sourceInstanceId: 1,
      instanceIds: [1],
    });
    expect(result.instances[1].stateId).toBe(2);
    expect(result.discardPile).toContain(1);
  });

  it('returns state unchanged when instanceId exists in payload but instance not in state', () => {
    const gs = makeState({ instances: {} });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.UPGRADE_CARD,
      sourceInstanceId: 1,
      instanceIds: [99],
      // no stateId → targetStateId will be undefined → early return
    });
    expect(result).toBe(gs);
  });

  it('returns state unchanged when stateId is missing and no upgrade exists', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.UPGRADE_CARD,
      sourceInstanceId: 1,
      instanceIds: [1],
    });
    expect(result).toBe(gs);
  });

  it('updates stateId and discards the card', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    vi.spyOn(cardHelpers, 'getActiveState').mockReturnValue({ id: 2, name: 'S', permanent: false });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.UPGRADE_CARD,
      sourceInstanceId: 1,
      instanceIds: [1],
      stateId: 2,
    });
    expect(result.instances[1].stateId).toBe(2);
    expect(result.discardPile).toContain(1);
    expect(result.board).not.toContain(1);
  });

  it('moves card to permanents when new state is permanent', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    vi.spyOn(cardHelpers, 'getActiveState').mockReturnValue({ id: 2, name: 'S', permanent: true });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.UPGRADE_CARD,
      sourceInstanceId: 1,
      instanceIds: [1],
      stateId: 2,
    });
    expect(result.instances[1].stateId).toBe(2);
    expect(result.permanents).toContain(1);
    expect(result.board).not.toContain(1);
    expect(result.discardPile).not.toContain(1);
  });
});
