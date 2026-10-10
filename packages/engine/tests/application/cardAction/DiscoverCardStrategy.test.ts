import { makeInstance, makeState } from '../fixtures';
import { DiscoverCardStrategy } from '@engine/application/cardAction/DiscoverCardStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const plainDef: CardDef = { id: 1, name: 'Plain', states: [{ id: 1, name: 'S' }] };
const permanentDef: CardDef = {
  id: 2,
  name: 'Perm',
  states: [{ id: 1, name: 'S', permanent: true }],
};
const permanentWithPassiveDef: CardDef = {
  id: 4,
  name: 'PermPassive',
  states: [
    {
      id: 1,
      name: 'S',
      permanent: true,
      passives: [{ id: 'stay', type: 'STAY_IN_PLAY' as never }],
    },
  ],
};
const parchmentDef: CardDef = {
  id: 3,
  name: 'Parch',
  parchmentCard: true,
  states: [{ id: 1, name: 'S' }],
};

describe('DiscoverCardStrategy', () => {
  it('moves a plain card to discardPile and adds to lastAddedIds', () => {
    const defs = { 1: plainDef };
    const strategy = new DiscoverCardStrategy(defs);
    const inst = makeInstance({ id: 10, cardId: 1, stateId: 1 });
    const gs = makeState({ discoveryPile: [10], instances: { 10: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.DISCOVER_CARD,
      sourceInstanceId: 99,
      instanceIds: [10],
    });
    expect(result.lastAddedCards).toContain(10);
    expect(result.discardPile).toContain(10);
    expect(result.discoveryPile).not.toContain(10);
  });

  it('moves a permanent card to permanents', () => {
    const defs = { 2: permanentDef };
    const strategy = new DiscoverCardStrategy(defs);
    const inst = makeInstance({ id: 20, cardId: 2, stateId: 1 });
    const gs = makeState({ discoveryPile: [20], instances: { 20: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.DISCOVER_CARD,
      sourceInstanceId: 99,
      instanceIds: [20],
    });
    expect(result.permanents).toContain(20);
    expect(result.lastAddedCards).toContain(20);
    expect(result.discoveryPile).not.toContain(20);
  });

  it('adds permanent passives to boardEffects', () => {
    const defs = { 4: permanentWithPassiveDef };
    const strategy = new DiscoverCardStrategy(defs);
    const inst = makeInstance({ id: 40, cardId: 4, stateId: 1 });
    const gs = makeState({ discoveryPile: [40], instances: { 40: inst } });

    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.DISCOVER_CARD,
      sourceInstanceId: 99,
      instanceIds: [40],
    });

    expect(result.boardEffects[40]).toEqual([{ id: 'stay', type: 'STAY_IN_PLAY' }]);
  });

  it('removes a parchment card from discoveryPile without adding to lastAddedIds', () => {
    const defs = { 3: parchmentDef };
    const strategy = new DiscoverCardStrategy(defs);
    const inst = makeInstance({ id: 30, cardId: 3, stateId: 1 });
    const gs = makeState({ discoveryPile: [30], instances: { 30: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.DISCOVER_CARD,
      sourceInstanceId: 99,
      instanceIds: [30],
    });
    expect(result.discoveryPile).not.toContain(30);
    expect(result.lastAddedCards).not.toContain(30);
  });

  it('handles empty instanceIds gracefully', () => {
    const strategy = new DiscoverCardStrategy({});
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.DISCOVER_CARD,
      sourceInstanceId: 99,
      instanceIds: [],
    });
    expect(result.lastAddedCards).toHaveLength(0);
  });

  it('handles missing instanceIds gracefully', () => {
    const strategy = new DiscoverCardStrategy({});
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.DISCOVER_CARD,
      sourceInstanceId: 99,
      // no instanceIds → falls back to []
    });
    expect(result.lastAddedCards).toHaveLength(0);
  });
});
