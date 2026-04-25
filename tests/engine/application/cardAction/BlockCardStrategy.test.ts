import { makeState } from '../fixtures';
import { BlockCardStrategy } from '@engine/application/cardAction/BlockCardStrategy';
import { ActionEffectType, PassiveType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('BlockCardStrategy', () => {
  const strategy = new BlockCardStrategy();

  it('returns state unchanged when instanceIds is empty', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.BLOCK_CARD,
      sourceInstanceId: 1,
      instanceIds: [],
    });
    expect(result).toBe(gs);
  });

  it('returns state unchanged when instanceIds is missing', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.BLOCK_CARD,
      sourceInstanceId: 1,
    });
    expect(result).toBe(gs);
  });

  it('adds a BLOCK board effect targeting the first instance id', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.BLOCK_CARD,
      sourceInstanceId: 10,
      instanceIds: [20],
    });
    const effects = result.boardEffects[10];
    expect(effects).toHaveLength(1);
    expect(effects[0].type).toBe(PassiveType.BLOCK);
    expect(effects[0].cards?.ids).toEqual([20]);
  });

  it('appends to existing board effects on the source', () => {
    const gs = makeState({
      boardEffects: { 10: [{ id: 'sip', type: PassiveType.STAY_IN_PLAY }] },
    });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.BLOCK_CARD,
      sourceInstanceId: 10,
      instanceIds: [20],
    });
    expect(result.boardEffects[10]).toHaveLength(2);
  });
});
