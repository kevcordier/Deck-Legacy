import { makeDef, makeInstance, makeState, makeStickerDefs } from '../fixtures';
import { AddResourceStrategy } from '@engine/application/cardAction/AddResourceStrategy';
import { ActionEffectType, CardTag, PassiveType, TargetScope } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('AddResourceStrategy', () => {
  const strategy = new AddResourceStrategy();

  it('merges resources into game state', () => {
    const gs = makeState({ resources: { gold: 1 } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 1,
      resources: { gold: 2, wood: 3 },
    });
    expect(result.resources).toEqual({ gold: 3, wood: 3 });
  });

  it('handles empty resources payload', () => {
    const gs = makeState({ resources: { gold: 1 } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 1,
      resources: {},
    });
    expect(result.resources).toEqual({ gold: 1 });
  });

  it('applies ADJUST_ADD_RESOURCES passives to remove resources', () => {
    const defs = {
      1: makeDef({ id: 1, states: [{ id: 1, name: 'Pirate', tags: [CardTag.PERSON] }] }),
      2: makeDef({ id: 2, states: [{ id: 1, name: 'Worker', tags: [CardTag.PERSON] }] }),
    };
    const strategyWithDefs = new AddResourceStrategy(defs, makeStickerDefs());
    const gs = makeState({
      resources: { gold: 1 },
      board: [1, 2],
      instances: {
        1: makeInstance({ id: 1, cardId: 1, stateId: 1 }),
        2: makeInstance({ id: 2, cardId: 2, stateId: 1 }),
      },
      boardEffects: {
        1: [
          {
            id: 'steal_gold',
            type: PassiveType.ADJUST_ADD_RESOURCES,
            resources: { gold: -1 },
            cards: { scope: [TargetScope.BOARD], tags: [CardTag.PERSON] },
          },
        ],
      },
    });

    const result = strategyWithDefs.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 2,
      resources: { gold: 2 },
    });

    expect(result.resources).toEqual({ gold: 2 });
  });

  it('does not apply ADJUST_ADD_RESOURCES passive when source card is not in affected list', () => {
    const defs = {
      1: makeDef({ id: 1, states: [{ id: 1, name: 'Guild', tags: [CardTag.BUILDING] }] }),
      2: makeDef({ id: 2, states: [{ id: 1, name: 'Merchant', tags: [CardTag.PERSON] }] }),
    };
    const strategyWithDefs = new AddResourceStrategy(defs, makeStickerDefs());
    const gs = makeState({
      resources: { gold: 0 },
      board: [1, 2],
      instances: {
        1: makeInstance({ id: 1, cardId: 1, stateId: 1 }),
        2: makeInstance({ id: 2, cardId: 2, stateId: 1 }),
      },
      boardEffects: {
        1: [
          {
            id: 'building_only',
            type: PassiveType.ADJUST_ADD_RESOURCES,
            resources: { gold: 1 },
            cards: { scope: [TargetScope.BOARD], tags: [CardTag.BUILDING] },
          },
        ],
      },
    });
    // sourceInstanceId: 2 (PERSON) is not matched by the BUILDING filter → no adjustment
    const result = strategyWithDefs.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 2,
      resources: { gold: 2 },
    });
    expect(result.resources).toEqual({ gold: 2 });
  });

  it('applies ADJUST_ADD_RESOURCES passive using default BOARD scope when cards is absent', () => {
    const defs = {
      1: makeDef({ id: 1, states: [{ id: 1, name: 'Target' }] }),
      2: makeDef({ id: 2, states: [{ id: 1, name: 'Source' }] }),
    };
    const strategyWithDefs = new AddResourceStrategy(defs, makeStickerDefs());
    const targetInst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const sourceInst = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const gs = makeState({
      resources: { gold: 0 },
      board: [1, 2],
      instances: { 1: targetInst, 2: sourceInst },
      boardEffects: {
        2: [
          {
            id: 'no_cards_filter',
            type: PassiveType.ADJUST_ADD_RESOURCES,
            resources: { gold: 3 },
            // no cards property → defaults to { scope: [TargetScope.BOARD] }
          },
        ],
      },
    });
    // sourceInstanceId: 1 is on the board and is selected by the default BOARD scope
    const result = strategyWithDefs.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 1,
      resources: { gold: 1 },
    });
    expect(result.resources).toEqual({ gold: 4 });
  });

  it('applies ADJUST_ADD_RESOURCES passives to add resources', () => {
    const defs = {
      1: makeDef({ id: 1, states: [{ id: 1, name: 'Guild', tags: [CardTag.BUILDING] }] }),
      2: makeDef({ id: 2, states: [{ id: 1, name: 'Worker', tags: [CardTag.PERSON] }] }),
    };
    const strategyWithDefs = new AddResourceStrategy(defs, makeStickerDefs());
    const gs = makeState({
      resources: { wood: 0 },
      board: [1, 2],
      instances: {
        1: makeInstance({ id: 1, cardId: 1, stateId: 1 }),
        2: makeInstance({ id: 2, cardId: 2, stateId: 1 }),
      },
      boardEffects: {
        1: [
          {
            id: 'bonus_wood',
            type: PassiveType.ADJUST_ADD_RESOURCES,
            resources: { wood: 1 },
            cards: { scope: [TargetScope.BOARD], tags: [CardTag.PERSON] },
          },
        ],
      },
    });

    const result = strategyWithDefs.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 2,
      resources: { wood: 2 },
    });

    expect(result.resources).toEqual({ wood: 3 });
  });
});
