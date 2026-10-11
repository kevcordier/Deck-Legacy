import { makeInstance, makeState } from './fixtures';
import { getTotalResourceProduction } from '@engine/application/cardHelpers';
import { ResourceType } from '@engine/domain/enums';
import type { CardDef, Sticker } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

describe('getTotalResourceProduction fallback branch', () => {
  it('uses default empty production when selected state has no productions', () => {
    // The state has no productions; a gold sticker makes the card selected by `produces`.
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, stickers: { 1: [1] } });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
    };
    const stickerDefs: Record<number, Sticker> = { 1: { id: 1, production: ResourceType.GOLD } };
    const gs = makeState({ instances: { 1: inst }, board: [1] });

    expect(getTotalResourceProduction(99, ResourceType.GOLD, gs, defs, stickerDefs)).toBe(1);
  });
});
