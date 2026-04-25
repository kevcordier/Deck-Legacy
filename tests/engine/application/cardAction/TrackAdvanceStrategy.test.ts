import { makeInstance, makeState } from '../fixtures';
import { TrackAdvanceStrategy } from '@engine/application/cardAction/TrackAdvanceStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const defWithTrack: CardDef = {
  id: 1,
  name: 'C',
  states: [
    {
      id: 1,
      name: 'S',
      track: { inOrder: true, steps: [{ id: 10 }, { id: 20 }] },
    },
  ],
};
const defNoTrack: CardDef = { id: 2, name: 'NT', states: [{ id: 1, name: 'S' }] };

describe('TrackAdvanceStrategy', () => {
  it('returns state unchanged when instanceId missing', () => {
    const strategy = new TrackAdvanceStrategy({ 1: defWithTrack });
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.TRACK_ADVANCE,
      sourceInstanceId: 1,
      stepId: 10,
    });
    expect(result).toBe(gs);
  });

  it('returns state unchanged when stepId missing', () => {
    const strategy = new TrackAdvanceStrategy({ 1: defWithTrack });
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.TRACK_ADVANCE,
      sourceInstanceId: 1,
      instanceIds: [1],
    });
    expect(result).toBe(gs);
  });

  it('returns state unchanged when card has no track', () => {
    const strategy = new TrackAdvanceStrategy({ 2: defNoTrack });
    const inst = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const gs = makeState({ instances: { 2: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.TRACK_ADVANCE,
      sourceInstanceId: 1,
      instanceIds: [2],
      stepId: 10,
    });
    expect(result.instances[2].trackProgress).toHaveLength(0);
  });

  it('returns state unchanged when stepId not found in track', () => {
    const strategy = new TrackAdvanceStrategy({ 1: defWithTrack });
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.TRACK_ADVANCE,
      sourceInstanceId: 1,
      instanceIds: [1],
      stepId: 99,
    });
    expect(result.instances[1].trackProgress).toHaveLength(0);
  });

  it('records stepId in trackProgress', () => {
    const strategy = new TrackAdvanceStrategy({ 1: defWithTrack });
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, trackProgress: [] });
    const gs = makeState({ instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.TRACK_ADVANCE,
      sourceInstanceId: 1,
      instanceIds: [1],
      stepId: 10,
    });
    expect(result.instances[1].trackProgress).toContain(10);
  });
});
