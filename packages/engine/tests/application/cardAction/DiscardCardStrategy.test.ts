import { makeDefs, makeInstance, makeState, makeStickerDefs } from '../fixtures';
import { DiscardCardStrategy } from '@engine/application/cardAction/DiscardCardStrategy';
import { ActionEffectType, CardTag, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

describe('DiscardCardStrategy', () => {
  const defs = makeDefs();
  const stickerDefs = makeStickerDefs();
  const strategy = new DiscardCardStrategy(defs, stickerDefs);

  it('discards the target card', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.DISCARD_CARD,
      sourceInstanceId: 1,
      instanceIds: [2],
    });
    expect(result.discardPile).toContain(2);
    expect(result.board).not.toContain(2);
  });

  it('sets lastDiscardedCards', () => {
    const inst = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [3], instances: { 3: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.DISCARD_CARD,
      sourceInstanceId: 1,
      instanceIds: [3],
    });
    expect(result.lastDiscardedCards).toEqual([3]);
  });

  it('fires the ON_DISCARD action of a card in play whose triggeredBy matches a discarded card', () => {
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'Person', states: [{ id: 1, name: 'Person', tags: [CardTag.PERSON] }] },
      2: {
        id: 2,
        name: 'Building',
        states: [{ id: 1, name: 'Building', tags: [CardTag.BUILDING] }],
      },
      3: {
        id: 3,
        name: 'Potion',
        states: [
          {
            id: 1,
            name: 'Potion',
            actions: [
              {
                id: 'p1',
                trigger: Trigger.ON_DISCARD,
                triggeredBy: { scope: [TargetScope.DISCARDED], tags: [CardTag.PERSON] },
                actionEffects: [{ id: 1, type: ActionEffectType.ADD_RESOURCES }],
              },
            ],
          },
        ],
      },
    };
    const gs = makeState({
      board: [10, 11, 20],
      instances: {
        10: makeInstance({ id: 10, cardId: 1, stateId: 1 }),
        11: makeInstance({ id: 11, cardId: 2, stateId: 1 }),
        20: makeInstance({ id: 20, cardId: 3, stateId: 1 }),
      },
    });
    const discard = (id: number) =>
      new DiscardCardStrategy(defs, stickerDefs).apply(gs, {
        id: 'x',
        type: ActionEffectType.DISCARD_CARD,
        sourceInstanceId: 1,
        instanceIds: [id],
      });
    expect(Object.values(discard(10).triggerPile).map(t => t.sourceInstanceId)).toEqual([20]);
    expect(discard(11).triggerPile).toEqual({});
  });

  it('handles empty instanceIds gracefully', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.DISCARD_CARD,
      sourceInstanceId: 1,
      instanceIds: [],
    });
    expect(result.discardPile).toHaveLength(0);
  });

  it('handles missing instanceIds gracefully', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.DISCARD_CARD,
      sourceInstanceId: 1,
    });
    expect(result.discardPile).toHaveLength(0);
  });
});
