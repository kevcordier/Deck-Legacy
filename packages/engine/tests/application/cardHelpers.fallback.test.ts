import { makeInstance, makeState } from './fixtures';
import { ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { describe, expect, it, vi } from 'vitest';

describe('getTotalResourceProduction fallback branch', () => {
  it('uses default empty production when selected state has no productions', async () => {
    vi.resetModules();
    vi.doMock('@engine/application/cardSelector', () => ({
      cardSelector: vi.fn(() => [1]),
    }));
    const { getTotalResourceProduction } = await import('@engine/application/cardHelpers');

    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
    };
    const gs = makeState({ instances: { 1: inst } });

    expect(getTotalResourceProduction(99, ResourceType.GOLD, gs, defs, {})).toBe(0);

    vi.doUnmock('@engine/application/cardSelector');
  });
});
