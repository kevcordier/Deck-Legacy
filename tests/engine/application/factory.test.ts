import { createInstance } from '@engine/application/factory';
import type { CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const defs: Record<number, CardDef> = {
  1: { id: 1, name: 'Card', states: [{ id: 10, name: 'Base' }] },
};

describe('createInstance', () => {
  it('creates an instance with correct fields', () => {
    const inst = createInstance(42, 1, 10, defs);
    expect(inst).toEqual({
      id: 42,
      cardId: 1,
      stateId: 10,
      stickers: {},
      trackProgress: [],
      cumulated: 0,
      usedActionIds: [],
      removedResourcesByState: {},
    });
  });

  it('throws when cardId is not in defs', () => {
    expect(() => createInstance(1, 99, 10, defs)).toThrow('Card def not found: 99');
  });

  it('throws when stateId does not exist on the card', () => {
    expect(() => createInstance(1, 1, 99, defs)).toThrow('State 99 not found on card 1');
  });
});
