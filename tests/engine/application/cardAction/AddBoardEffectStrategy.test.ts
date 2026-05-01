import { makeState } from '../fixtures';
import { AddBoardEffectStrategy } from '@engine/application/cardAction/AddBoardEffectStrategy';
import { ActionEffectType, PassiveType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('AddBoardEffectStrategy', () => {
  const strategy = new AddBoardEffectStrategy();
  const passive = { id: 'block', type: PassiveType.BLOCK };

  it('returns game state unchanged when instanceIds is missing', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_BOARD_EFFECT,
      sourceInstanceId: 1,
      effect: passive,
    });
    expect(result).toBe(gs);
  });

  it('returns game state unchanged when effect is missing', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_BOARD_EFFECT,
      sourceInstanceId: 1,
      instanceIds: [2],
    });
    expect(result).toBe(gs);
  });

  it('adds board effect to target instance', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_BOARD_EFFECT,
      sourceInstanceId: 1,
      instanceIds: [2],
      effect: passive,
    });
    expect(result.boardEffects[1]).toHaveLength(1);
    expect(result.boardEffects[1][0].type).toBe(PassiveType.BLOCK);
  });

  it('appends to existing board effects', () => {
    const gs = makeState({
      boardEffects: { 2: [{ id: 'existing', type: PassiveType.STAY_IN_PLAY }] },
    });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_BOARD_EFFECT,
      sourceInstanceId: 2,
      instanceIds: [3],
      effect: passive,
    });
    expect(result.boardEffects[2]).toHaveLength(2);
  });

  it('adds effects to multiple instances', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_BOARD_EFFECT,
      sourceInstanceId: 1,
      instanceIds: [2, 3],
      effect: passive,
    });
    expect(result.boardEffects[1]).toHaveLength(1);
    expect(result.boardEffects[1][0].cards?.ids).toEqual([2, 3]);
  });
});
