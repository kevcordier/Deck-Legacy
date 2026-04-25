import { makeState } from '../fixtures';
import { ResourceChoiceStrategy } from '@engine/application/playerChoice/ResourceChoiceStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('ResourceChoiceStrategy', () => {
  const strategy = new ResourceChoiceStrategy();

  const baseResolved = {
    id: 'r1',
    type: ActionEffectType.ADD_RESOURCES,
    sourceInstanceId: 1,
  };

  it('merges chosen resource into resolved action', () => {
    const choice = { ...baseResolved, resources: { gold: 2 } };
    const pending = [
      {
        id: 'p1',
        type: 'choose_resource' as never,
        sourceInstanceId: 1,
        kind: ActionEffectType.ADD_RESOURCES,
        choices: [],
        pickCount: 1,
        isMandatory: true,
      },
    ];
    const [merged, remaining] = strategy.apply(
      choice,
      { ...baseResolved, resources: { wood: 1 } },
      makeState(),
      pending,
    );
    expect(merged.resources).toEqual({ wood: 1, gold: 2 });
    expect(remaining).toHaveLength(0);
  });

  it('handles case where resolvedAction has no resources', () => {
    const choice = { ...baseResolved, resources: { stone: 1 } };
    const pending = [
      {
        id: 'p1',
        type: 'choose_resource' as never,
        sourceInstanceId: 1,
        kind: ActionEffectType.ADD_RESOURCES,
        choices: [],
        pickCount: 1,
        isMandatory: true,
      },
    ];
    const [merged] = strategy.apply(choice, baseResolved, makeState(), pending);
    expect(merged.resources).toEqual({ stone: 1 });
  });

  it('sets resources to undefined when both are absent', () => {
    const choice = { ...baseResolved };
    const pending = [
      {
        id: 'p1',
        type: 'choose_resource' as never,
        sourceInstanceId: 1,
        kind: ActionEffectType.ADD_RESOURCES,
        choices: [],
        pickCount: 1,
        isMandatory: true,
      },
    ];
    const [merged] = strategy.apply(choice, baseResolved, makeState(), pending);
    expect(merged.resources).toBeUndefined();
  });

  it('removes first pending choice', () => {
    const pending = [
      {
        id: 'p1',
        type: 'choose_resource' as never,
        sourceInstanceId: 1,
        kind: ActionEffectType.ADD_RESOURCES,
        choices: [],
        pickCount: 1,
        isMandatory: true,
      },
      {
        id: 'p2',
        type: 'choose_resource' as never,
        sourceInstanceId: 1,
        kind: ActionEffectType.ADD_RESOURCES,
        choices: [],
        pickCount: 1,
        isMandatory: true,
      },
    ];
    const [, remaining] = strategy.apply(baseResolved, baseResolved, makeState(), pending);
    expect(remaining).toHaveLength(1);
  });
});
