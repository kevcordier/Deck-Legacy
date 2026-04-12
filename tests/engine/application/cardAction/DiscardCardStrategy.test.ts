import { makeGameState } from '../testHelpers';
import { DiscardCardStrategy } from '@engine/application/cardAction/DiscardCardStrategy';
import { ActionType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('DiscardCardStrategy', () => {
  const strategy = new DiscardCardStrategy();

  it('moves the card from board to discardPile', () => {
    const gs = makeGameState({ board: [1, 2, 3] });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.DISCARD_CARD,
      sourceInstanceId: 99,
      instanceId: 2,
    });
    expect(result.board).toEqual([1, 3]);
    expect(result.discardPile).toContain(2);
  });

  it('removes the card from drawPile if present', () => {
    const gs = makeGameState({ drawPile: [4, 5] });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.DISCARD_CARD,
      sourceInstanceId: 99,
      instanceId: 4,
    });
    expect(result.drawPile).toEqual([5]);
    expect(result.discardPile).toContain(4);
  });

  it('removes the card from discoveryPile if present', () => {
    const gs = makeGameState({ discoveryPile: [10] });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.DISCARD_CARD,
      sourceInstanceId: 99,
      instanceId: 10,
    });
    expect(result.discoveryPile).toEqual([]);
    expect(result.discardPile).toContain(10);
  });
});
