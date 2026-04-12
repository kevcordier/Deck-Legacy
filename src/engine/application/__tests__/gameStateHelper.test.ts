import { makeGameState, makeInstance } from './testHelpers';
import {
  computeScore,
  destroyCards,
  discardCards,
  drawCards,
  endTurn,
  getCurrentPhase,
  mergeResources,
  spendResources,
} from '@engine/application/gameStateHelper';
import type { CardDef, Sticker } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

// — discardCards —

describe('discardCards', () => {
  it('moves cards from board to discard pile', () => {
    const gs = makeGameState({ board: [1, 2, 3], instances: {} });
    const result = discardCards(gs, [1, 3]);
    expect(result.board).toEqual([2]);
    expect(result.discardPile).toContain(1);
    expect(result.discardPile).toContain(3);
  });

  it('removes cards from drawPile', () => {
    const gs = makeGameState({ drawPile: [1, 2] });
    const result = discardCards(gs, [1]);
    expect(result.drawPile).toEqual([2]);
    expect(result.discardPile).toContain(1);
  });

  it('removes cards from discoveryPile', () => {
    const gs = makeGameState({ discoveryPile: [5, 6] });
    const result = discardCards(gs, [5]);
    expect(result.discoveryPile).toEqual([6]);
  });

  it('removes cards from blockingCards', () => {
    const gs = makeGameState({ blockingCards: { 1: 2, 3: 4 } });
    const result = discardCards(gs, [1]);
    expect(result.blockingCards[1]).toBeUndefined();
    expect(result.blockingCards[3]).toBe(4);
  });

  it('does not mutate the original game state', () => {
    const gs = makeGameState({ board: [1], instances: {} });
    discardCards(gs, [1]);
    expect(gs.board).toContain(1);
  });

  it('handles empty card list gracefully', () => {
    const gs = makeGameState({ board: [1, 2] });
    const result = discardCards(gs, []);
    expect(result.board).toEqual([1, 2]);
    expect(result.discardPile).toEqual([]);
  });
});

// — drawCards —

describe('drawCards', () => {
  it('moves cards from draw pile to board', () => {
    const gs = makeGameState({ drawPile: [1, 2, 3] });
    const result = drawCards(gs, [1, 2]);
    expect(result.drawPile).toEqual([3]);
    expect(result.board).toEqual([1, 2]);
  });

  it('appends drawn cards to existing board', () => {
    const gs = makeGameState({ drawPile: [3], board: [1, 2] });
    const result = drawCards(gs, [3]);
    expect(result.board).toEqual([1, 2, 3]);
  });

  it('does not mutate the original game state', () => {
    const gs = makeGameState({ drawPile: [1, 2] });
    drawCards(gs, [1]);
    expect(gs.drawPile).toEqual([1, 2]);
  });

  it('handles empty turnCards', () => {
    const gs = makeGameState({ drawPile: [1, 2] });
    const result = drawCards(gs, []);
    expect(result.drawPile).toEqual([1, 2]);
    expect(result.board).toEqual([]);
  });
});

// — destroyCards —

describe('destroyCards', () => {
  it('moves cards to destroyed pile and removes from all others', () => {
    const gs = makeGameState({
      board: [1, 2],
      drawPile: [3],
      discardPile: [4],
      discoveryPile: [5],
    });
    const result = destroyCards(gs, [1, 3, 4, 5]);
    expect(result.board).toEqual([2]);
    expect(result.drawPile).toEqual([]);
    expect(result.discardPile).toEqual([]);
    expect(result.discoveryPile).toEqual([]);
    expect(result.destroyedPile).toEqual([1, 3, 4, 5]);
  });

  it('removes destroyed cards from blockingCards', () => {
    const gs = makeGameState({ blockingCards: { 1: 2 } });
    const result = destroyCards(gs, [1]);
    expect(result.blockingCards[1]).toBeUndefined();
  });

  it('does not mutate the original game state', () => {
    const gs = makeGameState({ board: [1] });
    destroyCards(gs, [1]);
    expect(gs.board).toContain(1);
  });
});

// — endTurn —

describe('endTurn', () => {
  it('clears resources', () => {
    const gs = makeGameState({ resources: { gold: 5, wood: 2 }, board: [] });
    const result = endTurn(gs);
    expect(result.resources).toEqual({});
  });

  it('discards all board cards', () => {
    const gs = makeGameState({ board: [1, 2, 3] });
    const result = endTurn(gs);
    expect(result.board).toEqual([]);
    expect(result.discardPile).toContain(1);
    expect(result.discardPile).toContain(2);
    expect(result.discardPile).toContain(3);
  });

  it('does not mutate the original game state', () => {
    const gs = makeGameState({ resources: { gold: 3 }, board: [1] });
    endTurn(gs);
    expect(gs.resources.gold).toBe(3);
    expect(gs.board).toContain(1);
  });
});

// — spendResources —

describe('spendResources', () => {
  it('subtracts resource values from the game state', () => {
    const gs = makeGameState({ resources: { gold: 5, wood: 3 } });
    const result = spendResources(gs, { gold: 2, wood: 1 });
    expect(result.resources.gold).toBe(3);
    expect(result.resources.wood).toBe(2);
  });

  it('removes a resource key when the result is exactly zero', () => {
    const gs = makeGameState({ resources: { gold: 3 } });
    const result = spendResources(gs, { gold: 3 });
    expect(result.resources.gold).toBeUndefined();
  });

  it('removes a resource key when the result goes below zero', () => {
    const gs = makeGameState({ resources: { gold: 2 } });
    const result = spendResources(gs, { gold: 5 });
    expect(result.resources.gold).toBeUndefined();
  });

  it('does not mutate the original game state', () => {
    const gs = makeGameState({ resources: { gold: 4 } });
    spendResources(gs, { gold: 4 });
    expect(gs.resources.gold).toBe(4);
  });
});

// — computeScore —

describe('computeScore', () => {
  it('returns 0 when no cards are present', () => {
    const gs = makeGameState();
    expect(computeScore(gs, {}, {})).toBe(0);
  });

  it('sums glory from card states', () => {
    const gs = makeGameState({
      drawPile: [1, 2],
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 11, 2),
      },
    });
    const defs: Record<number, CardDef> = {
      10: { id: 10, name: 'A', states: [{ id: 1, name: 'S1', glory: 3 }] },
      11: { id: 11, name: 'B', states: [{ id: 2, name: 'S2', glory: 5 }] },
    };
    expect(computeScore(gs, defs, {})).toBe(8);
  });

  it('includes cards from board, discard, and permanents', () => {
    const gs = makeGameState({
      board: [1],
      discardPile: [2],
      permanents: [3],
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 10, 1),
        3: makeInstance(3, 10, 1),
      },
    });
    const defs: Record<number, CardDef> = {
      10: { id: 10, name: 'A', states: [{ id: 1, name: 'S1', glory: 2 }] },
    };
    expect(computeScore(gs, defs, {})).toBe(6);
  });

  it('adds sticker glory to the score', () => {
    const gs = makeGameState({
      drawPile: [1],
      instances: {
        1: {
          id: 1,
          cardId: 10,
          stateId: 1,
          stickers: { 1: [101] },
          trackProgress: [],
          cumulated: 0,
        },
      },
    });
    const defs: Record<number, CardDef> = {
      10: { id: 10, name: 'A', states: [{ id: 1, name: 'S1', glory: 1 }] },
    };
    const stickers: Record<string, Sticker> = {
      101: { id: 101, type: 'add', glory: 3, description: '' },
    };
    expect(computeScore(gs, defs, stickers)).toBe(4);
  });

  it('counts 0 glory when card state has no glory field', () => {
    const gs = makeGameState({
      drawPile: [1],
      instances: { 1: makeInstance(1, 10, 1) },
    });
    const defs: Record<number, CardDef> = {
      10: { id: 10, name: 'A', states: [{ id: 1, name: 'S1' }] }, // no glory
    };
    expect(computeScore(gs, defs, {})).toBe(0);
  });

  it('counts 0 sticker glory when sticker id is not in stickers record', () => {
    const gs = makeGameState({
      drawPile: [1],
      instances: {
        1: {
          id: 1,
          cardId: 10,
          stateId: 1,
          stickers: { 1: [999] },
          trackProgress: [],
          cumulated: 0,
        },
      },
    });
    const defs: Record<number, CardDef> = {
      10: { id: 10, name: 'A', states: [{ id: 1, name: 'S1', glory: 2 }] },
    };
    // sticker 999 not in stickers map → glory from sticker = 0
    expect(computeScore(gs, defs, {})).toBe(2);
  });

  it('adds track glory from completed steps to the score', () => {
    const gs = makeGameState({
      drawPile: [1],
      instances: {
        1: {
          id: 1,
          cardId: 10,
          stateId: 1,
          stickers: {},
          trackProgress: [1, 2],
          cumulated: 0,
        },
      },
    });
    const defs: Record<number, CardDef> = {
      10: {
        id: 10,
        name: 'A',
        states: [
          {
            id: 1,
            name: 'S1',
            glory: 0,
            track: {
              steps: [
                { id: 1, cost: {}, onClick: { glory: 4 } },
                { id: 2, cost: {}, onClick: { glory: 3 } },
              ],
              inOrder: false,
              cumulative: false,
              endsTurn: false,
            },
          },
        ],
      },
    };
    expect(computeScore(gs, defs, {})).toBe(7);
  });

  it('ignores cards without a matching instance', () => {
    const gs = makeGameState({
      drawPile: [99],
      instances: {},
    });
    const defs: Record<number, CardDef> = {};
    expect(computeScore(gs, defs, {})).toBe(0);
  });
});

describe('getCurrentPhase', () => {
  it('returns "pregame" when game has not started', () => {
    const gs = makeGameState({ round: 0, drawPile: [] });
    expect(getCurrentPhase(gs)).toBe('pregame');
  });

  it('returns "preround" when round is 0 but game has started', () => {
    const gs = makeGameState({
      round: 0,
      drawPile: [1, 2, 3],
      triggerPile: { 1: { sourceInstanceId: 1, effectDef: { label: 'E1', actions: [] } } },
    });
    expect(getCurrentPhase(gs)).toBe('preround');
  });

  it('returns "roundpreview" when board is empty, turn is 0, deck is not empty, and round > 1', () => {
    const gs = makeGameState({ round: 2, board: [], turn: 0, drawPile: [1, 2] });
    expect(getCurrentPhase(gs)).toBe('roundpreview');
  });

  it('returns "playing" when in an active turn with cards on board', () => {
    const gs = makeGameState({ round: 1, board: [1], turn: 0, drawPile: [2, 3] });
    expect(getCurrentPhase(gs)).toBe('playing');
  });

  it('returns "playing" when board has cards even if turn is 0', () => {
    const gs = makeGameState({ round: 1, board: [1], turn: 0, drawPile: [2] });
    expect(getCurrentPhase(gs)).toBe('playing');
  });

  it('returns "playing" when deck is empty but board has cards', () => {
    const gs = makeGameState({ round: 2, board: [1, 2], turn: 1, drawPile: [] });
    expect(getCurrentPhase(gs)).toBe('playing');
  });

  it('returns "playing" when turn is greater than 0', () => {
    const gs = makeGameState({ round: 1, board: [], turn: 1, drawPile: [1] });
    expect(getCurrentPhase(gs)).toBe('playing');
  });

  it('does not mutate the original game state', () => {
    const gs = makeGameState({ round: 1, board: [1], turn: 0, drawPile: [2] });
    getCurrentPhase(gs);
    expect(gs.round).toBe(1);
    expect(gs.board).toEqual([1]);
  });
});

describe('mergeResources', () => {
  it('returns empty object when both inputs are empty', () => {
    expect(mergeResources({}, {})).toEqual({});
  });

  it('copies values from a when b is empty', () => {
    expect(mergeResources({ gold: 3, wood: 2 }, {})).toEqual({ gold: 3, wood: 2 });
  });

  it('copies values from b when a is empty', () => {
    expect(mergeResources({}, { gold: 5 })).toEqual({ gold: 5 });
  });

  it('additively merges overlapping keys', () => {
    expect(mergeResources({ gold: 3, wood: 1 }, { gold: 2, stone: 4 })).toEqual({
      gold: 5,
      wood: 1,
      stone: 4,
    });
  });

  it('does not mutate the first argument', () => {
    const a = { gold: 1 };
    mergeResources(a, { gold: 2 });
    expect(a.gold).toBe(1);
  });

  it('does not mutate the second argument', () => {
    const b = { gold: 2 };
    mergeResources({ gold: 1 }, b);
    expect(b.gold).toBe(2);
  });

  it('merges all resource types', () => {
    const a = { gold: 1, wood: 2, stone: 3 };
    const b = { iron: 4, weapon: 5, goods: 6 };
    expect(mergeResources(a, b)).toEqual({
      gold: 1,
      wood: 2,
      stone: 3,
      iron: 4,
      weapon: 5,
      goods: 6,
    });
  });
});
