import { makeInstance, makeState } from '../fixtures';
import { ParchmentCardDiscoveredStrategy } from '@engine/application/gameEvent/ParchmentCardDiscoveredStrategy';
import { GameEventType } from '@engine/domain/enums';
import type { ParchmentCardDiscoveredEvent } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it } from 'vitest';

describe('ParchmentCardDiscoveredStrategy', () => {
  const strategy = new ParchmentCardDiscoveredStrategy();

  it('sets phase to PARCHMENT, sets onGoingParchment, removes card from discoveryPile, clears lastAddedCards', () => {
    const inst = makeInstance({ id: 1, cardId: 3, stateId: 1 });
    const gs = makeState({
      discoveryPile: [1, 2],
      instances: { 1: inst },
      lastAddedCards: [1],
    });
    const event: ParchmentCardDiscoveredEvent = {
      id: 'uuid',
      type: GameEventType.PARCHMENT_CARD_DISCOVERED,
      timestamp: 0,
      cardInstanceId: 1,
    };
    const result = strategy.apply(gs, event);
    expect(result.phase).toBe(Phase.PARCHMENT);
    expect(result.onGoingParchment).toBe(1);
    expect(result.discoveryPile).not.toContain(1);
    expect(result.discoveryPile).toContain(2);
    expect(result.lastAddedCards).toHaveLength(0);
  });
});
