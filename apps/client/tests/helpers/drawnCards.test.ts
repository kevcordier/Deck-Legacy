import { EMPTY_STATE } from '@deck-legacy/engine/application/emptyState';
import type { GameState } from '@deck-legacy/engine/domain/types';
import { findDrawnCards } from '@helpers/drawnCards';
import { describe, expect, it } from 'vitest';

const state = (piles: Partial<GameState>): GameState => ({ ...EMPTY_STATE, ...piles });

describe('findDrawnCards', () => {
  it('returns the cards moved from the draw pile into play, in draw order', () => {
    const previous = state({ drawPile: [4, 7, 9], board: [1] });
    const next = state({ drawPile: [9], board: [1, 4], permanents: [7] });
    expect(findDrawnCards(previous, next)).toEqual([4, 7]);
  });

  it('ignores cards already in play and cards going back to the draw pile (rewind)', () => {
    const previous = state({ drawPile: [9], board: [1, 4] });
    const next = state({ drawPile: [4, 9], board: [1] });
    expect(findDrawnCards(previous, next)).toEqual([]);
  });
});
