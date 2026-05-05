import { makeState } from '../fixtures';
import { StateChoiceStrategy } from '@engine/application/playerChoice/StateChoiceStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('StateChoiceStrategy', () => {
  const strategy = new StateChoiceStrategy();

  const baseResolved = {
    id: 'r1',
    type: ActionEffectType.CHOOSE_STATE,
    sourceInstanceId: 1,
  };
  const pendingChoice = {
    id: 'p1',
    type: 'choose_state' as never,
    sourceInstanceId: 1,
    kind: ActionEffectType.CHOOSE_STATE,
    choices: [1, 2],
    pickMin: 1,
    pickMax: 1,
    isMandatory: true,
  };

  it('copies chosen stateId into merged resolved action', () => {
    const choice = { ...baseResolved, stateId: 3 };
    const [merged, remaining] = strategy.apply(choice, baseResolved, makeState(), [pendingChoice]);
    expect(merged.stateId).toBe(3);
    expect(remaining).toHaveLength(0);
  });

  it('removes first pending choice', () => {
    const choice = { ...baseResolved, stateId: 2 };
    const extra = { ...pendingChoice, id: 'p2' };
    const [, remaining] = strategy.apply(choice, baseResolved, makeState(), [pendingChoice, extra]);
    expect(remaining).toHaveLength(1);
  });
});
