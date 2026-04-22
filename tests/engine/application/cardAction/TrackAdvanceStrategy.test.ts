import { makeGameState, makeInstance } from '../testHelpers';
import { TrackAdvanceStrategy } from '@engine/application/cardAction/TrackAdvanceStrategy';
import { ActionType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const makeDefWithTrack = (id: number): CardDef => ({
  id,
  name: `Card ${id}`,
  states: [
    {
      id: 1,
      name: 'State 1',
      track: {
        inOrder: true,
        cumulative: false,
        steps: [
          { id: 10, label: 'Step A' },
          { id: 11, label: 'Step B' },
        ],
      },
    },
  ],
});

describe('TrackAdvanceStrategy', () => {
  const defs: Record<number, CardDef> = { 10: makeDefWithTrack(10) };
  const strategy = new TrackAdvanceStrategy(defs);

  it('adds the stepId to trackProgress', () => {
    const gs = makeGameState({ instances: { 1: makeInstance(1, 10, 1) } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.TRACK_ADVANCE,
      sourceInstanceId: 1,
      instanceIds: [1],
      stepId: 10,
    });
    expect(result.instances[1].trackProgress).toContain(10);
  });

  it('appends to existing trackProgress', () => {
    const instance = makeInstance(1, 10, 1, { trackProgress: [10] });
    const gs = makeGameState({ instances: { 1: instance } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.TRACK_ADVANCE,
      sourceInstanceId: 1,
      instanceIds: [1],
      stepId: 11,
    });
    expect(result.instances[1].trackProgress).toEqual([10, 11]);
  });

  it('returns unchanged state when instanceIds is undefined', () => {
    const gs = makeGameState({ instances: { 1: makeInstance(1, 10, 1) } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.TRACK_ADVANCE,
      sourceInstanceId: 1,
      stepId: 10,
    });
    expect(result).toBe(gs);
  });

  it('returns unchanged state when stepId is undefined', () => {
    const gs = makeGameState({ instances: { 1: makeInstance(1, 10, 1) } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.TRACK_ADVANCE,
      sourceInstanceId: 1,
      instanceIds: [1],
    });
    expect(result).toBe(gs);
  });

  it('returns unchanged state when instance has no track', () => {
    const defNoTrack: CardDef = { id: 20, name: 'No Track', states: [{ id: 1, name: 'S1' }] };
    const strat = new TrackAdvanceStrategy({ 20: defNoTrack });
    const gs = makeGameState({ instances: { 1: makeInstance(1, 20, 1) } });
    const result = strat.applyEffect(gs, {
      id: '1-1',
      type: ActionType.TRACK_ADVANCE,
      sourceInstanceId: 1,
      instanceIds: [1],
      stepId: 10,
    });
    expect(result.instances[1].trackProgress).toEqual([]);
  });

  it('returns unchanged state when stepId does not match any step', () => {
    const gs = makeGameState({ instances: { 1: makeInstance(1, 10, 1) } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.TRACK_ADVANCE,
      sourceInstanceId: 1,
      instanceIds: [1],
      stepId: 99,
    });
    expect(result.instances[1].trackProgress).toEqual([]);
  });

  it('does not mutate the original game state', () => {
    const gs = makeGameState({ instances: { 1: makeInstance(1, 10, 1) } });
    strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.TRACK_ADVANCE,
      sourceInstanceId: 1,
      instanceIds: [1],
      stepId: 10,
    });
    expect(gs.instances[1].trackProgress).toEqual([]);
  });
});
