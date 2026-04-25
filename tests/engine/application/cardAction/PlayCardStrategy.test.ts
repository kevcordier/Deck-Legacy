import { makeInstance, makeState } from '../fixtures';
import { PlayCardStrategy } from '@engine/application/cardAction/PlayCardStrategy';
import { ActionEffectType, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const plainDef: CardDef = { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] };
const onPlayDef: CardDef = {
  id: 2,
  name: 'OnPlay',
  states: [
    {
      id: 1,
      name: 'S',
      actions: [{ id: 'a1', actionEffects: [], trigger: Trigger.ON_PLAY }],
    },
  ],
};

describe('PlayCardStrategy', () => {
  it('returns state unchanged when instanceIds missing', () => {
    const strategy = new PlayCardStrategy({});
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.PLAY_CARD,
      sourceInstanceId: 1,
    });
    expect(result).toBe(gs);
  });

  it('returns state unchanged when instanceIds is empty', () => {
    const strategy = new PlayCardStrategy({});
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.PLAY_CARD,
      sourceInstanceId: 1,
      instanceIds: [],
    });
    expect(result).toBe(gs);
  });

  it('moves card from drawPile to board', () => {
    const defs = { 1: plainDef };
    const strategy = new PlayCardStrategy(defs);
    const inst = makeInstance({ id: 10, cardId: 1, stateId: 1 });
    const gs = makeState({ drawPile: [10], instances: { 10: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.PLAY_CARD,
      sourceInstanceId: 99,
      instanceIds: [10],
    });
    expect(result.board).toContain(10);
    expect(result.drawPile).not.toContain(10);
  });

  it('removes card from discardPile and destroyedPile if present', () => {
    const defs = { 1: plainDef };
    const strategy = new PlayCardStrategy(defs);
    const inst = makeInstance({ id: 10, cardId: 1, stateId: 1 });
    const gs = makeState({
      discardPile: [10],
      destroyedPile: [10],
      instances: { 10: inst },
    });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.PLAY_CARD,
      sourceInstanceId: 99,
      instanceIds: [10],
    });
    expect(result.discardPile).not.toContain(10);
    expect(result.destroyedPile).not.toContain(10);
    expect(result.board).toContain(10);
  });

  it('sets lastDrawnCards to played instances', () => {
    const defs = { 1: plainDef };
    const strategy = new PlayCardStrategy(defs);
    const inst = makeInstance({ id: 10, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 10: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.PLAY_CARD,
      sourceInstanceId: 99,
      instanceIds: [10],
    });
    expect(result.lastDrawnCards).toEqual([10]);
  });

  it('enqueues ON_PLAY trigger for cards with matching action', () => {
    const defs = { 2: onPlayDef };
    const strategy = new PlayCardStrategy(defs);
    const inst = makeInstance({ id: 20, cardId: 2, stateId: 1 });
    const gs = makeState({ instances: { 20: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.PLAY_CARD,
      sourceInstanceId: 99,
      instanceIds: [20],
    });
    expect(Object.keys(result.triggerPile)).toHaveLength(1);
  });
});
