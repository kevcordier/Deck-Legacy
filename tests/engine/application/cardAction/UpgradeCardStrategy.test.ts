import { makeInstance, makeState } from '../fixtures';
import { UpgradeCardStrategy } from '@engine/application/cardAction/UpgradeCardStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('UpgradeCardStrategy', () => {
  const strategy = new UpgradeCardStrategy();

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

  it('returns state unchanged when stateId missing', () => {
    const inst = makeInstance({ id: 1 });
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
});
