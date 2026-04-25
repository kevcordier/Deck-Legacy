import { makeState } from '../fixtures';
import { StepChoiceStrategy } from '@engine/application/playerChoice/StepChoiceStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('StepChoiceStrategy', () => {
  const strategy = new StepChoiceStrategy();

  const baseResolved = {
    id: 'r1',
    type: ActionEffectType.TRACK_ADVANCE,
    sourceInstanceId: 1,
  };
  const pendingChoice = {
    id: 'p1',
    type: 'choose_step' as never,
    sourceInstanceId: 1,
    kind: ActionEffectType.TRACK_ADVANCE,
    choices: [1, 2],
    pickCount: 1,
    isMandatory: true,
  };

  it('copies chosen stepId and stepIds into merged resolved action', () => {
    const choice = { ...baseResolved, stepId: 2, stepIds: [2] };
    const [merged, remaining] = strategy.apply(choice, baseResolved, makeState(), [pendingChoice]);
    expect(merged.stepId).toBe(2);
    expect(merged.stepIds).toEqual([2]);
    expect(remaining).toHaveLength(0);
  });

  it('removes first pending choice', () => {
    const choice = { ...baseResolved, stepId: 1 };
    const extra = { ...pendingChoice, id: 'p2' };
    const [, remaining] = strategy.apply(choice, baseResolved, makeState(), [pendingChoice, extra]);
    expect(remaining).toHaveLength(1);
  });
});
