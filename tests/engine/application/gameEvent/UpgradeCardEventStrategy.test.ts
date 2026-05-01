import { makeDefs, makeInstance, makeState, makeStickerDefs } from '../fixtures';
import * as cardHelpers from '@engine/application/cardHelpers';
import { UpgradeCardEventStrategy } from '@engine/application/gameEvent/UpgradeCardEventStrategy';
import { GameEventType } from '@engine/domain/enums';
import type { UpgradeCardEvent } from '@engine/domain/types';
import { describe, expect, it, vi } from 'vitest';

describe('UpgradeCardEventStrategy', () => {
  const strategy = new UpgradeCardEventStrategy(makeDefs(), makeStickerDefs());

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
});
