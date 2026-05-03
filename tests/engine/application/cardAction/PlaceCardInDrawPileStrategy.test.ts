import { makeInstance, makeState } from '../fixtures';
import { PlaceCardInPileStrategy } from '@engine/application/cardAction/PlaceCardInDrawPileStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('PlaceCardInPileStrategy', () => {
  const strategy = new PlaceCardInPileStrategy();

  it('returns state unchanged when instanceId missing', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.PLACE_CARD_IN_PILE,
      sourceInstanceId: 1,
      deck: 'draw',
      position: 0,
    });
    expect(result).toBe(gs);
  });

  it('returns state unchanged when position missing', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.PLACE_CARD_IN_PILE,
      sourceInstanceId: 1,
      instanceIds: [2],
      deck: 'draw',
    });
    expect(result).toBe(gs);
  });

  it('inserts card at the given position', () => {
    const inst = makeInstance({ id: 5, cardId: 1, stateId: 1 });
    const gs = makeState({ discoveryPile: [1, 2, 3], instances: { 5: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.PLACE_CARD_IN_PILE,
      sourceInstanceId: 99,
      instanceIds: [5],
      deck: 'discovery',
      position: 1,
    });
    expect(result.discoveryPile[1]).toBe(5);
  });

  it('removes card from board before placing in drawPile', () => {
    const inst = makeInstance({ id: 5, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [5], drawPile: [1], instances: { 5: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.PLACE_CARD_IN_PILE,
      sourceInstanceId: 99,
      instanceIds: [5],
      deck: 'draw',
      position: 0,
    });
    expect(result.board).not.toContain(5);
    expect(result.drawPile).toContain(5);
  });

  it('removes card from discoveryPile before placing in drawPile', () => {
    const inst = makeInstance({ id: 5, cardId: 1, stateId: 1 });
    const gs = makeState({ discoveryPile: [5], drawPile: [], instances: { 5: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.PLACE_CARD_IN_PILE,
      sourceInstanceId: 99,
      instanceIds: [5],
      position: 0,
    });
    expect(result.discoveryPile).not.toContain(5);
    expect(result.drawPile).toContain(5);
  });

  it('inserts card at top (index 0) when position is "top"', () => {
    const inst = makeInstance({ id: 5, cardId: 1, stateId: 1 });
    const gs = makeState({ drawPile: [1, 2, 3], instances: { 5: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.PLACE_CARD_IN_PILE,
      sourceInstanceId: 99,
      instanceIds: [5],
      position: 'top',
    });
    expect(result.drawPile[0]).toBe(5);
  });

  it('inserts card at bottom when position is "bottom"', () => {
    const inst = makeInstance({ id: 5, cardId: 1, stateId: 1 });
    const gs = makeState({ drawPile: [1, 2, 3], instances: { 5: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.PLACE_CARD_IN_PILE,
      sourceInstanceId: 99,
      instanceIds: [5],
      position: 'bottom',
    });
    expect(result.drawPile[result.drawPile.length - 1]).toBe(5);
  });

  it('clears boardEffects for placed card', () => {
    const inst = makeInstance({ id: 5, cardId: 1, stateId: 1 });
    const gs = makeState({
      drawPile: [],
      instances: { 5: inst },
      boardEffects: { 5: [{ id: 'b', type: 'BLOCK' as never }] },
    });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.PLACE_CARD_IN_PILE,
      sourceInstanceId: 99,
      instanceIds: [5],
      position: 0,
    });
    expect(result.boardEffects[5]).toBeUndefined();
  });
});
