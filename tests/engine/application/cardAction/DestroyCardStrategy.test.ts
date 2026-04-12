import { makeGameState } from '../testHelpers';
import { DestroyCardStrategy } from '@engine/application/cardAction/DestroyCardStrategy';
import { ActionType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('DestroyCardStrategy', () => {
  const strategy = new DestroyCardStrategy();

  it('moves the card from board to destroyedPile', () => {
    const gs = makeGameState({ board: [1, 2, 3] });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.DESTROY_CARD,
      sourceInstanceId: 99,
      instanceId: 2,
    });
    expect(result.board).toEqual([1, 3]);
    expect(result.destroyedPile).toContain(2);
  });

  it('removes the card from drawPile if present', () => {
    const gs = makeGameState({ drawPile: [5] });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.DESTROY_CARD,
      sourceInstanceId: 99,
      instanceId: 5,
    });
    expect(result.drawPile).toEqual([]);
    expect(result.destroyedPile).toContain(5);
  });

  it('removes the card from discardPile if present', () => {
    const gs = makeGameState({ discardPile: [7] });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.DESTROY_CARD,
      sourceInstanceId: 99,
      instanceId: 7,
    });
    expect(result.discardPile).toEqual([]);
    expect(result.destroyedPile).toContain(7);
  });
});
