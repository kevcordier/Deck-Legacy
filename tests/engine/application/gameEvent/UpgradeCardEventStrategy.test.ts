import { makeInstance, makeState } from '../fixtures';
import { UpgradeCardEventStrategy } from '@engine/application/gameEvent/UpgradeCardEventStrategy';
import { GameEventType } from '@engine/domain/enums';
import type { UpgradeCardEvent } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

describe('UpgradeCardEventStrategy', () => {
  const strategy = new UpgradeCardEventStrategy();

  it('updates stateId on the instance', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.UPGRADE_CARD,
      timestamp: 0,
      cardInstanceId: 1,
      stateId: 3,
      cost: {},
    } as UpgradeCardEvent);
    expect(result.instances[1].stateId).toBe(3);
  });

  it('discards the upgraded card', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.UPGRADE_CARD,
      timestamp: 0,
      cardInstanceId: 1,
      stateId: 3,
      cost: {},
    } as UpgradeCardEvent);
    expect(result.board).not.toContain(1);
    expect(result.discardPile).toContain(1);
  });

  it('spends resources from cost', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], resources: { gold: 5 }, instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.UPGRADE_CARD,
      timestamp: 0,
      cardInstanceId: 1,
      stateId: 2,
      cost: { gold: 3 },
    } as UpgradeCardEvent);
    expect(result.resources.gold).toBe(2);
  });
});
