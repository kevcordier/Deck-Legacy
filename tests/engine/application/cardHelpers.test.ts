import { makeInstance, makeState, makeStickerDefs } from './fixtures';
import {
  canAffordCost,
  canAffordResources,
  canAffordTrackAdvanceCost,
  cardIsBlocked,
  cardShouldStayInPlay,
  evaluateCondition,
  getActiveState,
  getAffectedCardsByBoardEffects,
  getEffectiveActionCost,
  getEffectiveGlory,
  getEffectiveProductions,
  getEffectiveUpgradeCost,
  getFirstAvailableTrackStep,
  getInstancesTriggerEffects,
  getProductionChoicesForAction,
  getTotalProduction,
  getTotalResourceProduction,
  tagClass,
} from '@engine/application/cardHelpers';
import {
  ActionEffectType,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef, Sticker } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

// ─── getAffectedCardsByBoardEffects ──────────────────────────────────────────

describe('getAffectedCardsByBoardEffects', () => {
  it('returns empty when no board effects', () => {
    const gs = makeState();
    expect(getAffectedCardsByBoardEffects(gs, PassiveType.BLOCK)).toEqual({});
  });

  it('returns affected ids from board effects', () => {
    const gs = makeState({
      boardEffects: {
        1: [{ id: 'block', type: PassiveType.BLOCK, cards: { ids: [5, 6] } }],
      },
    });
    const result = getAffectedCardsByBoardEffects(gs, PassiveType.BLOCK);
    expect(result[1]).toEqual([5, 6]);
  });

  it('defaults to sourceId when cards.ids is absent', () => {
    const gs = makeState({
      boardEffects: {
        7: [{ id: 'block', type: PassiveType.BLOCK }],
      },
    });
    const result = getAffectedCardsByBoardEffects(gs, PassiveType.BLOCK);
    expect(result[7]).toEqual([7]);
  });

  it('ignores effects of a different passive type', () => {
    const gs = makeState({
      boardEffects: {
        1: [{ id: 'sip', type: PassiveType.STAY_IN_PLAY }],
      },
    });
    expect(getAffectedCardsByBoardEffects(gs, PassiveType.BLOCK)).toEqual({});
  });

  it('accumulates multiple effects for same source', () => {
    const gs = makeState({
      boardEffects: {
        1: [
          { id: 'b1', type: PassiveType.BLOCK, cards: { ids: [2] } },
          { id: 'b2', type: PassiveType.BLOCK, cards: { ids: [3] } },
        ],
      },
    });
    const result = getAffectedCardsByBoardEffects(gs, PassiveType.BLOCK);
    expect(result[1]).toEqual([2, 3]);
  });
});

// ─── getEffectiveProductions ──────────────────────────────────────────────────

describe('getEffectiveProductions', () => {
  const baseInst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
  const defs: Record<number, CardDef> = {
    1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
  };

  it('returns base production unchanged when no extras', () => {
    const gs = makeState({ instances: { 1: baseInst } });
    expect(getEffectiveProductions({ gold: 2 }, gs, defs, baseInst, {})).toEqual({ gold: 2 });
  });

  it('adds sticker production bonus for stickers on current state', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, stickers: { 1: [1] } });
    const gs = makeState({ instances: { 1: inst } });
    const result = getEffectiveProductions({ gold: 1 }, gs, defs, inst, makeStickerDefs(1));
    expect(result.gold).toBe(2);
  });

  it('skips sticker when sticker def is not found', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, stickers: { 1: [99] } });
    const gs = makeState({ instances: { 1: inst } });
    expect(getEffectiveProductions({ gold: 1 }, gs, defs, inst, {})).toEqual({ gold: 1 });
  });

  it('skips sticker when sticker def has no production field', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, stickers: { 1: [5] } });
    const gs = makeState({ instances: { 1: inst } });
    const noProductionSticker: Record<number, Sticker> = { 5: { id: 5 } };
    expect(getEffectiveProductions({ gold: 1 }, gs, defs, inst, noProductionSticker)).toEqual({
      gold: 1,
    });
  });

  it('adds ADJUST_PRODUCTION passive bonus via valuePerElement cards selector', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [1, 2],
      instances: { 1: inst, 2: inst2 },
      boardEffects: {
        2: [
          {
            id: 'p1',
            type: PassiveType.ADJUST_PRODUCTION,
            resources: { [ResourceType.GOLD]: 1 },
            cards: { scope: [TargetScope.BOARD] },
            valuePerElement: {
              amount: 1,
              cards: { scope: [TargetScope.BOARD] },
            },
          },
        ],
      },
    });
    const result = getEffectiveProductions({ gold: 1 }, gs, defs, inst, {});
    expect(result.gold).toBe(2);
  });

  it('adds ADJUST_PRODUCTION board effect bonus without valuePerElement', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [1],
      instances: { 1: inst },
      boardEffects: {
        2: [
          {
            id: 'p2',
            type: PassiveType.ADJUST_PRODUCTION,
            resources: { [ResourceType.GOLD]: 2 },
            cards: { ids: [1] },
          },
        ],
      },
    });

    const result = getEffectiveProductions({ gold: 1 }, gs, defs, inst, {});
    expect(result.gold).toBe(3);
  });

  it('adds ADJUST_PRODUCTION passive bonus via accumulation', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, cumulated: 3 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [1, 2],
      instances: { 1: inst, 2: inst2 },
      boardEffects: {
        2: [
          {
            id: 'p1',
            type: PassiveType.ADJUST_PRODUCTION,
            resources: { [ResourceType.GOLD]: 2 },
            cards: { scope: [TargetScope.BOARD] },
            valuePerElement: {
              amount: 2,
              accumulation: true,
            },
          },
        ],
      },
    });
    const result = getEffectiveProductions({}, gs, defs, inst, {});
    expect(result.gold).toBe(6);
  });

  it('does not add passive bonus when count is zero', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, cumulated: 0 });
    const defsWithPassive: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'C',
        states: [
          {
            id: 1,
            name: 'S',
            passives: [
              {
                id: 'p1',
                type: PassiveType.ADJUST_PRODUCTION,
                resources: { [ResourceType.GOLD]: 1 },
                valuePerElement: {
                  amount: 2,
                  accumulation: true,
                },
              },
            ],
          },
        ],
      },
    };
    const gs = makeState({ instances: { 1: inst } });
    expect(getEffectiveProductions({}, gs, defsWithPassive, inst, {})).toEqual({});
  });

  it('does not add passive bonus when valuePerElement has neither cards nor accumulation', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defsWithPassive: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'C',
        states: [
          {
            id: 1,
            name: 'S',
            passives: [
              {
                id: 'p1',
                type: PassiveType.ADJUST_PRODUCTION,
                resources: { [ResourceType.GOLD]: 1 },
                valuePerElement: {
                  amount: 5,
                  // no cards, no accumulation → count stays 0
                },
              },
            ],
          },
        ],
      },
    };
    const gs = makeState({ instances: { 1: inst } });
    expect(getEffectiveProductions({}, gs, defsWithPassive, inst, {})).toEqual({});
  });

  it('adds ADJUST_PRODUCTION board effect bonus when instance is targeted', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [2],
      instances: { 2: inst },
      boardEffects: {
        1: [
          {
            id: 'be',
            type: PassiveType.ADJUST_PRODUCTION,
            resources: { wood: 2 },
            cards: { scope: [TargetScope.BOARD] },
          },
        ],
      },
    });
    const result = getEffectiveProductions({}, gs, defs, inst, {});
    expect(result.wood).toBe(2);
  });

  it('applies board effect bonus with default BOARD target on source card itself', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [1],
      instances: { 1: inst },
      boardEffects: {
        1: [
          {
            id: 'be-self',
            type: PassiveType.ADJUST_PRODUCTION,
            resources: { iron: 1 },
            cards: { scope: [TargetScope.ANY], ids: [1] },
          },
        ],
      },
    });

    const result = getEffectiveProductions({}, gs, defs, inst, {});
    expect(result.iron).toBe(1);
  });

  it('excludes board effects when includeBoardEffects is false', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [2],
      instances: { 2: inst },
      boardEffects: {
        1: [
          {
            id: 'be',
            type: PassiveType.ADJUST_PRODUCTION,
            resources: { wood: 2 },
            cards: { scope: [TargetScope.BOARD] },
          },
        ],
      },
    });
    const result = getEffectiveProductions({}, gs, defs, inst, {}, false);
    expect(result.wood).toBeUndefined();
  });

  it('excludes passives when includePassives is false', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, cumulated: 5 });
    const defsWithPassive: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'C',
        states: [
          {
            id: 1,
            name: 'S',
            passives: [
              {
                id: 'p1',
                type: PassiveType.ADJUST_PRODUCTION,
                resources: { [ResourceType.GOLD]: 1 },
                valuePerElement: {
                  amount: 1,
                  accumulation: true,
                },
              },
            ],
          },
        ],
      },
    };
    const gs = makeState({ instances: { 1: inst } });
    const result = getEffectiveProductions({}, gs, defsWithPassive, inst, {}, false);
    expect(result).toEqual({});
  });

  it('uses default BOARD scope for ADJUST_PRODUCTION board effect with no cards field', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [2],
      instances: { 2: inst },
      boardEffects: {
        1: [
          {
            id: 'be',
            type: PassiveType.ADJUST_PRODUCTION,
            resources: { stone: 1 },
            // no cards field → defaults to { scope: [TargetScope.BOARD] }
          },
        ],
      },
    });
    const result = getEffectiveProductions({}, gs, defs, inst, {});
    expect(result.stone).toBe(1);
  });

  it('reduces production resources by 1 when configured in removedResourcesByState', () => {
    const inst = makeInstance({
      id: 1,
      cardId: 1,
      stateId: 1,
      removedResourcesByState: { 1: { production: [ResourceType.GOLD] } },
    });
    const gs = makeState({ instances: { 1: inst } });
    const result = getEffectiveProductions({ gold: 3, wood: 1 }, gs, defs, inst, {});
    expect(result).toEqual({ gold: 2, wood: 1 });
  });

  it('does not auto-replace production when REPLACE_RESOURCE_PRODUCTION is present', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defsWithReplacePassive: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'C',
        states: [
          {
            id: 1,
            name: 'S',
            passives: [
              {
                id: 'replace-prod',
                type: PassiveType.REPLACE_RESOURCE_PRODUCTION,
                resources: { gold: 1, goods: 1 },
              },
            ],
          },
        ],
      },
    };
    const gs = makeState({ instances: { 1: inst } });

    const result = getEffectiveProductions(
      { gold: 2, wood: 1 },
      gs,
      defsWithReplacePassive,
      inst,
      {},
    );

    expect(result).toEqual({ gold: 2, wood: 1 });
  });

  it('offers player both production choices when state passive REPLACE_RESOURCE_PRODUCTION is present', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defsWithReplacePassive: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'C',
        states: [
          {
            id: 1,
            name: 'S',
            passives: [
              {
                id: 'replace-prod',
                type: PassiveType.REPLACE_RESOURCE_PRODUCTION,
                resources: { gold: 1, goods: 1 },
              },
            ],
          },
        ],
      },
    };
    const gs = makeState({ instances: { 1: inst } });

    const result = getProductionChoicesForAction(
      { gold: 2, wood: 1 },
      gs,
      defsWithReplacePassive,
      inst,
      {},
    );

    expect(result).toEqual([
      { gold: 2, wood: 1 },
      { wood: 1, goods: 2 },
    ]);
  });

  it('offers player both production choices when board effect REPLACE_RESOURCE_PRODUCTION targets the card', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [2],
      instances: { 2: inst },
      boardEffects: {
        1: [
          {
            id: 'replace-board',
            type: PassiveType.REPLACE_RESOURCE_PRODUCTION,
            resources: { gold: 1, goods: 1 },
            cards: { ids: [2] },
          },
        ],
      },
    });

    const result = getProductionChoicesForAction({ gold: 3 }, gs, defs, inst, {});

    expect(result).toEqual([{ gold: 3 }, { goods: 3 }]);
  });

  it('uses default BOARD selector when replacement board effect has no cards field', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [2],
      instances: { 2: inst },
      boardEffects: {
        1: [
          {
            id: 'replace-board-default-target',
            type: PassiveType.REPLACE_RESOURCE_PRODUCTION,
            resources: { gold: 1, goods: 1 },
          },
        ],
      },
    });

    const result = getProductionChoicesForAction({ gold: 1 }, gs, defs, inst, {});

    expect(result).toEqual([{ gold: 1 }, { goods: 1 }]);
  });

  it('keeps production unchanged when replacement source resource amount is zero', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [2],
      instances: { 2: inst },
      boardEffects: {
        1: [
          {
            id: 'replace-board',
            type: PassiveType.REPLACE_RESOURCE_PRODUCTION,
            resources: { gold: 1, goods: 1 },
            cards: { ids: [2] },
          },
        ],
      },
    });

    const result = getProductionChoicesForAction({ wood: 1 }, gs, defs, inst, {});

    expect(result).toEqual([{ wood: 1 }]);
  });

  it('ignores malformed replacement passives and non replacement board effects', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const defsWithMalformedReplace: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'C',
        states: [
          {
            id: 1,
            name: 'S',
            passives: [
              {
                id: 'state-no-res',
                type: PassiveType.REPLACE_RESOURCE_PRODUCTION,
              },
              {
                id: 'state-one-resource',
                type: PassiveType.REPLACE_RESOURCE_PRODUCTION,
                resources: { gold: 1, goods: 0 },
              },
            ],
          },
        ],
      },
    };

    const gs = makeState({
      board: [2],
      instances: { 2: inst },
      boardEffects: {
        1: [
          {
            id: 'not-replace',
            type: PassiveType.BLOCK,
            cards: { ids: [2] },
          },
        ],
      },
    });

    const result = getProductionChoicesForAction(
      { gold: 0, wood: 2 },
      gs,
      defsWithMalformedReplace,
      inst,
      {},
    );

    expect(result).toEqual([{ gold: 0, wood: 2 }]);
  });

  it('ignores undefined resource values while serializing production choices', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 1: inst } });

    const result = getProductionChoicesForAction({ gold: undefined, wood: 1 }, gs, defs, inst, {});

    expect(result).toEqual([{ gold: undefined, wood: 1 }]);
  });
});

describe('evaluateCondition resource branch', () => {
  it('uses zero as fallback for missing resource key', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 1: inst }, resources: {} });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
    };

    const ok = evaluateCondition(
      { type: 'resource', resourceType: ResourceType.GOLD, min: 0 },
      gs,
      1,
      defs,
      {},
    );
    const ko = evaluateCondition(
      { type: 'resource', resourceType: ResourceType.GOLD, min: 1 },
      gs,
      1,
      defs,
      {},
    );

    expect(ok).toBe(true);
    expect(ko).toBe(false);
  });
});

describe('getEffectiveUpgradeCost', () => {
  it('applies ADJUST_UPDATE_COST on targeted upgrade costs', () => {
    const source = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const target = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'Aura', states: [{ id: 1, name: 'Aura' }] },
      2: { id: 2, name: 'Builder', states: [{ id: 1, name: 'Builder' }] },
    };
    const gs = makeState({
      board: [1, 2],
      instances: { 1: source, 2: target },
      boardEffects: {
        1: [
          {
            id: 'adjust_upgrade',
            type: PassiveType.ADJUST_UPDATE_COST,
            resources: { gold: -1, wood: 1 },
            cards: { scope: [TargetScope.BOARD], ids: [2] },
          },
        ],
      },
    });

    const result = getEffectiveUpgradeCost(
      { resources: [{ gold: 2 }] },
      gs,
      defs,
      makeStickerDefs(),
      2,
    );

    expect(result.resources?.[0]).toEqual({ gold: 1, wood: 1 });
  });

  it('does not apply ADJUST_UPDATE_COST when card is not targeted', () => {
    const source = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const target = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'Aura', states: [{ id: 1, name: 'Aura' }] },
      2: { id: 2, name: 'Builder', states: [{ id: 1, name: 'Builder' }] },
    };
    const gs = makeState({
      board: [1, 2],
      instances: { 1: source, 2: target },
      boardEffects: {
        1: [
          {
            id: 'adjust_upgrade',
            type: PassiveType.ADJUST_UPDATE_COST,
            resources: { gold: -1 },
            cards: { ids: [99] },
          },
        ],
      },
    });

    const result = getEffectiveUpgradeCost(
      { resources: [{ gold: 2 }] },
      gs,
      defs,
      makeStickerDefs(),
      2,
    );

    expect(result.resources?.[0]).toEqual({ gold: 2 });
  });

  it('never returns negative resource costs', () => {
    const source = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const target = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'Aura', states: [{ id: 1, name: 'Aura' }] },
      2: { id: 2, name: 'Builder', states: [{ id: 1, name: 'Builder' }] },
    };
    const gs = makeState({
      board: [1, 2],
      instances: { 1: source, 2: target },
      boardEffects: {
        1: [
          {
            id: 'adjust_upgrade',
            type: PassiveType.ADJUST_UPDATE_COST,
            resources: { gold: -5 },
            cards: { scope: [TargetScope.BOARD], ids: [2] },
          },
        ],
      },
    });

    const result = getEffectiveUpgradeCost(
      { resources: [{ gold: 2 }] },
      gs,
      defs,
      makeStickerDefs(),
      2,
    );

    expect(result.resources?.[0]).toEqual({});
  });

  it('reduces upgrade resources by 1 when configured on card instance state', () => {
    const target = makeInstance({
      id: 2,
      cardId: 2,
      stateId: 1,
      removedResourcesByState: {
        1: {
          upgradeCost: [ResourceType.GOLD],
        },
      },
    });

    const result = getEffectiveUpgradeCost(
      { resources: [{ gold: 2, wood: 1 }] },
      makeState({ instances: { 2: target } }),
      { 2: { id: 2, name: 'Builder', states: [{ id: 1, name: 'Builder' }] } },
      makeStickerDefs(),
      2,
    );

    expect(result.resources?.[0]).toEqual({ gold: 1, wood: 1 });
  });

  it('ignores invalid adjusted resource values', () => {
    const source = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const target = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'Aura', states: [{ id: 1, name: 'Aura' }] },
      2: { id: 2, name: 'Builder', states: [{ id: 1, name: 'Builder' }] },
    };
    const gs = makeState({
      board: [1, 2],
      instances: { 1: source, 2: target },
      boardEffects: {
        1: [
          {
            id: 'adjust_upgrade',
            type: PassiveType.ADJUST_UPDATE_COST,
            resources: { gold: Number.NaN },
            cards: { ids: [2] },
          },
        ],
      },
    });

    const result = getEffectiveUpgradeCost(
      { resources: [{ gold: 2 }] },
      gs,
      defs,
      makeStickerDefs(),
      2,
    );

    expect(result.resources?.[0]).toEqual({});
  });
});

describe('getEffectiveActionCost', () => {
  it('returns empty cost when base cost is undefined', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    expect(getEffectiveActionCost(undefined, inst)).toEqual({});
  });

  it('reduces action cost resources by 1 when configured on instance state', () => {
    const inst = makeInstance({
      id: 1,
      cardId: 1,
      stateId: 1,
      removedResourcesByState: {
        1: {
          actionCost: [ResourceType.WOOD],
        },
      },
    });

    const effective = getEffectiveActionCost({ resources: [{ gold: 1, wood: 2 }] }, inst);
    expect(effective.resources?.[0]).toEqual({ gold: 1, wood: 1 });
  });
});

// ─── getActiveState ───────────────────────────────────────────────────────────

describe('getActiveState', () => {
  const defs: Record<number, CardDef> = {
    1: { id: 1, name: 'C', states: [{ id: 10, name: 'S' }] },
  };

  it('returns the active state', () => {
    const inst = makeInstance({ cardId: 1, stateId: 10 });
    expect(getActiveState(inst, defs).id).toBe(10);
  });

  it('throws when def not found', () => {
    const inst = makeInstance({ cardId: 99, stateId: 10 });
    expect(() => getActiveState(inst, defs)).toThrow('Card def not found: 99');
  });

  it('throws when state not found on card', () => {
    const inst = makeInstance({ cardId: 1, stateId: 99 });
    expect(() => getActiveState(inst, defs)).toThrow('State 99 not found on card 1');
  });
});

// ─── canAffordResources ───────────────────────────────────────────────────────

describe('canAffordResources', () => {
  it('returns true when no cost', () => {
    expect(canAffordResources({}, [{}])).toBe(true);
  });

  it('returns true when cost.resources is empty array', () => {
    expect(canAffordResources({}, [])).toBe(true);
  });

  it('returns true when resources are sufficient', () => {
    expect(canAffordResources({ gold: 5 }, [{ gold: 3 }])).toBe(true);
  });

  it('returns false when resources are insufficient', () => {
    expect(canAffordResources({ gold: 1 }, [{ gold: 3 }])).toBe(false);
  });

  it('returns false when resource key is missing', () => {
    expect(canAffordResources({}, [{ gold: 1 }])).toBe(false);
  });
});

// ─── canAffordCardCost ────────────────────────────────────────────────────────

describe('canAffordCardCost', () => {
  const defs: Record<number, CardDef> = {
    1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
  };

  it('returns true when no cost', () => {
    expect(canAffordCost(undefined, 1, makeState(), defs, makeStickerDefs())).toBe(true);
  });

  it('returns false when discard has no available cards', () => {
    const gs = makeState({ board: [] });
    expect(
      canAffordCost({ discard: [{ scope: [TargetScope.BOARD] }] }, 1, gs, defs, makeStickerDefs()),
    ).toBe(false);
  });

  it('returns true when enough cards for discard', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst } });
    expect(
      canAffordCost({ discard: [{ scope: [TargetScope.BOARD] }] }, 99, gs, defs, makeStickerDefs()),
    ).toBe(true);
  });

  it('returns false when destroy has no available cards', () => {
    const gs = makeState({ board: [] });
    expect(
      canAffordCost({ destroy: { scope: [TargetScope.BOARD] } }, 1, gs, defs, makeStickerDefs()),
    ).toBe(false);
  });

  it('returns true when enough cards for destroy', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst } });
    expect(
      canAffordCost({ destroy: { scope: [TargetScope.BOARD] } }, 99, gs, defs, makeStickerDefs()),
    ).toBe(true);
  });

  it('uses discard.number for count check', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst } });
    expect(
      canAffordCost(
        { discard: [{ scope: [TargetScope.BOARD], pickNumber: 2 }] },
        99,
        gs,
        defs,
        makeStickerDefs(),
      ),
    ).toBe(false);
  });

  it('returns false when cost.resources cannot be afforded', () => {
    const gs = makeState({ resources: { gold: 1 } });
    expect(canAffordCost({ resources: [{ gold: 5 }] }, 1, gs, defs, makeStickerDefs())).toBe(false);
  });

  it('returns true when cost.resources can be afforded', () => {
    const gs = makeState({ resources: { gold: 10 } });
    expect(canAffordCost({ resources: [{ gold: 5 }] }, 1, gs, defs, makeStickerDefs())).toBe(true);
  });

  it('returns false when accumulated cost is not met', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, cumulated: 2 });
    const gs = makeState({ instances: { 1: inst } });
    expect(canAffordCost({ accumulated: 5 }, 1, gs, defs, makeStickerDefs())).toBe(false);
  });

  it('returns true when accumulated cost is met', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, cumulated: 5 });
    const gs = makeState({ instances: { 1: inst } });
    expect(canAffordCost({ accumulated: 5 }, 1, gs, defs, makeStickerDefs())).toBe(true);
  });

  it('returns true when accumulated cost is met with missing instance (cumulated treated as 0)', () => {
    const gs = makeState({ instances: {} });
    expect(canAffordCost({ accumulated: 0 }, 99, gs, defs, makeStickerDefs())).toBe(true);
  });

  it('returns false when accumulated cost is not met and instance is missing (cumulated defaults to 0)', () => {
    const gs = makeState({ instances: {} });
    expect(canAffordCost({ accumulated: 3 }, 99, gs, defs, makeStickerDefs())).toBe(false);
  });

  it('filters discard candidates to only those on the board', () => {
    // Instance 2 matches selector but is NOT on the board — after filter, 0 candidates < 1 needed
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [], instances: { 2: inst } });
    expect(canAffordCost({ discard: [{ ids: [2] }] }, 99, gs, defs, makeStickerDefs())).toBe(false);
  });

  it('returns true when resource equivalence makes a cost affordable', () => {
    const sourceInstanceId = 85;
    const gs = makeState({
      board: [sourceInstanceId],
      resources: { goods: 1 },
      boardEffects: {
        [sourceInstanceId]: [
          {
            id: '85-4-1',
            type: PassiveType.RESOURCE_EQUIVALENCE,
            resources: { wood: 1, goods: 1 },
          },
        ],
      },
    });

    expect(
      canAffordCost({ resources: [{ wood: 1 }] }, sourceInstanceId, gs, defs, makeStickerDefs()),
    ).toBe(true);
  });

  it('returns true when equivalence passive is present, regardless of cards selector', () => {
    const sourceInstanceId = 85;
    const gs = makeState({
      resources: { goods: 1 },
      boardEffects: {
        [sourceInstanceId]: [
          {
            id: '85-4-1',
            type: PassiveType.RESOURCE_EQUIVALENCE,
            resources: { wood: 1, goods: 1 },
          },
        ],
      },
    });

    expect(
      canAffordCost({ resources: [{ wood: 1 }] }, sourceInstanceId, gs, defs, makeStickerDefs()),
    ).toBe(true);
  });

  it('returns true when equivalence passive comes from another in-play source and targets the payer', () => {
    const payerInstanceId = 42;
    const passiveSourceId = 85;
    const gs = makeState({
      board: [payerInstanceId, passiveSourceId],
      resources: { goods: 1 },
      instances: {
        [payerInstanceId]: makeInstance({ id: payerInstanceId, cardId: 1, stateId: 1 }),
        [passiveSourceId]: makeInstance({ id: passiveSourceId, cardId: 1, stateId: 1 }),
      },
      boardEffects: {
        [passiveSourceId]: [
          {
            id: '85-4-1',
            type: PassiveType.RESOURCE_EQUIVALENCE,
            resources: { wood: 1, goods: 1 },
            cards: { scope: [TargetScope.BOARD, TargetScope.PERMANENTS] },
          },
        ],
      },
    });

    expect(
      canAffordCost({ resources: [{ wood: 1 }] }, payerInstanceId, gs, defs, makeStickerDefs()),
    ).toBe(true);
  });
});

// ─── cardShouldStayInPlay ─────────────────────────────────────────────────────

describe('cardShouldStayInPlay', () => {
  it('returns false when instance not found', () => {
    expect(cardShouldStayInPlay(99, makeState(), {})).toBe(false);
  });

  it('returns true for permanent cards', () => {
    const inst = makeInstance({ id: 1, cardId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'P', states: [{ id: 1, name: 'S', permanent: true }] },
    };
    const gs = makeState({ instances: { 1: inst } });
    expect(cardShouldStayInPlay(1, gs, defs)).toBe(true);
  });

  it('returns true for cards with STAY_IN_PLAY passive', () => {
    const inst = makeInstance({ id: 1, cardId: 1 });
    const defs: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'C',
        states: [{ id: 1, name: 'S', passives: [{ id: 'sip', type: PassiveType.STAY_IN_PLAY }] }],
      },
    };
    const gs = makeState({ instances: { 1: inst } });
    expect(cardShouldStayInPlay(1, gs, defs)).toBe(true);
  });

  it('returns true when card is affected by a board STAY_IN_PLAY effect', () => {
    const inst = makeInstance({ id: 2, cardId: 2 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'S', states: [{ id: 1, name: 'S1' }] },
      2: { id: 2, name: 'T', states: [{ id: 1, name: 'T1' }] },
    };
    const gs = makeState({
      instances: { 2: inst },
      boardEffects: {
        1: [{ id: 'sip', type: PassiveType.STAY_IN_PLAY, cards: { ids: [2] } }],
      },
    });
    expect(cardShouldStayInPlay(2, gs, defs)).toBe(true);
  });

  it('returns true when card has STAYS_IN_PLAY sticker (id 7)', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, stickers: { 1: [7] } });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
    };
    const gs = makeState({ instances: { 1: inst } });
    expect(cardShouldStayInPlay(1, gs, defs)).toBe(true);
  });

  it('returns false for a plain non-permanent card', () => {
    const inst = makeInstance({ id: 1, cardId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
    };
    const gs = makeState({ instances: { 1: inst } });
    expect(cardShouldStayInPlay(1, gs, defs)).toBe(false);
  });

  it('returns true when blocked card is affected by a board STAY_IN_PLAY effect', () => {
    const inst = makeInstance({ id: 1, cardId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
    };
    const gs = makeState({
      instances: { 1: inst },
      boardEffects: {
        99: [
          { id: 'b', type: PassiveType.BLOCK, cards: { ids: [1] } },
          { id: 'sip', type: PassiveType.STAY_IN_PLAY, cards: { ids: [1] } },
        ],
      },
    });
    expect(cardShouldStayInPlay(1, gs, defs)).toBe(true);
  });

  it('returns true when blocker itself is affected by STAY_IN_PLAY', () => {
    const blocked = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const blocker = makeInstance({ id: 99, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
    };
    const gs = makeState({
      instances: { 1: blocked, 99: blocker },
      boardEffects: {
        99: [{ id: 'b', type: PassiveType.BLOCK, cards: { ids: [1] } }],
        42: [{ id: 'sip', type: PassiveType.STAY_IN_PLAY, cards: { ids: [99] } }],
      },
    });

    expect(cardShouldStayInPlay(1, gs, defs)).toBe(true);
  });
});

// ─── cardIsBlocked ────────────────────────────────────────────────────────────

describe('cardIsBlocked', () => {
  it('returns false when no block effects', () => {
    expect(cardIsBlocked(1, makeState())).toBe(false);
  });

  it('returns true when card is in block effects', () => {
    const gs = makeState({
      boardEffects: {
        1: [{ id: 'b', type: PassiveType.BLOCK, cards: { ids: [2] } }],
      },
    });
    expect(cardIsBlocked(2, gs)).toBe(true);
  });

  it('returns false when card is not in block effects', () => {
    const gs = makeState({
      boardEffects: {
        1: [{ id: 'b', type: PassiveType.BLOCK, cards: { ids: [3] } }],
      },
    });
    expect(cardIsBlocked(2, gs)).toBe(false);
  });
});

// ─── getInstancesTriggerEffects ───────────────────────────────────────────────

describe('getInstancesTriggerEffects', () => {
  it('returns empty when no instances have matching triggers', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
    };
    const result = getInstancesTriggerEffects(
      [inst],
      defs,
      makeStickerDefs(),
      Trigger.END_OF_TURN,
      makeState(),
    );
    expect(result).toHaveLength(0);
  });

  it('returns trigger effects for matching trigger', () => {
    const action = {
      id: 'a1',
      actionEffects: [],
      trigger: Trigger.END_OF_TURN,
    };
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S', actions: [action] }] },
    };
    const result = getInstancesTriggerEffects(
      [inst],
      defs,
      makeStickerDefs(),
      Trigger.END_OF_TURN,
      makeState(),
    );
    expect(result).toHaveLength(1);
    expect(result[0].sourceInstanceId).toBe(1);
    expect(result[0].effectDef).toBe(action);
  });

  it('includes board effect triggers matching the trigger type', () => {
    const gs = makeState({
      boardEffects: {
        1: [
          {
            id: 'trig',
            type: PassiveType.ADD_TRIGGER,
            trigger: {
              id: 't1',
              type: Trigger.END_OF_TURN,
              actions: [{ id: 0, type: ActionEffectType.ADD_RESOURCES }],
            },
          },
        ],
      },
    });
    const result = getInstancesTriggerEffects([], {}, {}, Trigger.END_OF_TURN, gs);
    expect(result).toHaveLength(1);
    expect(result[0].sourceInstanceId).toBe(1);
  });

  it('resolves SELF scope in board effect trigger actions to the selected card id', () => {
    const inst2 = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'S', states: [{ id: 1, name: 'S1' }] },
      2: { id: 2, name: 'T', states: [{ id: 1, name: 'T1' }] },
    };
    const gs = makeState({
      board: [2],
      instances: { 2: inst2 },
      boardEffects: {
        1: [
          {
            id: 'trig',
            type: PassiveType.ADD_TRIGGER,
            trigger: {
              id: 't1',
              type: Trigger.END_OF_TURN,
              cards: { scope: [TargetScope.BOARD] },
              actions: [
                {
                  id: 0,
                  type: ActionEffectType.ADD_RESOURCES,
                  cards: { scope: [TargetScope.SELF] },
                },
              ],
            },
          },
        ],
      },
    });
    const result = getInstancesTriggerEffects([], defs, makeStickerDefs(), Trigger.END_OF_TURN, gs);
    expect(result).toHaveLength(1);
    expect(result[0].effectDef.actionEffects[0].cards?.ids).toEqual([2]);
  });

  it('resolves TRIGGER_SOURCE scope in board effect trigger actions to the original source id', () => {
    const inst2 = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const defs2: Record<number, CardDef> = {
      1: { id: 1, name: 'S', states: [{ id: 1, name: 'S1' }] },
      2: { id: 2, name: 'T', states: [{ id: 1, name: 'T1' }] },
    };
    const gs = makeState({
      board: [2],
      instances: { 2: inst2 },
      boardEffects: {
        1: [
          {
            id: 'trig',
            type: PassiveType.ADD_TRIGGER,
            trigger: {
              id: 't1',
              type: Trigger.END_OF_TURN,
              cards: { scope: [TargetScope.BOARD] },
              actions: [
                {
                  id: 0,
                  type: ActionEffectType.ADD_RESOURCES,
                  cards: { scope: [TargetScope.TRIGGER_SOURCE] },
                },
              ],
            },
          },
        ],
      },
    });
    const result = getInstancesTriggerEffects(
      [],
      defs2,
      makeStickerDefs(),
      Trigger.END_OF_TURN,
      gs,
    );
    expect(result).toHaveLength(1);
    expect(result[0].effectDef.actionEffects[0].cards?.ids).toEqual([1]);
  });

  it('skips board effect trigger when no cards match the selector', () => {
    const gs = makeState({
      boardEffects: {
        1: [
          {
            id: 'trig',
            type: PassiveType.ADD_TRIGGER,
            trigger: {
              id: 't1',
              type: Trigger.ON_PLAY,
              cards: { ids: [99] },
              actions: [{ id: 0, type: ActionEffectType.ADD_RESOURCES }],
            },
          },
        ],
      },
    });
    const result = getInstancesTriggerEffects([], {}, {}, Trigger.END_OF_TURN, gs);
    expect(result).toHaveLength(0);
  });

  it('skips board effect trigger when no actions defined', () => {
    const gs = makeState({
      boardEffects: {
        1: [
          {
            id: 'trig',
            type: PassiveType.ADD_TRIGGER,
            trigger: { id: 't1', type: Trigger.END_OF_TURN },
          },
        ],
      },
    });
    const result = getInstancesTriggerEffects([], {}, {}, Trigger.END_OF_TURN, gs);
    expect(result).toHaveLength(0);
  });

  it('returns empty when board trigger cards selector matches nothing for the right trigger type', () => {
    const gs = makeState({
      boardEffects: {
        1: [
          {
            id: 'trig',
            type: PassiveType.ADD_TRIGGER,
            trigger: {
              id: 't1',
              type: Trigger.END_OF_TURN,
              cards: { scope: [TargetScope.BOARD], ids: [99] }, // no card with id 99 on board
              actions: [{ id: 0, type: ActionEffectType.ADD_RESOURCES }],
            },
          },
        ],
      },
    });
    const result = getInstancesTriggerEffects([], {}, {}, Trigger.END_OF_TURN, gs);
    expect(result).toHaveLength(0);
  });

  it('includes board effect trigger when passive condition is true', () => {
    const gs = makeState({
      resources: { gold: 2 },
      boardEffects: {
        1: [
          {
            id: 'trig',
            type: PassiveType.ADD_TRIGGER,
            condition: {
              type: 'resource',
              resourceType: ResourceType.GOLD,
              min: 1,
            },
            trigger: {
              id: 't1',
              type: Trigger.END_OF_TURN,
              actions: [{ id: 0, type: ActionEffectType.ADD_RESOURCES }],
            },
          },
        ],
      },
    });

    const result = getInstancesTriggerEffects([], {}, {}, Trigger.END_OF_TURN, gs);
    expect(result).toHaveLength(1);
    expect(result[0].sourceInstanceId).toBe(1);
  });

  it('skips board effect trigger when passive condition is false', () => {
    const gs = makeState({
      resources: {},
      boardEffects: {
        1: [
          {
            id: 'trig',
            type: PassiveType.ADD_TRIGGER,
            condition: {
              type: 'resource',
              resourceType: ResourceType.GOLD,
              min: 1,
            },
            trigger: {
              id: 't1',
              type: Trigger.END_OF_TURN,
              actions: [{ id: 0, type: ActionEffectType.ADD_RESOURCES }],
            },
          },
        ],
      },
    });

    const result = getInstancesTriggerEffects([], {}, {}, Trigger.END_OF_TURN, gs);
    expect(result).toHaveLength(0);
  });
});

// ─── evaluateCondition ────────────────────────────────────────────────────────

describe('evaluateCondition', () => {
  const defs: Record<number, CardDef> = {
    1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
  };

  it('cardCount returns true when count meets min', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    expect(
      evaluateCondition(
        { type: 'cardCount', cards: { scope: [TargetScope.BOARD] }, min: 1 },
        gs,
        99,
        defs,
        {},
      ),
    ).toBe(true);
  });

  it('cardCount returns false when count is below min', () => {
    const gs = makeState({ board: [] });
    expect(
      evaluateCondition(
        { type: 'cardCount', cards: { scope: [TargetScope.BOARD] }, min: 1 },
        gs,
        99,
        defs,
        {},
      ),
    ).toBe(false);
  });

  it('cardCount returns false when count exceeds max', () => {
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1, 2], instances: { 1: inst1, 2: inst2 } });
    expect(
      evaluateCondition(
        { type: 'cardCount', cards: { scope: [TargetScope.BOARD] }, max: 1 },
        gs,
        99,
        defs,
        {},
      ),
    ).toBe(false);
  });

  it('production returns true when total meets min', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const prodDefs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S', productions: [{ gold: 2 }] }] },
    };
    const gs = makeState({ board: [1], instances: { 1: inst } });
    expect(
      evaluateCondition(
        { type: 'production', resourceType: ResourceType.GOLD, min: 1 },
        gs,
        99,
        prodDefs,
        {},
      ),
    ).toBe(true);
  });

  it('production returns false when total is below min', () => {
    const gs = makeState({ board: [] });
    expect(
      evaluateCondition(
        { type: 'production', resourceType: ResourceType.GOLD, min: 1 },
        gs,
        99,
        defs,
        {},
      ),
    ).toBe(false);
  });

  it('production returns false when total exceeds max', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const prodDefs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S', productions: [{ gold: 3 }] }] },
    };
    const gs = makeState({ board: [1], instances: { 1: inst } });
    expect(
      evaluateCondition(
        { type: 'production', resourceType: ResourceType.GOLD, max: 2 },
        gs,
        99,
        prodDefs,
        {},
      ),
    ).toBe(false);
  });

  it('resource returns true when resource amount is within bounds', () => {
    const gs = makeState({ resources: { gold: 2 } });
    expect(
      evaluateCondition(
        { type: 'resource', resourceType: ResourceType.GOLD, min: 1, max: 3 },
        gs,
        99,
        defs,
        {},
      ),
    ).toBe(true);
  });

  it('and returns true when all conditions pass', () => {
    const gs = makeState({ board: [] });
    expect(
      evaluateCondition(
        {
          type: 'and',
          conditions: [
            { type: 'cardCount', cards: { scope: [TargetScope.BOARD] }, max: 5 },
            { type: 'cardCount', cards: { scope: [TargetScope.BOARD] }, max: 10 },
          ],
        },
        gs,
        99,
        defs,
        {},
      ),
    ).toBe(true);
  });

  it('and returns false when one condition fails', () => {
    const gs = makeState({ board: [] });
    expect(
      evaluateCondition(
        {
          type: 'and',
          conditions: [
            { type: 'cardCount', cards: { scope: [TargetScope.BOARD] }, min: 1 },
            { type: 'cardCount', cards: { scope: [TargetScope.BOARD] }, max: 10 },
          ],
        },
        gs,
        99,
        defs,
        {},
      ),
    ).toBe(false);
  });

  it('or returns true when at least one condition passes', () => {
    const gs = makeState({ board: [] });
    expect(
      evaluateCondition(
        {
          type: 'or',
          conditions: [
            { type: 'cardCount', cards: { scope: [TargetScope.BOARD] }, min: 1 },
            { type: 'cardCount', cards: { scope: [TargetScope.BOARD] }, max: 10 },
          ],
        },
        gs,
        99,
        defs,
        {},
      ),
    ).toBe(true);
  });

  it('or returns false when all conditions fail', () => {
    const gs = makeState({ board: [] });
    expect(
      evaluateCondition(
        {
          type: 'or',
          conditions: [
            { type: 'cardCount', cards: { scope: [TargetScope.BOARD] }, min: 1 },
            { type: 'cardCount', cards: { scope: [TargetScope.BOARD] }, min: 2 },
          ],
        },
        gs,
        99,
        defs,
        {},
      ),
    ).toBe(false);
  });

  it('not returns true when inner condition fails', () => {
    const gs = makeState({ board: [] });
    expect(
      evaluateCondition(
        {
          type: 'not',
          condition: { type: 'cardCount', cards: { scope: [TargetScope.BOARD] }, min: 1 },
        },
        gs,
        99,
        defs,
        {},
      ),
    ).toBe(true);
  });

  it('not returns false when inner condition passes', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    expect(
      evaluateCondition(
        {
          type: 'not',
          condition: { type: 'cardCount', cards: { scope: [TargetScope.BOARD] }, min: 1 },
        },
        gs,
        99,
        defs,
        {},
      ),
    ).toBe(false);
  });
});

// ─── getEffectiveGlory branches ───────────────────────────────────────────────

describe('getEffectiveGlory', () => {
  it('returns 0 when state has no glory', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = { id: 1, name: 'S' }; // no glory
    expect(getEffectiveGlory(state, makeState(), {}, inst)).toBe(0);
  });

  it('returns 0 when glory condition evaluates to false', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
    };
    const gs = makeState({ board: [], instances: { 1: inst } });
    const state = {
      id: 1,
      name: 'S',
      glory: {
        amount: 5,
        condition: { type: 'cardCount' as const, cards: { scope: [TargetScope.BOARD] }, min: 1 },
      },
    };
    expect(getEffectiveGlory(state, gs, defs, inst)).toBe(0);
  });

  it('adds valuePerElement glory bonus', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
    };
    const gs = makeState({ board: [2], instances: { 1: inst, 2: inst2 } });
    const state = {
      id: 1,
      name: 'S',
      glory: {
        amount: 0,
        valuePerElement: {
          amount: 2,
          cards: { scope: [TargetScope.BOARD] },
        },
      },
    };
    expect(getEffectiveGlory(state, gs, defs, inst)).toBe(2);
  });
});

// ─── tagClass branches ────────────────────────────────────────────────────────

describe('tagClass additional branches', () => {
  it('returns enemy class when isEnemy is true', () => {
    expect(tagClass('land', true)).toContain('border-tag-enemy');
  });

  it('returns building class', () => {
    expect(tagClass('building', false)).toContain('border-tag-building');
  });

  it('returns person class', () => {
    expect(tagClass('person', false)).toContain('border-tag-person');
  });

  it('returns seafaring class', () => {
    expect(tagClass('seafaring', false)).toContain('border-tag-seafaring');
  });

  it('returns land class', () => {
    expect(tagClass('land', false)).toContain('border-tag-land');
  });

  it('returns livestock class', () => {
    expect(tagClass('livestock', false)).toContain('border-tag-livestock');
  });

  it('returns default tag class for unknown tag', () => {
    expect(tagClass('unknown', false)).toContain('border-tag-tag');
  });
});

// ─── getFirstAvailableTrackStep ───────────────────────────────────────────────

describe('getFirstAvailableTrackStep', () => {
  const baseInst = makeInstance({ id: 1, cardId: 1, stateId: 1, trackProgress: [] });
  const defs: Record<number, CardDef> = {
    1: {
      id: 1,
      name: 'C',
      states: [
        {
          id: 1,
          name: 'S',
          track: {
            inOrder: true,
            steps: [{ id: 10 }, { id: 11 }],
          },
        },
      ],
    },
  };

  it('returns undefined when no TRACK_ADVANCE effect', () => {
    const gs = makeState({ instances: { 1: baseInst } });
    const result = getFirstAvailableTrackStep(
      [{ id: 0, type: ActionEffectType.ADD_RESOURCES }],
      1,
      gs,
      defs,
      {},
    );
    expect(result).toBeUndefined();
  });

  it('returns undefined when TRACK_ADVANCE has no cards selector', () => {
    const gs = makeState({ instances: { 1: baseInst } });
    const result = getFirstAvailableTrackStep(
      [{ id: 0, type: ActionEffectType.TRACK_ADVANCE }],
      1,
      gs,
      defs,
      {},
    );
    expect(result).toBeUndefined();
  });

  it('returns undefined when target instance not found', () => {
    const gs = makeState({ instances: {} });
    const result = getFirstAvailableTrackStep(
      [{ id: 0, type: ActionEffectType.TRACK_ADVANCE, cards: { ids: [99] } }],
      1,
      gs,
      defs,
      {},
    );
    expect(result).toBeUndefined();
  });

  it('returns undefined when target card has no track', () => {
    const noTrackDefs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] }, // no track
    };
    const gs = makeState({ instances: { 1: baseInst } });
    const result = getFirstAvailableTrackStep(
      [{ id: 0, type: ActionEffectType.TRACK_ADVANCE, cards: { ids: [1] } }],
      1,
      gs,
      noTrackDefs,
      {},
    );
    expect(result).toBeUndefined();
  });

  it('returns first available step when steps exist', () => {
    const gs = makeState({ instances: { 1: baseInst } });
    const result = getFirstAvailableTrackStep(
      [{ id: 0, type: ActionEffectType.TRACK_ADVANCE, cards: { ids: [1] } }],
      1,
      gs,
      defs,
      {},
    );
    expect(result?.id).toBe(10);
  });

  it('returns undefined when all steps completed', () => {
    const completedInst = makeInstance({ id: 1, cardId: 1, stateId: 1, trackProgress: [10, 11] });
    const gs = makeState({ instances: { 1: completedInst } });
    const result = getFirstAvailableTrackStep(
      [{ id: 0, type: ActionEffectType.TRACK_ADVANCE, cards: { ids: [1] } }],
      1,
      gs,
      defs,
      {},
    );
    expect(result).toBeUndefined();
  });
});

// ─── getEffectiveUpgradeCost (sourceInstance absent) ──────────────────────────

describe('getEffectiveUpgradeCost (no sourceInstance)', () => {
  it('returns adjusted cost without removedKeys when instance is absent', () => {
    const result = getEffectiveUpgradeCost(
      { resources: [{ gold: 3 }] },
      makeState({ instances: {} }),
      {},
      {},
      99, // no instance with this id
    );
    expect(result.resources?.[0]).toEqual({ gold: 3 });
  });

  it('fills empty resources array with [{}] when base cost has no resources', () => {
    const source = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const target = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'A', states: [{ id: 1, name: 'A' }] },
      2: { id: 2, name: 'B', states: [{ id: 1, name: 'B' }] },
    };
    const gs = makeState({
      board: [1, 2],
      instances: { 1: source, 2: target },
      boardEffects: {
        1: [
          {
            id: 'adj',
            type: PassiveType.ADJUST_UPDATE_COST,
            resources: { gold: 2 },
            cards: { scope: [TargetScope.BOARD], ids: [2] },
          },
        ],
      },
    });
    // baseCost has no resources array → branch that defaults to [{}]
    const result = getEffectiveUpgradeCost({}, gs, defs, {}, 2);
    expect(result.resources?.[0]).toEqual({ gold: 2 });
  });

  it('uses default BOARD scope when passive has no cards selector', () => {
    const source = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const target = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'A', states: [{ id: 1, name: 'A' }] },
      2: { id: 2, name: 'B', states: [{ id: 1, name: 'B' }] },
    };
    const gs = makeState({
      board: [1, 2],
      instances: { 1: source, 2: target },
      boardEffects: {
        1: [
          {
            id: 'adj',
            type: PassiveType.ADJUST_UPDATE_COST,
            resources: { wood: 1 },
            // no cards field → defaults to { scope: [TargetScope.BOARD] }
          },
        ],
      },
    });
    const result = getEffectiveUpgradeCost({ resources: [{ gold: 2 }] }, gs, defs, {}, 2);
    expect(result.resources?.[0]).toEqual({ gold: 2, wood: 1 });
  });
});

// ─── getEffectiveGlory (sticker glory) ───────────────────────────────────────

describe('getEffectiveGlory sticker bonus', () => {
  it('adds sticker glory to base glory', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, stickers: { 1: [5] } });
    const stickerDefs: Record<number, Sticker> = { 5: { id: 5, glory: 3 } };
    const state = { id: 1, name: 'S', glory: { amount: 2 } };
    expect(getEffectiveGlory(state, makeState(), {}, inst, stickerDefs)).toBe(5);
  });

  it('returns base glory only when sticker has no glory field', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, stickers: { 1: [5] } });
    const stickerDefs: Record<number, Sticker> = { 5: { id: 5 } };
    const state = { id: 1, name: 'S', glory: { amount: 4 } };
    expect(getEffectiveGlory(state, makeState(), {}, inst, stickerDefs)).toBe(4);
  });

  it('counts sticker glory even when state has no intrinsic glory', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, stickers: { 1: [5] } });
    const stickerDefs: Record<number, Sticker> = { 5: { id: 5, glory: 2 } };
    const state = { id: 1, name: 'S' };
    expect(getEffectiveGlory(state, makeState(), {}, inst, stickerDefs)).toBe(2);
  });

  it('uses 0 when glory.amount is undefined', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    // glory object present but no amount property
    const state = { id: 1, name: 'S' };
    expect(getEffectiveGlory(state, makeState(), {}, inst, {})).toBe(0);
  });

  it('returns glory when condition is present and evaluates to true', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
    };
    const gs = makeState({ board: [2], instances: { 1: inst, 2: inst2 } });
    const state = {
      id: 1,
      name: 'S',
      glory: {
        amount: 3,
        condition: { type: 'cardCount' as const, cards: { scope: [TargetScope.BOARD] }, min: 1 },
      },
    };
    // condition passes (1 card on board) → glory is returned
    expect(getEffectiveGlory(state, gs, defs, inst)).toBe(3);
  });
});

// ─── getTotalResourceProduction ───────────────────────────────────────────────

describe('getTotalResourceProduction', () => {
  it('returns 0 when no card produces the resource', () => {
    const gs = makeState({ board: [], instances: {} });
    expect(getTotalResourceProduction(99, ResourceType.GOLD, gs, {}, {})).toBe(0);
  });

  it('returns total gold produced by board cards', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S', productions: [{ gold: 3 }] }] },
    };
    const gs = makeState({ board: [1], instances: { 1: inst } });
    expect(getTotalResourceProduction(99, ResourceType.GOLD, gs, defs, {})).toBe(3);
  });

  it('picks the maximum across multiple production options for a card', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'C',
        states: [{ id: 1, name: 'S', productions: [{ gold: 1 }, { gold: 4 }] }],
      },
    };
    const gs = makeState({ board: [1], instances: { 1: inst } });
    expect(getTotalResourceProduction(99, ResourceType.GOLD, gs, defs, {})).toBe(4);
  });

  it('sums production across multiple cards', () => {
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S', productions: [{ gold: 2 }] }] },
    };
    const gs = makeState({ board: [1, 2], instances: { 1: inst1, 2: inst2 } });
    expect(getTotalResourceProduction(99, ResourceType.GOLD, gs, defs, {})).toBe(4);
  });

  it('treats missing resource key in a production option as 0', () => {
    // Card has two production choices: {gold:3} and {wood:1} — gold value in wood option is undefined → ?? 0
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'C',
        states: [{ id: 1, name: 'S', productions: [{ gold: 3 }, { wood: 1 }] }],
      },
    };
    const gs = makeState({ board: [1], instances: { 1: inst } });
    // max(3, 0) = 3
    expect(getTotalResourceProduction(99, ResourceType.GOLD, gs, defs, {})).toBe(3);
  });

  it('treats null production value as 0 in total resource production', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'C',
        states: [{ id: 1, name: 'S', productions: [{ gold: null as unknown as number }] }],
      },
    };
    const gs = makeState({ board: [1], instances: { 1: inst } });

    expect(getTotalResourceProduction(99, ResourceType.GOLD, gs, defs, {})).toBe(0);
  });
});

describe('getTotalProduction', () => {
  it('returns 0 when instance does not exist', () => {
    expect(getTotalProduction(999, makeState({ instances: {} }), {}, {})).toBe(0);
  });

  it('returns 0 when active state has no productions', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
    };

    expect(getTotalProduction(1, makeState({ instances: { 1: inst } }), defs, {})).toBe(0);
  });

  it('treats null production values as 0', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'C',
        states: [
          {
            id: 1,
            name: 'S',
            productions: [{ gold: null as unknown as number }],
          },
        ],
      },
    };

    expect(getTotalProduction(1, makeState({ instances: { 1: inst } }), defs, {})).toBe(0);
  });
});

// ─── canAffordTrackAdvanceCost ────────────────────────────────────────────────

describe('canAffordTrackAdvanceCost', () => {
  const trackDefs: Record<number, CardDef> = {
    1: {
      id: 1,
      name: 'C',
      states: [
        {
          id: 1,
          name: 'S',
          track: { inOrder: true, steps: [{ id: 10, cost: { resources: [{ gold: 2 }] } }] },
        },
      ],
    },
  };

  it('returns true when action has no TRACK_ADVANCE effect', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const action = { id: 'a1', actionEffects: [{ id: 0, type: ActionEffectType.ADD_RESOURCES }] };
    expect(canAffordTrackAdvanceCost(action, inst, makeState(), trackDefs, {})).toBe(true);
  });

  it('returns true when card state has no track', () => {
    const noTrackDefs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
    };
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const action = {
      id: 'a1',
      actionEffects: [{ id: 0, type: ActionEffectType.TRACK_ADVANCE, cards: { ids: [1] } }],
    };
    expect(
      canAffordTrackAdvanceCost(
        action,
        inst,
        makeState({ instances: { 1: inst } }),
        noTrackDefs,
        {},
      ),
    ).toBe(true);
  });

  it('returns false when first available step cost cannot be afforded', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 1: inst }, resources: { gold: 0 } });
    const action = {
      id: 'a1',
      actionEffects: [{ id: 0, type: ActionEffectType.TRACK_ADVANCE, cards: { ids: [1] } }],
    };
    expect(canAffordTrackAdvanceCost(action, inst, gs, trackDefs, {})).toBe(false);
  });

  it('returns true when first available step cost can be afforded', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 1: inst }, resources: { gold: 5 } });
    const action = {
      id: 'a1',
      actionEffects: [{ id: 0, type: ActionEffectType.TRACK_ADVANCE, cards: { ids: [1] } }],
    };
    expect(canAffordTrackAdvanceCost(action, inst, gs, trackDefs, {})).toBe(true);
  });

  it('returns true when first available step cost cannot be afforded but TRACK_ADVANCE is non-paying', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 1: inst }, resources: { gold: 0 } });
    const action = {
      id: 'a1',
      actionEffects: [
        {
          id: 0,
          type: ActionEffectType.TRACK_ADVANCE,
          payingCost: false,
          cards: { ids: [1] },
        },
      ],
    };
    expect(canAffordTrackAdvanceCost(action, inst, gs, trackDefs, {})).toBe(true);
  });

  it('returns false when no step is available (all completed)', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, trackProgress: [10] });
    const gs = makeState({ instances: { 1: inst }, resources: { gold: 5 } });
    const action = {
      id: 'a1',
      actionEffects: [{ id: 0, type: ActionEffectType.TRACK_ADVANCE, cards: { ids: [1] } }],
    };
    expect(canAffordTrackAdvanceCost(action, inst, gs, trackDefs, {})).toBe(false);
  });
});
