import { makeGameState } from '../testHelpers';
import { SkipTriggerStrategy } from '@engine/application/gameEvent/SkipTriggerStrategy';
import { ActionType, GameEventType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

const makeTriggerEntry = (sourceInstanceId = 1) => ({
  effectDef: { id: 'action-1', actionEffects: [{ id: 1, type: ActionType.ADD_RESOURCES }] },
  sourceInstanceId,
});

const makeEvent = (triggerId: string) => ({
  id: 'evt-1',
  type: GameEventType.SKIP_TRIGGER,
  timestamp: 0,
  triggerId,
});

describe('SkipTriggerStrategy', () => {
  const strategy = new SkipTriggerStrategy();

  it('removes the specified trigger from triggerPile', () => {
    const gs = makeGameState({
      triggerPile: { 'uuid-1': makeTriggerEntry(), 'uuid-2': makeTriggerEntry(2) },
    });
    const result = strategy.apply(gs, makeEvent('uuid-1'));
    expect(result.triggerPile['uuid-1']).toBeUndefined();
  });

  it('preserves other triggers in triggerPile', () => {
    const entry2 = makeTriggerEntry(2);
    const gs = makeGameState({
      triggerPile: { 'uuid-1': makeTriggerEntry(), 'uuid-2': entry2 },
    });
    const result = strategy.apply(gs, makeEvent('uuid-1'));
    expect(result.triggerPile['uuid-2']).toEqual(entry2);
  });

  it('results in empty triggerPile when last trigger is skipped', () => {
    const gs = makeGameState({
      triggerPile: { 'uuid-1': makeTriggerEntry() },
    });
    const result = strategy.apply(gs, makeEvent('uuid-1'));
    expect(result.triggerPile).toEqual({});
  });

  it('does not alter other game state fields', () => {
    const gs = makeGameState({
      resources: { gold: 5 },
      triggerPile: { 'uuid-1': makeTriggerEntry() },
    });
    const result = strategy.apply(gs, makeEvent('uuid-1'));
    expect(result.resources).toEqual({ gold: 5 });
  });
});
