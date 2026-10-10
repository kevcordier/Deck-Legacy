import { makeDefs, makeInstance, makeState, makeStickerDefs } from '../fixtures';
import { DiscardCardStrategy } from '@engine/application/cardAction/DiscardCardStrategy';
import { ActionEffectType, CardTag, PassiveType, TargetScope, Trigger } from '@engine/domain/enums';
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

  it('fires ON_DISCARD board effect trigger when discard matches filter', () => {
    const personInst = makeInstance({ id: 10, cardId: 1, stateId: 1 });
    const potionInst = makeInstance({ id: 20, cardId: 1, stateId: 1 });
    const personDef = makeDefs({
      id: 1,
      states: [{ id: 1, name: 'Person', tags: [CardTag.PERSON] }],
    });
    const gs = makeState({
      board: [10, 20],
      instances: { 10: personInst, 20: potionInst },
      boardEffects: {
        20: [
          {
            id: 'p1',
            type: PassiveType.ADD_TRIGGER,
            trigger: {
              id: 'p1',
              type: Trigger.ON_DISCARD,
              cards: { scope: [TargetScope.DISCARDED], tags: [CardTag.PERSON] },
              actions: [
                {
                  id: 1,
                  type: ActionEffectType.ADD_RESOURCES,
                },
              ],
            },
          },
        ],
      },
    });
    const strategyWithDefs = new DiscardCardStrategy(personDef, stickerDefs);
    const result = strategyWithDefs.apply(gs, {
      id: 'x',
      type: ActionEffectType.DISCARD_CARD,
      sourceInstanceId: 1,
      instanceIds: [10],
    });
    expect(Object.keys(result.triggerPile)).toHaveLength(1);
  });

  it('does not fire ON_DISCARD trigger when discarded card does not match filter', () => {
    const buildingInst = makeInstance({ id: 11, cardId: 1, stateId: 1 });
    const potionInst = makeInstance({ id: 21, cardId: 1, stateId: 1 });
    const buildingDef = makeDefs({
      id: 1,
      states: [{ id: 1, name: 'Building', tags: [CardTag.BUILDING] }],
    });
    const gs = makeState({
      board: [11, 21],
      instances: { 11: buildingInst, 21: potionInst },
      boardEffects: {
        21: [
          {
            id: 'p1',
            type: PassiveType.ADD_TRIGGER,
            trigger: {
              id: 'p1',
              type: Trigger.ON_DISCARD,
              cards: { scope: [TargetScope.DISCARDED], tags: [CardTag.PERSON] },
              actions: [{ id: 1, type: ActionEffectType.ADD_RESOURCES }],
            },
          },
        ],
      },
    });
    const strategyWithDefs = new DiscardCardStrategy(buildingDef, stickerDefs);
    const result = strategyWithDefs.apply(gs, {
      id: 'x',
      type: ActionEffectType.DISCARD_CARD,
      sourceInstanceId: 1,
      instanceIds: [11],
    });
    expect(Object.keys(result.triggerPile)).toHaveLength(0);
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
