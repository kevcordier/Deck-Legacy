import { makeInstance, makeState, makeStickerDefs } from '../fixtures';
import { DiscoverCardStrategy } from '@engine/application/cardAction/DiscoverCardStrategy';
import { ActionEffectType, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const plainDef: CardDef = { id: 1, name: 'Plain', states: [{ id: 1, name: 'S' }] };
const permanentDef: CardDef = {
  id: 2,
  name: 'Perm',
  permanent: true,
  states: [{ id: 1, name: 'S' }],
};
const parchmentDef: CardDef = {
  id: 3,
  name: 'Parch',
  parchmentCard: true,
  states: [{ id: 1, name: 'S' }],
};
const onDiscoverDef: CardDef = {
  id: 4,
  name: 'OnDiscover',
  states: [
    {
      id: 1,
      name: 'S',
      actions: [{ id: 'a1', actionEffects: [], trigger: Trigger.ON_DISCOVER }],
    },
  ],
};

describe('DiscoverCardStrategy', () => {
  it('moves a plain card to discardPile and adds to lastAddedIds', () => {
    const defs = { 1: plainDef };
    const strategy = new DiscoverCardStrategy(defs, makeStickerDefs());
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
    const strategy = new DiscoverCardStrategy(defs, makeStickerDefs());
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

  it('removes a parchment card from discoveryPile without adding to lastAddedIds', () => {
    const defs = { 3: parchmentDef };
    const strategy = new DiscoverCardStrategy(defs, makeStickerDefs());
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

  it('enqueues ON_DISCOVER trigger for cards with matching action', () => {
    const defs = { 4: onDiscoverDef };
    const strategy = new DiscoverCardStrategy(defs, makeStickerDefs());
    const inst = makeInstance({ id: 40, cardId: 4, stateId: 1 });
    const gs = makeState({ discoveryPile: [40], instances: { 40: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.DISCOVER_CARD,
      sourceInstanceId: 99,
      instanceIds: [40],
    });
    expect(Object.keys(result.triggerPile)).toHaveLength(1);
  });

  it('handles empty instanceIds gracefully', () => {
    const strategy = new DiscoverCardStrategy({}, makeStickerDefs());
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
    const strategy = new DiscoverCardStrategy({}, makeStickerDefs());
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
