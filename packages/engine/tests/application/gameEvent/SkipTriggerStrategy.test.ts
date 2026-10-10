import { makeDefs, makeState, makeStickerDefs } from '../fixtures';
import { SkipTriggerStrategy } from '@engine/application/gameEvent/SkipTriggerStrategy';
import { GameEventType, Phase } from '@engine/domain/enums';
import type { SkipTriggerEvent } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

describe('SkipTriggerStrategy', () => {
  const strategy = new SkipTriggerStrategy(makeDefs(), makeStickerDefs());

  it('removes the specified trigger from triggerPile', () => {
    const gs = makeState({
      triggerPile: {
        'trigger-1': { effectDef: { id: 'a', actionEffects: [] }, sourceInstanceId: 1 },
        'trigger-2': { effectDef: { id: 'b', actionEffects: [] }, sourceInstanceId: 2 },
      },
    });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.SKIP_TRIGGER,
      timestamp: 0,
      triggerId: 'trigger-1',
    } as SkipTriggerEvent);
    expect(result.triggerPile['trigger-1']).toBeUndefined();
    expect(result.triggerPile['trigger-2']).toBeDefined();
  });

  it('preserves other state fields', () => {
    const gs = makeState({
      resources: { gold: 5 },
      triggerPile: { tid: { effectDef: { id: 'x', actionEffects: [] }, sourceInstanceId: 1 } },
    });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.SKIP_TRIGGER,
      timestamp: 0,
      triggerId: 'tid',
    } as SkipTriggerEvent);
    expect(result.resources.gold).toBe(5);
  });

  it('applies turn-ended flow when endTurn is true', () => {
    const gs = makeState({
      triggerPile: {
        tid: { effectDef: { id: 'x', actionEffects: [] }, sourceInstanceId: 1 },
      },
      board: [],
      phase: Phase.PLAYING,
    });

    const result = strategy.apply(gs, {
      id: 'e2',
      type: GameEventType.SKIP_TRIGGER,
      timestamp: 0,
      triggerId: 'tid',
      endTurn: true,
    } as SkipTriggerEvent);

    expect(result.triggerPile.tid).toBeUndefined();
    expect(result.phase).toBe(Phase.TURN_END);
  });

  it('applies round-ended flow when endRound is true', () => {
    const gs = makeState({
      triggerPile: {
        tid: { effectDef: { id: 'x', actionEffects: [] }, sourceInstanceId: 1 },
      },
      board: [],
      phase: Phase.PLAYING,
    });

    const result = strategy.apply(gs, {
      id: 'e3',
      type: GameEventType.SKIP_TRIGGER,
      timestamp: 0,
      triggerId: 'tid',
      endRound: true,
    } as SkipTriggerEvent);

    expect(result.triggerPile.tid).toBeUndefined();
    expect(result.phase).toBe(Phase.ROUND_END);
  });

  it('skips first trigger and keeps only remaining trigger when 2 end-of-turn triggers exist', () => {
    const gs = makeState({
      triggerPile: {
        'tid-1': {
          effectDef: { id: 'eot1', actionEffects: [], trigger: 'END_OF_TURN' as never },
          sourceInstanceId: 1,
        },
        'tid-2': {
          effectDef: { id: 'eot2', actionEffects: [], trigger: 'END_OF_TURN' as never },
          sourceInstanceId: 2,
        },
      },
      board: [],
      phase: Phase.PLAYING,
    });

    const result = strategy.apply(gs, {
      id: 'e4',
      type: GameEventType.SKIP_TRIGGER,
      timestamp: 0,
      triggerId: 'tid-1',
      endTurn: true,
    } as SkipTriggerEvent);

    expect(result.triggerPile['tid-1']).toBeUndefined();
    expect(result.triggerPile['tid-2']).toBeDefined();
    expect(Object.keys(result.triggerPile)).toHaveLength(1);
  });
});
