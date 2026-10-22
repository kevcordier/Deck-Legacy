import { makeInstance, makeState } from './fixtures';
import { cardSelector } from '@engine/domain/cards/selection/cardSelector';
import { CardTag, PassiveType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const troop: CardDef = {
  id: 1,
  name: 'Troop',
  states: [
    {
      id: 1,
      name: 'Troop',
      tags: [CardTag.ENEMY],
      passives: [{ id: 'count', type: PassiveType.COUNT_AS, amount: 5 }],
    },
  ],
};
const lone: CardDef = {
  id: 2,
  name: 'Lone',
  states: [{ id: 1, name: 'Lone', tags: [CardTag.ENEMY] }],
};

describe('COUNT_AS', () => {
  it('makes an Enemy Troop count as 5 enemies', () => {
    const state = makeState({
      board: [1, 2],
      instances: {
        1: makeInstance({ id: 1, cardId: 1, stateId: 1 }),
        2: makeInstance({ id: 2, cardId: 2, stateId: 1 }),
      },
    });
    const enemies = cardSelector(
      { scope: [TargetScope.BOARD], tags: [CardTag.ENEMY] },
      99,
      state,
      { 1: troop, 2: lone },
      {},
    );
    expect(enemies).toHaveLength(6);
  });
});

describe('Top card of the deck', () => {
  it('keeps it only when it matches "friendly"', () => {
    const enemy: CardDef = {
      id: 3,
      name: 'E',
      states: [{ id: 1, name: 'E', negative: true }],
    };
    const state = makeState({
      drawPile: [3, 2],
      instances: {
        2: makeInstance({ id: 2, cardId: 2, stateId: 1 }),
        3: makeInstance({ id: 3, cardId: 3, stateId: 1 }),
      },
    });
    const defs = { 2: lone, 3: enemy };
    const top = (scope: TargetScope[]) => cardSelector({ scope }, 99, state, defs, {});
    expect(top([TargetScope.TOP_OF_DECK, TargetScope.FRIENDLY])).toEqual([]);
    expect(top([TargetScope.TOP_OF_DECK, TargetScope.ENEMY])).toEqual([3]);
    expect(top([TargetScope.TOP_OF_DECK])).toEqual([3]);
  });
});
