import { makeInstance, makeState } from '../fixtures';
import { DiscardCardStrategy } from '@engine/application/cardAction/DiscardCardStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('DiscardCardStrategy', () => {
  const strategy = new DiscardCardStrategy();

  it('discards the target card', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.DISCARD_CARD,
      sourceInstanceId: 1,
      instanceIds: [2],
    });
    expect(result.discardPile).toContain(2);
    expect(result.board).not.toContain(2);
  });

  it('handles empty instanceIds gracefully', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.DISCARD_CARD,
      sourceInstanceId: 1,
      instanceIds: [],
    });
    expect(result.discardPile).toHaveLength(0);
  });

  it('handles missing instanceIds gracefully', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.DISCARD_CARD,
      sourceInstanceId: 1,
    });
    expect(result.discardPile).toHaveLength(0);
  });
});
