import { makeInstance, makeState } from '../fixtures';
import { TrackAdvanceStrategy } from '@engine/application/cardAction/TrackAdvanceStrategy';
import { ActionEffectType, Trigger } from '@engine/domain/enums';
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
const defWithTrackEndTrigger: CardDef = {
  id: 3,
  name: 'T',
  states: [
    {
      id: 1,
      name: 'S',
      track: { inOrder: true, steps: [{ id: 10 }, { id: 20 }] },
      actions: [
        {
          id: '3-1-1',
          trigger: Trigger.ON_TRACK_END,
          actionEffects: [{ id: 1, type: ActionEffectType.ADD_CUMULATED, value: 1 }],
        },
      ],
    },
  ],
};

describe('TrackAdvanceStrategy', () => {
  it('returns state unchanged when instanceId missing', () => {
    const strategy = new TrackAdvanceStrategy({ 1: defWithTrack }, {});
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.TRACK_ADVANCE,
      sourceInstanceId: 1,
      stepIds: [10],
    });
    expect(result).toBe(gs);
  });

  it('returns state unchanged when stepId missing', () => {
    const strategy = new TrackAdvanceStrategy({ 1: defWithTrack }, {});
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
    const strategy = new TrackAdvanceStrategy({ 2: defNoTrack }, {});
    const inst = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const gs = makeState({ instances: { 2: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.TRACK_ADVANCE,
      sourceInstanceId: 1,
      instanceIds: [2],
      stepIds: [10],
    });
    expect(result.instances[2].trackProgress).toHaveLength(0);
  });

  it('returns state unchanged when stepId not found in track', () => {
    const strategy = new TrackAdvanceStrategy({ 1: defWithTrack }, {});
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.TRACK_ADVANCE,
      sourceInstanceId: 1,
      instanceIds: [1],
      stepIds: [99],
    });
    expect(result.instances[1].trackProgress).toHaveLength(0);
  });

  it('records stepId in trackProgress', () => {
    const strategy = new TrackAdvanceStrategy({ 1: defWithTrack }, {});
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, trackProgress: [] });
    const gs = makeState({ instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.TRACK_ADVANCE,
      sourceInstanceId: 1,
      instanceIds: [1],
      stepIds: [10],
    });
    expect(result.instances[1].trackProgress).toEqual([10]);
  });

  it('registers ON_TRACK_END triggers when track becomes complete', () => {
    const strategy = new TrackAdvanceStrategy({ 3: defWithTrackEndTrigger }, {});
    const inst = makeInstance({ id: 3, cardId: 3, stateId: 1, trackProgress: [10] });
    const gs = makeState({ instances: { 3: inst }, triggerPile: {} });

    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.TRACK_ADVANCE,
      sourceInstanceId: 3,
      instanceIds: [3],
      stepIds: [20],
    });

    expect(result.instances[3].trackProgress).toEqual([10, 20]);
    expect(Object.keys(result.triggerPile)).toHaveLength(1);
    const trigger = Object.values(result.triggerPile)[0];
    expect(trigger.effectDef.id).toBe('3-1-1');
    expect(trigger.sourceInstanceId).toBe(3);
  });
});
