import { makeState } from '../fixtures';
import { ChooseActionEffectStrategy } from '@engine/application/playerChoice/ChooseActionEffectStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('ChooseActionEffectStrategy', () => {
  const strategy = new ChooseActionEffectStrategy();

  const baseResolved = {
    id: 'r1',
    type: ActionEffectType.CHOOSE_EFFECT,
    sourceInstanceId: 1,
  };
  const pendingChoice = {
    id: 'p1',
    type: 'choose_action_effect' as never,
    sourceInstanceId: 1,
    kind: ActionEffectType.CHOOSE_EFFECT,
    choices: [],
    pickMin: 1,
    pickMax: 1,
    isMandatory: true,
  };

  it('copies newActionEffects from the choice into the merged resolved action', () => {
    const subEffect = { id: 2, type: ActionEffectType.ADD_RESOURCES };
    const choice = { ...baseResolved, newActionEffects: [subEffect] };
    const [merged] = strategy.apply(choice, baseResolved, makeState(), [pendingChoice]);
    expect(merged.newActionEffects).toEqual([subEffect]);
  });

  it('removes the first pending choice', () => {
    const choice = { ...baseResolved, newActionEffects: [] };
    const extra = { ...pendingChoice, id: 'p2' };
    const [, remaining] = strategy.apply(choice, baseResolved, makeState(), [pendingChoice, extra]);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe('p2');
  });

  it('preserves existing fields of the resolved action', () => {
    const choice = { ...baseResolved, newActionEffects: undefined };
    const [merged] = strategy.apply(choice, baseResolved, makeState(), [pendingChoice]);
    expect(merged.id).toBe('r1');
    expect(merged.sourceInstanceId).toBe(1);
  });
});
