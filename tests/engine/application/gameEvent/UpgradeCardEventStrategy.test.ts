import { makeInstance, makeState, makeStickerDefs } from '../fixtures';
import * as cardHelpers from '@engine/application/cardHelpers';
import { UpgradeCardEventStrategy } from '@engine/application/gameEvent/UpgradeCardEventStrategy';
import { GameEventType } from '@engine/domain/enums';
import type { UpgradeCardEvent } from '@engine/domain/types';
import { describe, expect, it, vi } from 'vitest';

describe('UpgradeCardEventStrategy', () => {
  const multiStateDefs = {
    1: {
      id: 1,
      name: 'C',
      states: [
        { id: 1, name: 'S1' },
        { id: 2, name: 'S2' },
        { id: 3, name: 'S3' },
      ],
    },
  };
  const strategy = new UpgradeCardEventStrategy(multiStateDefs, makeStickerDefs());

  it('updates stateId on the instance', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst }, resources: { gold: 5 } });
    vi.spyOn(cardHelpers, 'getActiveState').mockReturnValue({ id: 3, name: 'S', permanent: false });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.UPGRADE_CARD,
      timestamp: 0,
      cardInstanceId: 1,
      stateId: 3,
      cost: { gold: 3 },
    } as UpgradeCardEvent);
    expect(result.instances[1].stateId).toBe(3);
    expect(result.board).not.toContain(1);
    expect(result.discardPile).toContain(1);
    expect(result.resources.gold).toBe(2);
  });

  it('move card to permanent area', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    vi.spyOn(cardHelpers, 'getActiveState').mockReturnValue({ id: 3, name: 'S', permanent: true });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.UPGRADE_CARD,
      timestamp: 0,
      cardInstanceId: 1,
      stateId: 3,
      cost: {},
    } as UpgradeCardEvent);
    expect(result.board).not.toContain(1);
    expect(result.permanents).toContain(1);
  });

  it('applies discarded and destroyed card costs', () => {
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [1, 2, 3],
      instances: { 1: inst1, 2: inst2, 3: inst3 },
      resources: { gold: 5 },
    });
    vi.spyOn(cardHelpers, 'getActiveState').mockReturnValue({ id: 2, name: 'S', permanent: false });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.UPGRADE_CARD,
      timestamp: 0,
      cardInstanceId: 1,
      stateId: 2,
      cost: { gold: 1 },
      discardedCardIds: [2],
      destroyedCardIds: [3],
    } as UpgradeCardEvent);

    expect(result.discardPile).toContain(2);
    expect(result.destroyedPile).toContain(3);
    expect(result.resources.gold).toBe(4);
  });
});
