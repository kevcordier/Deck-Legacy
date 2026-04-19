import { makeGameState } from '../testHelpers';
import { BlockCardStrategy } from '@engine/application/cardAction/BlockCardStrategy';
import { ActionType, PassiveType } from '@engine/domain/enums';
import type { Passive } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';
import { describe, expect, it } from 'vitest';

describe('BlockCardStrategy', () => {
  const strategy = new BlockCardStrategy();

  const boardEffect: Passive = { ...CardPassives[PassiveType.BLOCK], cards: { ids: [10] } };

  it('returns the modified game state', () => {
    const gs = makeGameState();
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.BLOCK_CARD,
      sourceInstanceId: 5,
      instanceIds: [10],
    });
    expect(result).toEqual({ ...gs, boardEffects: { ...gs.boardEffects, 5: [boardEffect] } });
  });

  it('appends to existing boardEffects for the same source', () => {
    const gs = makeGameState({ boardEffects: { 5: [boardEffect] } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.BLOCK_CARD,
      sourceInstanceId: 5,
      instanceIds: [10],
    });
    expect(result.boardEffects[5]).toHaveLength(2);
  });

  it('does not modify boardEffects if instanceIds is empty', () => {
    const gs = makeGameState({ boardEffects: { 5: [boardEffect] } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.BLOCK_CARD,
      sourceInstanceId: 5,
      instanceIds: [],
    });
    expect(result.boardEffects[5]).toEqual([boardEffect]);
  });

  it('does not modify boardEffects if instanceIds is undefined', () => {
    const gs = makeGameState({
      boardEffects: { 5: [boardEffect] },
    });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.BLOCK_CARD,
      sourceInstanceId: 5,
    });
    expect(result.boardEffects[5]).toEqual([boardEffect]); // should remain unchanged
  });
});
