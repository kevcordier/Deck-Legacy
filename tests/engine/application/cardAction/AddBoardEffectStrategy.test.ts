import { makeGameState, makeInstance } from '../testHelpers';
import { AddBoardEffectStrategy } from '@engine/application/cardAction/AddBoardEffectStrategy';
import { ActionType, PassiveType } from '@engine/domain/enums';
import type { Passive } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';
import { describe, expect, it } from 'vitest';

describe('AddBoardEffectStrategy', () => {
  const strategy = new AddBoardEffectStrategy();
  const effect: Passive = CardPassives[PassiveType.STAY_IN_PLAY];

  it('adds boardEffect for each resolved instance id', () => {
    const gs = makeGameState({
      instances: { 2: makeInstance(2, 10, 1), 3: makeInstance(3, 10, 1) },
    });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.ADD_BOARD_EFFECT,
      sourceInstanceId: 1,
      instanceIds: [2, 3],
      effect,
    });
    expect(result.boardEffects[2]).toEqual([{ ...effect, cards: { ids: [2] } }]);
    expect(result.boardEffects[3]).toEqual([{ ...effect, cards: { ids: [3] } }]);
  });

  it('appends to existing boardEffects for the same key', () => {
    const existing: Passive = { ...CardPassives[PassiveType.BLOCK], cards: { ids: [2] } };
    const gs = makeGameState({ boardEffects: { 2: [existing] } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.ADD_BOARD_EFFECT,
      sourceInstanceId: 1,
      instanceIds: [2],
      effect,
    });
    expect(result.boardEffects[2]).toEqual([existing, { ...effect, cards: { ids: [2] } }]);
  });

  it('returns unchanged state when instanceIds is empty', () => {
    const gs = makeGameState();
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.ADD_BOARD_EFFECT,
      sourceInstanceId: 1,
      instanceIds: [],
      effect,
    });
    expect(result.boardEffects).toEqual({});
  });

  it('returns unchanged state when instanceIds is undefined', () => {
    const gs = makeGameState();
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.ADD_BOARD_EFFECT,
      sourceInstanceId: 1,
    });
    expect(result.boardEffects).toEqual({});
  });

  it('returns unchanged state when effect is undefined', () => {
    const gs = makeGameState();
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.ADD_BOARD_EFFECT,
      sourceInstanceId: 1,
      instanceIds: [2],
    });
    expect(result.boardEffects).toEqual({});
  });

  it('does not mutate the original game state', () => {
    const gs = makeGameState();
    strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.ADD_BOARD_EFFECT,
      sourceInstanceId: 1,
      instanceIds: [2],
      effect,
    });
    expect(gs.boardEffects).toEqual({});
  });
});
