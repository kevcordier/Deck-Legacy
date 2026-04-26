import { makeInstance, makeState } from '../fixtures';
import { StepChoiceStrategy } from '@engine/application/playerChoice/StepChoiceStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const goldDef: CardDef = {
  id: 1,
  name: 'G',
  states: [
    {
      id: 1,
      name: 'S',
      productions: [{ gold: 2 }],
      track: {
        inOrder: true,
        steps: [
          {
            id: 1,
            effects: [{ id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } }],
          },
        ],
      },
    },
  ],
};

describe('StepChoiceStrategy', () => {
  const defs = { 1: goldDef };
  const strategy = new StepChoiceStrategy(defs);

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

  it('removes first pending choice', () => {
    const choice = { ...baseResolved, stepIds: [1] };
    const extra = { ...pendingChoice, id: 'p2' };
    const [, remaining] = strategy.apply(
      choice,
      baseResolved,
      makeState({ instances: { 1: makeInstance() } }),
      [pendingChoice, extra],
    );
    expect(remaining).toHaveLength(1);
  });

  it('returns resolvedAction unchanged when stepIds is absent', () => {
    const [result, remaining] = strategy.apply(
      baseResolved,
      baseResolved,
      makeState({ instances: { 1: makeInstance() } }),
      [pendingChoice],
    );
    expect(result).toEqual(baseResolved);
    expect(remaining).toHaveLength(0);
  });

  it('uses empty effects when step is not found in track', () => {
    const choice = { ...baseResolved, stepIds: [99] };
    const [merged] = strategy.apply(
      choice,
      baseResolved,
      makeState({ instances: { 1: makeInstance() } }),
      [pendingChoice],
    );
    expect(merged.newActionEffects).toEqual([]);
  });
});
