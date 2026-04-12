import { PlaceCardInDrawPileStrategy } from '@engine/application/cardAction/PlaceCardInDrawPileStrategy';
import { ActionType } from '@engine/domain/enums';
import type { GameState } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const makeGameState = (overrides: Partial<GameState> = {}): GameState => ({
  instances: {},
  drawPile: [],
  discardPile: [],
  board: [],
  destroyedPile: [],
  permanents: [],
  blockingCards: {},
  resources: {},
  stickerStock: {},
  discoveryPile: [],
  triggerPile: {},
  lastAddedIds: [],
  round: 0,
  turn: 0,
  ...overrides,
});

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

  it('removes the card from blockingCards before placing', () => {
    const gs = makeGameState({ blockingCards: { 5: 20 } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.PLACE_CARD_IN_DRAW_PILE,
      sourceInstanceId: 99,
      instanceId: 5,
      position: 0,
    });
    expect(result.blockingCards[5]).toBeUndefined();
  });
});
