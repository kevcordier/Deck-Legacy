import { makeInstance, makeState, makeStickerDefs } from './fixtures';
import {
  canAffordCardCost,
  canAffordResources,
  cardIsBlocked,
  cardShouldStayInPlay,
  getActiveState,
  getAffectedCardsByBoardEffects,
  getEffectiveGlory,
  getEffectiveProductions,
  getInstancesTriggerEffects,
  tagClass,
} from '@engine/application/cardHelpers';
import { ActionEffectType, PassiveType, TargetScope, Trigger } from '@engine/domain/enums';
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

  it('returns base resources when no bonuses', () => {
    const state = { id: 1, name: 'S' };
    const stickerDefs: Record<number, Sticker> = {};
    const result = getEffectiveProductions(
      { gold: 2 },
      state,
      makeState(),
      {},
      baseInst,
      stickerDefs,
    );
    expect(result).toEqual({ gold: 2 });
  });

  it('adds sticker production bonus', () => {
    const inst = makeInstance({ id: 1, stateId: 1, stickers: { 1: [10] } });
    const stickers: Record<number, Sticker> = makeStickerDefs(10);
    const state = { id: 1, name: 'S' };
    const result = getEffectiveProductions({ gold: 1 }, state, makeState(), {}, inst, stickers);
    expect(result.gold).toBe(2);
  });

  it('ignores sticker with wrong type', () => {
    const inst = makeInstance({ id: 1, stateId: 1, stickers: { 1: [10] } });
    const stickers: Record<number, Sticker> = makeStickerDefs(10);
    stickers[10].effectId = 'stay_in_play';
    stickers[10].production = undefined;
    const state = { id: 1, name: 'S' };
    const result = getEffectiveProductions({ gold: 1 }, state, makeState(), {}, inst, stickers);
    expect(result.gold).toBe(1);
  });

  it('ignores unknown stickerId', () => {
    const inst = makeInstance({ id: 1, stateId: 1, stickers: { 1: [99] } });
    const state = { id: 1, name: 'S' };
    const result = getEffectiveProductions({ gold: 1 }, state, makeState(), {}, inst, {});
    expect(result.gold).toBe(1);
  });

  it('adds passive INCREASE_PRODUCTION bonus based on card count', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'C',
        states: [
          {
            id: 1,
            name: 'S',
            passives: [
              {
                id: 'p',
                type: PassiveType.INCREASE_PRODUCTION,
                valuePerElement: {
                  amount: 2,
                  resource: ['gold' as never],
                  cards: { scope: [TargetScope.BOARD] },
                },
              },
            ],
          },
        ],
      },
      2: { id: 2, name: 'D', states: [{ id: 1, name: 'S2' }] },
    };
    const gs = makeState({ board: [2], instances: { 1: inst, 2: inst2 } });
    const state = defs[1].states[0];
    const stickerDefs: Record<number, Sticker> = {};
    const result = getEffectiveProductions({}, state, gs, defs, inst, stickerDefs);
    expect(result.gold).toBe(2);
  });

  it('uses accumulation for passive bonus when no cards selector', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, cumulated: { wheat: 3 } });
    const defs: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'C',
        states: [
          {
            id: 1,
            name: 'S',
            passives: [
              {
                id: 'p',
                type: PassiveType.INCREASE_PRODUCTION,
                valuePerElement: {
                  amount: 1,
                  resource: ['wood' as never],
                  accumulation: 'wheat',
                },
              },
            ],
          },
        ],
      },
    };
    const gs = makeState({ instances: { 1: inst } });
    const state = defs[1].states[0];
    const stickerDefs: Record<number, Sticker> = {};
    const result = getEffectiveProductions({}, state, gs, defs, inst, stickerDefs);
    expect(result.wood).toBe(3);
  });

  it('skips passive bonus when count is zero', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'C',
        states: [
          {
            id: 1,
            name: 'S',
            passives: [
              {
                id: 'p',
                type: PassiveType.INCREASE_PRODUCTION,
                valuePerElement: {
                  amount: 2,
                  resource: ['gold' as never],
                  cards: { scope: [TargetScope.BOARD] },
                },
              },
            ],
          },
        ],
      },
    };
    const gs = makeState({ board: [], instances: { 1: inst } });
    const state = defs[1].states[0];
    const stickerDefs: Record<number, Sticker> = {};
    const result = getEffectiveProductions({}, state, gs, defs, inst, stickerDefs);
    expect(result.gold).toBeUndefined();
  });

  it('adds board effect INCREASE_PRODUCTION bonus', () => {
    const inst = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const sourceInst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'S', states: [{ id: 1, name: 'S1' }] },
      2: { id: 2, name: 'T', states: [{ id: 1, name: 'T1' }] },
    };
    const gs = makeState({
      board: [2],
      instances: { 1: sourceInst, 2: inst },
      boardEffects: {
        1: [
          {
            id: 'be',
            type: PassiveType.INCREASE_PRODUCTION,
            resources: { gold: 3 },
            cards: { scope: [TargetScope.BOARD] },
          },
        ],
      },
    });
    const state = { id: 1, name: 'S' };
    const stickerDefs: Record<number, Sticker> = {};
    const result = getEffectiveProductions({}, state, gs, defs, inst, stickerDefs);
    expect(result.gold).toBe(3);
  });

  it('applies board effect without explicit cards selector (uses BOARD default)', () => {
    const inst = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const sourceInst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'S', states: [{ id: 1, name: 'S1' }] },
      2: { id: 2, name: 'T', states: [{ id: 1, name: 'T1' }] },
    };
    const gs = makeState({
      board: [2],
      instances: { 1: sourceInst, 2: inst },
      boardEffects: {
        1: [{ id: 'be', type: PassiveType.INCREASE_PRODUCTION, resources: { gold: 2 } }],
      },
    });
    const state = { id: 1, name: 'S' };
    const stickerDefs: Record<number, Sticker> = {};
    const result = getEffectiveProductions({}, state, gs, defs, inst, stickerDefs);
    expect(result.gold).toBe(2);
  });

  it('does not apply board effect when instance not in cards selector', () => {
    const inst = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const sourceInst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'S', states: [{ id: 1, name: 'S1' }] },
      2: { id: 2, name: 'T', states: [{ id: 1, name: 'T1' }] },
    };
    const gs = makeState({
      board: [2],
      instances: { 1: sourceInst, 2: inst },
      boardEffects: {
        1: [
          {
            id: 'be',
            type: PassiveType.INCREASE_PRODUCTION,
            resources: { gold: 5 },
            cards: { ids: [99] },
          },
        ],
      },
    });
    const state = { id: 1, name: 'S' };
    const stickerDefs: Record<number, Sticker> = {};
    const result = getEffectiveProductions({}, state, gs, defs, inst, stickerDefs);
    expect(result.gold).toBeUndefined();
  });

  it('skips passive INCREASE_PRODUCTION without resource in valuePerElement', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'C',
        states: [
          {
            id: 1,
            name: 'S',
            passives: [
              {
                id: 'p',
                type: PassiveType.INCREASE_PRODUCTION,
                valuePerElement: { amount: 2 } as never,
              },
            ],
          },
        ],
      },
    };
    const gs = makeState({ instances: { 1: inst } });
    const state = defs[1].states[0];
    const stickerDefs: Record<number, Sticker> = {};
    const result = getEffectiveProductions({}, state, gs, defs, inst, stickerDefs);
    expect(result.gold).toBeUndefined();
  });

  it('skips passive bonus when neither cards selector nor accumulation defined', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'C',
        states: [
          {
            id: 1,
            name: 'S',
            passives: [
              {
                id: 'p',
                type: PassiveType.INCREASE_PRODUCTION,
                valuePerElement: { amount: 2, resource: ['gold' as never] },
              },
            ],
          },
        ],
      },
    };
    const gs = makeState({ instances: { 1: inst } });
    const state = defs[1].states[0];
    const stickerDefs: Record<number, Sticker> = {};
    const result = getEffectiveProductions({}, state, gs, defs, inst, stickerDefs);
    expect(result.gold).toBeUndefined();
  });

  it('treats missing accumulation value as 0 and skips bonus', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'C',
        states: [
          {
            id: 1,
            name: 'S',
            passives: [
              {
                id: 'p',
                type: PassiveType.INCREASE_PRODUCTION,
                valuePerElement: {
                  amount: 1,
                  resource: ['wood' as never],
                  accumulation: 'wheat',
                },
              },
            ],
          },
        ],
      },
    };
    const gs = makeState({ instances: { 1: inst } });
    const state = defs[1].states[0];
    const stickerDefs: Record<number, Sticker> = {};
    const result = getEffectiveProductions({}, state, gs, defs, inst, stickerDefs);
    expect(result.wood).toBeUndefined();
  });
  it('adds INCREASE_GLORY passive based on card count', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'C',
        states: [
          {
            id: 1,
            name: 'S',
            passives: [
              {
                id: 'pg',
                type: PassiveType.INCREASE_GLORY,
                valuePerElement: {
                  glory: 3,
                  cards: { scope: [TargetScope.BOARD] },
                  amount: 1,
                },
              },
            ],
          },
        ],
      },
      2: { id: 2, name: 'D', states: [{ id: 1, name: 'S2' }] },
    };
    const gs = makeState({ board: [2], instances: { 1: inst, 2: inst2 } });
    const state = defs[1].states[0];
    expect(getEffectiveGlory(state, gs, defs, inst)).toBe(3);
  });

  it('adds INCREASE_GLORY passive based on accumulation', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, cumulated: { stars: 2 } });
    const defs: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'C',
        states: [
          {
            id: 1,
            name: 'S',
            passives: [
              {
                id: 'pg',
                type: PassiveType.INCREASE_GLORY,
                valuePerElement: { glory: 4, accumulation: 'stars', amount: 1 },
              },
            ],
          },
        ],
      },
    };
    const gs = makeState({ instances: { 1: inst } });
    const state = defs[1].states[0];
    expect(getEffectiveGlory(state, gs, defs, inst)).toBe(8);
  });

  it('skips INCREASE_GLORY passive without valuePerElement.glory', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = {
      id: 1,
      name: 'S',
      passives: [{ id: 'pg', type: PassiveType.INCREASE_GLORY, valuePerElement: { amount: 1 } }],
    };
    expect(getEffectiveGlory(state, makeState(), {}, inst)).toBe(0);
  });

  it('skips passives that are not INCREASE_GLORY', () => {
    const inst = makeInstance({ id: 1 });
    const state = {
      id: 1,
      name: 'S',
      passives: [{ id: 'sip', type: PassiveType.STAY_IN_PLAY }],
    };
    const stickerDefs: Record<number, Sticker> = {};
    expect(getEffectiveGlory(state, makeState(), {}, inst, stickerDefs)).toBe(0);
  });

  it('treats missing sticker as 0 glory', () => {
    const inst = makeInstance({ id: 1, stateId: 1, stickers: { 1: [999] } });
    const state = { id: 1, name: 'S', glory: 3 };
    const stickerDefs: Record<number, Sticker> = {};
    expect(getEffectiveGlory(state, makeState(), {}, inst, stickerDefs)).toBe(3);
  });

  it('returns land class', () => {
    expect(tagClass('land', false)).toContain('border-tag-land');
  });

  it('returns livestock class', () => {
    expect(tagClass('livestock', false)).toContain('border-tag-livestock');
  });

  it('returns generic tag class for unknown tags', () => {
    expect(tagClass('event', false)).toContain('border-tag-tag');
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
    expect(canAffordResources({})).toBe(true);
  });

  it('returns true when cost has no resources', () => {
    expect(canAffordResources({}, {})).toBe(true);
  });

  it('returns true when cost.resources is empty array', () => {
    expect(canAffordResources({}, { resources: [] })).toBe(true);
  });

  it('returns true when resources are sufficient', () => {
    expect(canAffordResources({ gold: 5 }, { resources: [{ gold: 3 }] })).toBe(true);
  });

  it('returns false when resources are insufficient', () => {
    expect(canAffordResources({ gold: 1 }, { resources: [{ gold: 3 }] })).toBe(false);
  });

  it('returns false when resource key is missing', () => {
    expect(canAffordResources({}, { resources: [{ gold: 1 }] })).toBe(false);
  });
});

// ─── canAffordCardCost ────────────────────────────────────────────────────────

describe('canAffordCardCost', () => {
  const defs: Record<number, CardDef> = {
    1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
  };

  it('returns true when no cost', () => {
    expect(canAffordCardCost(undefined, 1, makeState(), defs, makeStickerDefs())).toBe(true);
  });

  it('returns false when discard has no available cards', () => {
    const gs = makeState({ board: [] });
    expect(
      canAffordCardCost(
        { discard: { scope: [TargetScope.BOARD] } },
        1,
        gs,
        defs,
        makeStickerDefs(),
      ),
    ).toBe(false);
  });

  it('returns true when enough cards for discard', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst } });
    expect(
      canAffordCardCost(
        { discard: { scope: [TargetScope.BOARD] } },
        99,
        gs,
        defs,
        makeStickerDefs(),
      ),
    ).toBe(true);
  });

  it('returns false when destroy has no available cards', () => {
    const gs = makeState({ board: [] });
    expect(
      canAffordCardCost(
        { destroy: { scope: [TargetScope.BOARD] } },
        1,
        gs,
        defs,
        makeStickerDefs(),
      ),
    ).toBe(false);
  });

  it('returns true when enough cards for destroy', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst } });
    expect(
      canAffordCardCost(
        { destroy: { scope: [TargetScope.BOARD] } },
        99,
        gs,
        defs,
        makeStickerDefs(),
      ),
    ).toBe(true);
  });

  it('uses discard.number for count check', () => {
    const inst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [2], instances: { 2: inst } });
    expect(
      canAffordCardCost(
        { discard: { scope: [TargetScope.BOARD], number: 2 } },
        99,
        gs,
        defs,
        makeStickerDefs(),
      ),
    ).toBe(false);
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
      1: { id: 1, name: 'P', permanent: true, states: [{ id: 1, name: 'S' }] },
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

  it('adds CHOOSE_STATE trigger for chooseState cards on ON_DISCOVER', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', chooseState: true, states: [{ id: 1, name: 'S' }] },
    };
    const result = getInstancesTriggerEffects(
      [inst],
      defs,
      makeStickerDefs(),
      Trigger.ON_DISCOVER,
      makeState(),
    );
    expect(result.some(r => r.effectDef.id === 'choose_state')).toBe(true);
  });

  it('does not add CHOOSE_STATE for ON_PLAY trigger', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', chooseState: true, states: [{ id: 1, name: 'S' }] },
    };
    const result = getInstancesTriggerEffects(
      [inst],
      defs,
      makeStickerDefs(),
      Trigger.ON_PLAY,
      makeState(),
    );
    expect(result.some(r => r.effectDef.id === 'choose_state')).toBe(false);
  });

  it('includes board effect triggers matching the trigger type', () => {
    const gs = makeState({
      boardEffects: {
        1: [
          {
            id: 'trig',
            type: PassiveType.ADD_TRIGGER,
            trigger: {
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

  it('skips board effect trigger when no cards match the selector', () => {
    const gs = makeState({
      boardEffects: {
        1: [
          {
            id: 'trig',
            type: PassiveType.ADD_TRIGGER,
            trigger: {
              type: Trigger.ON_DISCOVER,
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
            trigger: { type: Trigger.END_OF_TURN } as never,
          },
        ],
      },
    });
    const result = getInstancesTriggerEffects([], {}, {}, Trigger.END_OF_TURN, gs);
    expect(result).toHaveLength(0);
  });
});
