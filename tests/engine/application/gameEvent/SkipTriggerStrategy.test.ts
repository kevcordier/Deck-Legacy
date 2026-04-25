import { makeState } from '../fixtures';
import { SkipTriggerStrategy } from '@engine/application/gameEvent/SkipTriggerStrategy';
import { GameEventType } from '@engine/domain/enums';
import type { SkipTriggerEvent } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

describe('SkipTriggerStrategy', () => {
  const strategy = new SkipTriggerStrategy();

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
});
