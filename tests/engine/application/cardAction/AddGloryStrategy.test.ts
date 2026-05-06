import { makeInstance, makeState } from '../fixtures';
import { AddGloryStrategy } from '@engine/application/cardAction/AddGloryStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const plainDef: CardDef = { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] };
const limitedDef: CardDef = {
  id: 1,
  name: 'L',
  states: [{ id: 1, name: 'S', glory: { amount: 2, emptyValues: 2 } }],
};

describe('AddGloryStrategy', () => {
  it('returns state unchanged when instanceIds missing', () => {
    const strategy = new AddGloryStrategy({ 1: plainDef }, {});
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_GLORY,
      sourceInstanceId: 1,
      value: 1,
    });
    expect(result).toBe(gs);
  });

  it('returns state unchanged when value missing', () => {
    const inst = makeInstance({ id: 1, cardId: 1 });
    const gs = makeState({ instances: { 1: inst } });
    const strategy = new AddGloryStrategy({ 1: plainDef }, {});
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_GLORY,
      sourceInstanceId: 1,
      instanceIds: [1],
    });
    expect(result).toBe(gs);
  });

  it('adds glory value to instance glories', () => {
    const inst = makeInstance({ id: 1, cardId: 1 });
    const gs = makeState({ instances: { 1: inst } });
    const strategy = new AddGloryStrategy({ 1: plainDef }, {});
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_GLORY,
      sourceInstanceId: 1,
      instanceIds: [1],
      value: 3,
    });
    expect(result.instances[1].glories).toEqual([3]);
  });

  it('does not add glory when emptyValues limit is already reached', () => {
    const inst = makeInstance({ id: 1, cardId: 1, glories: [1, 2] });
    const gs = makeState({ instances: { 1: inst } });
    const strategy = new AddGloryStrategy({ 1: limitedDef }, {});
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_GLORY,
      sourceInstanceId: 1,
      instanceIds: [1],
      value: 3,
    });
    expect(result).toBe(gs);
  });

  it('adds glory when emptyValues limit is not yet reached', () => {
    const inst = makeInstance({ id: 1, cardId: 1, glories: [1] });
    const gs = makeState({ instances: { 1: inst } });
    const strategy = new AddGloryStrategy({ 1: limitedDef }, {});
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_GLORY,
      sourceInstanceId: 1,
      instanceIds: [1],
      value: 3,
    });
    expect(result.instances[1].glories).toEqual([1, 3]);
  });

  it('counts additionalGlory stickers toward emptyValues limit', () => {
    const inst = makeInstance({ id: 1, cardId: 1, glories: [1, 2], stickers: { 1: [99] } });
    const gs = makeState({ instances: { 1: inst } });
    const strategy = new AddGloryStrategy(
      { 1: limitedDef },
      { 99: { id: 99, additionalGlory: 1 } },
    );
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_GLORY,
      sourceInstanceId: 1,
      instanceIds: [1],
      value: 5,
    });
    expect(result.instances[1].glories).toEqual([1, 2, 5]);
  });
});
