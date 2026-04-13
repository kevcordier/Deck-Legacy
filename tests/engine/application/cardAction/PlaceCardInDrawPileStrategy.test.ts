import { makeGameState } from '../testHelpers';
import { PlaceCardInDrawPileStrategy } from '@engine/application/cardAction/PlaceCardInDrawPileStrategy';
import { ActionType, PassiveType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('PlaceCardInDrawPileStrategy', () => {
  const strategy = new PlaceCardInDrawPileStrategy();

  it('inserts the card at the given position in the draw pile', () => {
    const gs = makeGameState({ drawPile: [1, 2, 3] });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.PLACE_CARD_IN_DRAW_PILE,
      sourceInstanceId: 99,
      instanceId: 5,
      position: 1,
    });
    expect(result.drawPile).toEqual([1, 5, 2, 3]);
  });

  it('places the card at position 0 (top of pile)', () => {
    const gs = makeGameState({ drawPile: [1, 2] });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.PLACE_CARD_IN_DRAW_PILE,
      sourceInstanceId: 99,
      instanceId: 5,
      position: 0,
    });
    expect(result.drawPile[0]).toBe(5);
  });

  it('removes the card from board before placing in draw pile', () => {
    const gs = makeGameState({ board: [5, 10], drawPile: [1] });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.PLACE_CARD_IN_DRAW_PILE,
      sourceInstanceId: 99,
      instanceId: 5,
      position: 0,
    });
    expect(result.board).toEqual([10]);
    expect(result.drawPile).toContain(5);
  });

  it('removes the card from discoveryPile before placing', () => {
    const gs = makeGameState({ discoveryPile: [5, 6] });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.PLACE_CARD_IN_DRAW_PILE,
      sourceInstanceId: 99,
      instanceId: 5,
      position: 0,
    });
    expect(result.discoveryPile).toEqual([6]);
  });

  it('removes the card from boardEffects before placing', () => {
    const gs = makeGameState({
      boardEffects: { 5: [{ id: '5', type: PassiveType.STAY_IN_PLAY }] },
    });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.PLACE_CARD_IN_DRAW_PILE,
      sourceInstanceId: 99,
      instanceId: 5,
      position: 0,
    });
    expect(result.boardEffects[5]).toBeUndefined();
  });
});
