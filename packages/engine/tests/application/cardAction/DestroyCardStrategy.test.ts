import { makeInstance, makeState } from '../fixtures';
import { DestroyCardStrategy } from '@engine/application/cardAction/DestroyCardStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('DestroyCardStrategy', () => {
  const strategy = new DestroyCardStrategy();

  it('handles empty instanceIds gracefully', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.DESTROY_CARD,
      sourceInstanceId: 1,
      instanceIds: [],
    });
    expect(result.destroyedPile).toHaveLength(0);
  });

  it('moves the target card to destroyedPile', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.DESTROY_CARD,
      sourceInstanceId: 1,
      instanceIds: [2],
    });
    expect(result.destroyedPile).toContain(2);
    expect(result.board).not.toContain(2);
  });

  it('handles missing instanceIds', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.DESTROY_CARD,
      sourceInstanceId: 1,
    });
    expect(result.destroyedPile).toHaveLength(0);
  });
});
