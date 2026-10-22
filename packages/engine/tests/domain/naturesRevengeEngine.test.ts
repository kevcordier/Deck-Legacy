import { makeInstance, makeState } from './fixtures';
import { GameAggregate } from '@engine/domain/aggregates/GameAggregate';
import { cardSelector } from '@engine/domain/cards/selection/cardSelector';
import { resolveActionEffect } from '@engine/domain/effects/resolveActionEffect';
import { ActionEffectType, CardTag, Phase, TargetScope } from '@engine/domain/enums';
import type { CardAction, CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const land: CardDef = {
  id: 1,
  name: 'Land',
  states: [{ id: 1, name: 'Land', tags: [CardTag.LAND], productions: [{ gold: 1 }] }],
};
const growing: CardDef = {
  id: 2,
  name: 'Growing',
  states: [
    { id: 1, name: 'Young', tags: [CardTag.BUILDING], upgrade: [{ cost: {}, upgradeTo: 2 }] },
    { id: 2, name: 'Old', tags: [CardTag.BUILDING] },
  ],
};
const event: CardDef = {
  id: 3,
  name: 'Event',
  states: [{ id: 1, name: 'Event', tags: [CardTag.EVENT], glory: { amount: 4, whenPurged: -5 } }],
};
const defs = { 1: land, 2: growing, 3: event };

function play(action: CardAction) {
  const state = makeState({
    phase: Phase.PLAYING,
    board: [1, 2, 9],
    drawPile: [3],
    instances: {
      1: makeInstance({ id: 1, cardId: 1, stateId: 1 }),
      2: makeInstance({ id: 2, cardId: 1, stateId: 1 }),
      3: makeInstance({ id: 3, cardId: 3, stateId: 1 }),
      9: makeInstance({ id: 9, cardId: 3, stateId: 1 }),
    },
  });
  const agg = new GameAggregate(crypto.randomUUID(), state, defs, {}, []);
  agg.cardAction({ unlimited: true, ...action }, 9);
  return agg;
}

describe("Effects added for Nature's Revenge", () => {
  it('SEQUENCE resolves its effects in order', () => {
    const agg = play({
      id: 'seq',
      actionEffects: [
        {
          id: 1,
          type: ActionEffectType.SEQUENCE,
          effects: [
            { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } },
            { id: 2, type: ActionEffectType.ADD_RESOURCES, resources: { wood: 2 } },
          ],
        },
      ],
    });
    expect(agg.getGameState().resources).toEqual({ gold: 1, wood: 2 });
  });

  it('END_TURN ends the turn once the action is resolved', () => {
    const agg = play({ id: 'end', actionEffects: [{ id: 1, type: ActionEffectType.END_TURN }] });
    expect(agg.getGameState().phase).toBe(Phase.TURN_END);
  });

  it('each repeats the effect for every matching card, its production only', () => {
    const agg = play({
      id: 'each',
      actionEffects: [
        {
          id: 1,
          type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
          resourceScopes: ['production'],
          resources: { choice: [{ any: 1 }] },
          cards: { scope: [TargetScope.BOARD], tags: [CardTag.LAND], each: true },
        },
      ],
    });
    const { instances } = agg.getGameState();
    expect(instances[1].removedResourcesByState?.[1]?.production).toEqual(['gold']);
    expect(instances[2].removedResourcesByState?.[1]?.production).toEqual(['gold']);
  });

  it('selects the fully upgraded cards', () => {
    const state = makeState({
      board: [4, 5],
      instances: {
        4: makeInstance({ id: 4, cardId: 2, stateId: 1 }),
        5: makeInstance({ id: 5, cardId: 2, stateId: 2 }),
      },
    });
    const ids = cardSelector(
      { scope: [TargetScope.BOARD], fullyUpgraded: true },
      99,
      state,
      defs,
      {},
    );
    expect(ids).toEqual([5]);
  });

  it('crosses out the only resource a known card produces without asking', () => {
    const state = makeState({ instances: { 1: makeInstance({ id: 1, cardId: 1, stateId: 1 }) } });
    const [resolved, pending] = resolveActionEffect(
      {
        id: 1,
        type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
        resourceScopes: ['production'],
        resources: { choice: [{ any: 1 }] },
        cards: { ids: [1] },
      },
      9,
      state,
      defs,
      {},
    );
    expect(pending).toEqual([]);
    expect(resolved.resources).toEqual({ gold: 1 });
  });
});

describe("Purge added for Nature's Revenge", () => {
  function purgeEvents() {
    const state = makeState({
      phase: Phase.GAME_OVER,
      drawPile: [1, 3, 9],
      instances: {
        1: makeInstance({ id: 1, cardId: 1, stateId: 1 }),
        3: makeInstance({ id: 3, cardId: 3, stateId: 1 }),
        9: makeInstance({ id: 9, cardId: 3, stateId: 1 }),
      },
    });
    const agg = new GameAggregate(crypto.randomUUID(), state, defs, {}, []);
    agg.selectExpansion('Nature', {
      purge: { permanent: 0, purge: 3, firstBatch: { picks: 1, tags: [CardTag.EVENT] } },
      campaign: [],
    });
    return agg;
  }

  it('first offers the friendly events', () => {
    const agg = purgeEvents();
    expect([...agg.getPurgeCandidates()].sort((a, b) => a - b)).toEqual([3, 9]);
  });

  it('counts the glory a card has when purged', () => {
    const agg = purgeEvents();
    agg.selectPurgeCard(3);
    while (agg.getPurgeCandidates().length > 0) agg.selectPurgeCard(agg.getPurgeCandidates()[0]);
    agg.finalizePurge();
    const glory = agg.getGameState().purgedGlory;
    expect(glory.at(-1)).toBeLessThanOrEqual(-5);
  });
});

describe('The first cards of the deck', () => {
  it('can be chosen among', () => {
    const state = makeState({
      drawPile: [1, 2, 3],
      instances: {
        1: makeInstance({ id: 1, cardId: 1, stateId: 1 }),
        2: makeInstance({ id: 2, cardId: 1, stateId: 1 }),
        3: makeInstance({ id: 3, cardId: 1, stateId: 1 }),
      },
    });
    expect(cardSelector({ topOfDeck: 2 }, 99, state, defs, {})).toEqual([1, 2]);
  });
});
