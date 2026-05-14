import { makeInstance, makeState } from '../fixtures';
import { RemoveResourceOnCardStrategy } from '@engine/application/cardAction/RemoveResourceOnCardStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('RemoveResourceOnCardStrategy', () => {
  const strategy = new RemoveResourceOnCardStrategy();

  it('adds removed resources to all scopes by default', () => {
    const target = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 2: target } });

    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
      sourceInstanceId: 1,
      instanceIds: [2],
      resources: { gold: 1 },
    });

    expect(result.instances[2].removedResourcesByState?.[1]).toEqual({
      production: ['gold'],
      actionCost: ['gold'],
      upgradeCost: ['gold'],
    });
  });

  it('adds removed resources only for selected scopes', () => {
    const target = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 2: target } });

    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
      sourceInstanceId: 1,
      instanceIds: [2],
      resources: { wood: 1 },
      resourceScopes: ['production'],
    });

    expect(result.instances[2].removedResourcesByState?.[1]).toEqual({
      production: ['wood'],
    });
  });

  it('uses payload.stateId when provided', () => {
    const target = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 2: target } });

    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
      sourceInstanceId: 1,
      instanceIds: [2],
      stateId: 2,
      resources: { wood: 1 },
      resourceScopes: ['upgradeCost'],
    });

    expect(result.instances[2].removedResourcesByState?.[2]).toEqual({
      upgradeCost: ['wood'],
    });
  });

  it('returns original state when no targets are provided', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
      sourceInstanceId: 1,
      resources: { gold: 1 },
    });
    expect(result).toBe(gs);
  });

  it('returns original state when payload type is not REMOVE_RESOURCE_ON_CARD', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 1,
      instanceIds: [2],
      resources: { gold: 1 },
    });
    expect(result).toBe(gs);
  });

  it('returns original state when resources payload is empty (all values zero)', () => {
    const target = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 2: target } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
      sourceInstanceId: 1,
      instanceIds: [2],
      resources: { gold: 0 },
    });
    expect(result).toBe(gs);
  });

  it('skips instances not found in game state', () => {
    const gs = makeState({ instances: {} });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
      sourceInstanceId: 1,
      instanceIds: [99],
      resources: { gold: 1 },
    });
    expect(result.instances[99]).toBeUndefined();
  });

  it('ignores undefined resource values when extracting keys', () => {
    const target = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 2: target } });

    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
      sourceInstanceId: 1,
      instanceIds: [2],
      resources: { gold: undefined as unknown as number, wood: 1 },
      resourceScopes: ['production'],
    });

    expect(result.instances[2].removedResourcesByState?.[1]).toEqual({ production: ['wood'] });
  });

  it('returns original state when resources field is omitted', () => {
    const target = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 2: target } });

    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
      sourceInstanceId: 1,
      instanceIds: [2],
    });

    expect(result).toBe(gs);
  });
});
