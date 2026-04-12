import { createInstance } from '@engine/application/factory';
import type { CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const makeDef = (id: number, stateIds: number[] = [1]): CardDef => ({
  id,
  name: `Card ${id}`,
  states: stateIds.map(sid => ({ id: sid, name: `State ${sid}` })),
});

describe('createInstance', () => {
  it('creates a card instance with the correct fields', () => {
    const defs: Record<number, CardDef> = { 10: makeDef(10, [1, 2]) };
    const instance = createInstance(5, 10, 1, defs);
    expect(instance.id).toBe(5);
    expect(instance.cardId).toBe(10);
    expect(instance.stateId).toBe(1);
    expect(instance.stickers).toEqual({});
    expect(instance.trackProgress).toEqual([]);
  });

  it('works with any valid stateId on the card', () => {
    const defs: Record<number, CardDef> = { 10: makeDef(10, [1, 2, 3]) };
    const instance = createInstance(1, 10, 3, defs);
    expect(instance.stateId).toBe(3);
  });

  it('throws when the card def is not found', () => {
    expect(() => createInstance(1, 99, 1, {})).toThrow('Card def not found: 99');
  });

  it('throws when the state is not found on the card', () => {
    const defs: Record<number, CardDef> = { 10: makeDef(10, [1]) };
    expect(() => createInstance(1, 10, 99, defs)).toThrow('State 99 not found on card 10');
  });
});
