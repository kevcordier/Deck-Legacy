import { makeCardState, makeDef, makeGameState, makeInstance } from './testHelpers';
import {
  canAffordResources,
  cardIsBlocked,
  cardShouldStayInPlay,
  getActiveState,
  getAffectedCardsByBoardEffects,
  getEffectiveProductions,
  getInstancesTriggerEffects,
  getTrackGlory,
  tagClass,
} from '@engine/application/cardHelpers';
import { ActionType, PassiveType, ResourceType, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef, CardInstance, Sticker } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

// — getEffectiveProductions —

describe('getEffectiveProductions', () => {
  it('returns base resources when no stickers are present', () => {
    const instance = makeInstance(1, 10, 1);
    const cs = makeCardState(1);
    const defs: Record<number, CardDef> = { 10: makeDef(10, [cs]) };
    const gs = makeGameState({ instances: { 1: instance } });
    const result = getEffectiveProductions({ gold: 2, wood: 1 }, cs, gs, defs, instance);
    expect(result).toEqual({ gold: 2, wood: 1 });
  });

  it('adds sticker production bonuses to base', () => {
    const instance: CardInstance = {
      id: 1,
      cardId: 10,
      stateId: 1,
      stickers: { 1: [101] },
      trackProgress: [],
      cumulated: 0,
    };
    const stickers: Record<number, Sticker> = {
      101: { id: 101, type: 'add', production: 'gold', glory: 0, description: '' },
    };
    const cs = makeCardState(1);
    const defs: Record<number, CardDef> = { 10: makeDef(10, [cs]) };
    const gs = makeGameState({ instances: { 1: instance } });
    const result = getEffectiveProductions({ gold: 2 }, cs, gs, defs, instance, stickers);
    expect(result).toEqual({ gold: 3 });
  });

  it('ignores stickers of a different stateId', () => {
    const instance: CardInstance = {
      id: 1,
      cardId: 10,
      stateId: 2,
      stickers: { 1: [101] }, // stickers for state 1, not active state 2
      trackProgress: [],
      cumulated: 0,
    };
    const stickers: Record<number, Sticker> = {
      101: { id: 101, type: 'add', production: 'gold', glory: 0, description: '' },
    };
    const cs = makeCardState(2);
    const defs: Record<number, CardDef> = { 10: makeDef(10, [makeCardState(1), cs]) };
    const gs = makeGameState({ instances: { 1: instance } });
    const result = getEffectiveProductions({ gold: 2 }, cs, gs, defs, instance, stickers);
    expect(result).toEqual({ gold: 2 });
  });

  it('ignores sticker ids that have no entry in the stickers record', () => {
    const instance: CardInstance = {
      id: 1,
      cardId: 10,
      stateId: 1,
      stickers: { 1: [999] }, // sticker 999 does not exist in stickers map
      trackProgress: [],
      cumulated: 0,
    };
    const cs = makeCardState(1);
    const defs: Record<number, CardDef> = { 10: makeDef(10, [cs]) };
    const gs = makeGameState({ instances: { 1: instance } });
    const result = getEffectiveProductions({ gold: 2 }, cs, gs, defs, instance, {});
    expect(result).toEqual({ gold: 2 });
  });

  it('ignores non-add sticker types', () => {
    const instance: CardInstance = {
      id: 1,
      cardId: 10,
      stateId: 1,
      stickers: { 1: [101] },
      trackProgress: [],
      cumulated: 0,
    };
    const stickers: Record<number, Sticker> = {
      101: { id: 101, type: 'remove', production: ResourceType.GOLD, glory: 0, description: '' },
    };
    const cs = makeCardState(1);
    const defs: Record<number, CardDef> = { 10: makeDef(10, [cs]) };
    const gs = makeGameState({ instances: { 1: instance } });
    const result = getEffectiveProductions({ gold: 2 }, cs, gs, defs, instance, stickers);
    expect(result).toEqual({ gold: 2 });
  });

  it('adds resourcePerCard bonus based on matching board cards', () => {
    const instance = makeInstance(1, 10, 1);
    const other1 = makeInstance(2, 20, 1);
    const other2 = makeInstance(3, 21, 1);
    const activeState = makeCardState(1, {
      passives: [
        {
          id: 'p1',
          type: PassiveType.INCREASE_PRODUCTION,
          resourcePerCard: {
            amount: 2,
            resource: ResourceType.GOLD,
            cards: { scope: TargetScope.BOARD },
          },
        },
      ],
    });
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [activeState]),
      20: makeDef(20, [makeCardState(1)]),
      21: makeDef(21, [makeCardState(1)]),
    };
    const gameState = makeGameState({
      instances: { 1: instance, 2: other1, 3: other2 },
      board: [1, 2, 3],
    });
    const result = getEffectiveProductions({ gold: 1 }, activeState, gameState, defs, instance, {});
    // 2 matching cards on board (self excluded by cardSelector), 2 gold each → +4, base 1 → 5
    expect(result).toEqual({ gold: 5 });
  });

  it('adds nothing when no cards match the selector', () => {
    const instance = makeInstance(1, 10, 1);
    const activeState = makeCardState(1, {
      passives: [
        {
          id: 'p1',
          type: PassiveType.INCREASE_PRODUCTION,
          resourcePerCard: {
            amount: 3,
            resource: ResourceType.WOOD,
            cards: { scope: TargetScope.BOARD },
          },
        },
      ],
    });
    const defs: Record<number, CardDef> = { 10: makeDef(10, [activeState]) };
    const gameState = makeGameState({
      instances: { 1: instance },
      board: [1],
    });
    const result = getEffectiveProductions({ wood: 1 }, activeState, gameState, defs, instance, {});
    expect(result).toEqual({ wood: 1 });
  });

  it('ignores INCREASE_PRODUCTION passive without resourcePerCard', () => {
    const instance = makeInstance(1, 10, 1);
    const activeState = makeCardState(1, {
      passives: [{ id: 'p1', type: PassiveType.INCREASE_PRODUCTION }],
    });
    const defs: Record<number, CardDef> = { 10: makeDef(10, [activeState]) };
    const gameState = makeGameState({ instances: { 1: instance }, board: [1] });
    const result = getEffectiveProductions({ gold: 2 }, activeState, gameState, defs, instance, {});
    expect(result).toEqual({ gold: 2 });
  });

  it('stacks sticker bonus and resourcePerCard bonus', () => {
    const instance: CardInstance = {
      id: 1,
      cardId: 10,
      stateId: 1,
      stickers: { 1: [101] },
      trackProgress: [],
      cumulated: 0,
    };
    const other = makeInstance(2, 20, 1);
    const stickers: Record<number, Sticker> = {
      101: { id: 101, type: 'add', production: 'gold', glory: 0, description: '' },
    };
    const activeState = makeCardState(1, {
      passives: [
        {
          id: 'p1',
          type: PassiveType.INCREASE_PRODUCTION,
          resourcePerCard: {
            amount: 1,
            resource: ResourceType.GOLD,
            cards: { scope: TargetScope.BOARD },
          },
        },
      ],
    });
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [activeState]),
      20: makeDef(20, [makeCardState(1)]),
    };
    const gameState = makeGameState({
      instances: { 1: instance, 2: other },
      board: [1, 2],
    });
    // base gold: 2, sticker: +1, resourcePerCard: 1 matching card × 1 = +1 → total 4
    const result = getEffectiveProductions(
      { gold: 2 },
      activeState,
      gameState,
      defs,
      instance,
      stickers,
    );
    expect(result).toEqual({ gold: 4 });
  });
});

// — tagClass —

describe('tagClass', () => {
  it('returns tag class for "enemy"', () => {
    expect(tagClass('enemy', true)).toBe('border bg-tag-enemy/10 border-tag-enemy');
  });

  it('returns tag class for "building"', () => {
    expect(tagClass('building', false)).toBe('border bg-tag-building/10 border-tag-building');
  });

  it('returns tag class for "person"', () => {
    expect(tagClass('person', false)).toBe('border bg-tag-person/10 border-tag-person');
  });

  it('returns tag class for "seafaring"', () => {
    expect(tagClass('seafaring', false)).toBe('border bg-tag-seafaring/10 border-tag-seafaring');
  });

  it('returns tag class for "land"', () => {
    expect(tagClass('land', false)).toBe('border bg-tag-land/10 border-tag-land');
  });

  it('returns tag class for "livestock"', () => {
    expect(tagClass('livestock', false)).toBe('border bg-tag-livestock/10 border-tag-livestock');
  });

  it('is case-insensitive', () => {
    expect(tagClass('ENEMY', true)).toBe('border bg-tag-enemy/10 border-tag-enemy');
    expect(tagClass('Building', false)).toBe('border bg-tag-building/10 border-tag-building');
  });

  it('returns generic tag class for unknown tags', () => {
    expect(tagClass('unknown', false)).toBe('border bg-tag-tag/10 border-tag-tag');
  });
});

// — getActiveState —

describe('getActiveState', () => {
  it('returns the matching card state', () => {
    const instance = makeInstance(1, 10, 2);
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [makeCardState(1), makeCardState(2)]),
    };
    const state = getActiveState(instance, defs);
    expect(state.id).toBe(2);
  });

  it('throws when the card def is not found', () => {
    const instance = makeInstance(1, 99, 1);
    expect(() => getActiveState(instance, {})).toThrow('Card def not found: 99');
  });

  it('throws when the state is not found on the card', () => {
    const instance = makeInstance(1, 10, 99);
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [makeCardState(1)]),
    };
    expect(() => getActiveState(instance, defs)).toThrow('State 99 not found on card 10');
  });
});

// — canAffordResources —

describe('canAffordResources', () => {
  it('returns true when cost has no resources', () => {
    expect(canAffordResources({ gold: 5 }, {})).toBe(true);
  });

  it('returns true when cost resources array is empty', () => {
    expect(canAffordResources({ gold: 5 }, { resources: [] })).toBe(true);
  });

  it('returns true when available exactly meets the cost', () => {
    expect(canAffordResources({ gold: 3 }, { resources: [{ gold: 3 }] })).toBe(true);
  });

  it('returns true when available exceeds the cost', () => {
    expect(canAffordResources({ gold: 5, wood: 2 }, { resources: [{ gold: 3, wood: 1 }] })).toBe(
      true,
    );
  });

  it('returns false when a resource is insufficient', () => {
    expect(canAffordResources({ gold: 2 }, { resources: [{ gold: 3 }] })).toBe(false);
  });

  it('returns false when a required resource is missing', () => {
    expect(canAffordResources({ wood: 5 }, { resources: [{ gold: 1 }] })).toBe(false);
  });
});

// — getTrackGlory —

describe('getTrackGlory', () => {
  it('returns 0 when track is undefined', () => {
    const instance = makeInstance(1, 10, 1);
    const cs = makeCardState(1);
    expect(getTrackGlory(instance, cs)).toBe(0);
  });

  it('returns 0 when trackProgress is empty even if track exists', () => {
    const instance = makeInstance(1, 10, 1);
    const cs = makeCardState(1, {
      track: {
        steps: [{ id: 1, cost: {}, onClick: { glory: 3 } }],
        inOrder: false,
        cumulative: false,
        endsTurn: false,
      },
    });
    expect(getTrackGlory(instance, cs)).toBe(0);
  });

  it('sums glory from completed track steps', () => {
    const instance: CardInstance = {
      id: 1,
      cardId: 10,
      stateId: 1,
      stickers: {},
      trackProgress: [1, 2],
      cumulated: 0,
    };
    const cs = makeCardState(1, {
      track: {
        steps: [
          { id: 1, cost: {}, onClick: { glory: 3 } },
          { id: 2, cost: {}, onClick: { glory: 5 } },
        ],
        inOrder: false,
        cumulative: false,
        endsTurn: false,
      },
    });
    expect(getTrackGlory(instance, cs)).toBe(8);
  });

  it('ignores track steps not in trackProgress', () => {
    const instance: CardInstance = {
      id: 1,
      cardId: 10,
      stateId: 1,
      stickers: {},
      trackProgress: [1],
      cumulated: 0,
    };
    const cs = makeCardState(1, {
      track: {
        steps: [
          { id: 1, cost: {}, onClick: { glory: 4 } },
          { id: 2, cost: {}, onClick: { glory: 6 } },
        ],
        inOrder: false,
        cumulative: false,
        endsTurn: false,
      },
    });
    expect(getTrackGlory(instance, cs)).toBe(4);
  });

  it('treats missing onClick.glory as 0', () => {
    const instance: CardInstance = {
      id: 1,
      cardId: 10,
      stateId: 1,
      stickers: {},
      trackProgress: [1],
      cumulated: 0,
    };
    const cs = makeCardState(1, {
      track: {
        steps: [{ id: 1, cost: {}, onClick: {} }],
        inOrder: false,
        cumulative: false,
        endsTurn: false,
      },
    });
    expect(getTrackGlory(instance, cs)).toBe(0);
  });
});

// — getInstancesTriggerEffects —

describe('getInstancesTriggerEffects', () => {
  it('returns empty array when no instances have the trigger', () => {
    const instance = makeInstance(1, 10, 1);
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [makeCardState(1, { actions: [] })]),
    };
    const result = getInstancesTriggerEffects([instance], defs, Trigger.ON_PLAY);
    expect(result).toEqual([]);
  });

  it('collects effects matching the trigger', () => {
    const instance = makeInstance(1, 10, 1);
    const effect = {
      id: 'effect1',
      label: 'Test',
      actions: [{ id: 1, type: ActionType.ADD_RESOURCES, cards: { scope: TargetScope.SELF } }],
      trigger: Trigger.ON_PLAY,
      optional: false,
    };
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [makeCardState(1, { actions: [effect] })]),
    };
    const result = getInstancesTriggerEffects([instance], defs, Trigger.ON_PLAY);
    expect(result).toHaveLength(1);
    expect(result[0].effectDef).toBe(effect);
    expect(result[0].sourceInstanceId).toBe(1);
  });

  it('injects a CHOOSE_STATE effect for ON_DISCOVER when card has chooseState', () => {
    const instance = makeInstance(1, 10, 1);
    const defs: Record<number, CardDef> = {
      10: { id: 10, name: 'Card 10', chooseState: true, states: [makeCardState(1)] },
    };
    const result = getInstancesTriggerEffects([instance], defs, Trigger.ON_DISCOVER);
    expect(result).toHaveLength(1);
    expect(result[0].effectDef.actions[0].type).toBe(ActionType.CHOOSE_STATE);
  });

  it('aggregates effects from multiple instances', () => {
    const inst1 = makeInstance(1, 10, 1);
    const inst2 = makeInstance(2, 11, 1);
    const effect1 = {
      id: 'e1',
      label: 'E1',
      actions: [{ id: 1, type: ActionType.ADD_RESOURCES }],
      trigger: Trigger.END_OF_TURN,
      optional: false,
    };
    const effect2 = {
      id: 'e2',
      label: 'E2',
      actions: [{ id: 1, type: ActionType.DISCARD_CARD }],
      trigger: Trigger.END_OF_TURN,
      optional: false,
    };
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [makeCardState(1, { actions: [effect1] })]),
      11: makeDef(11, [makeCardState(1, { actions: [effect2] })]),
    };
    const result = getInstancesTriggerEffects([inst1, inst2], defs, Trigger.END_OF_TURN);
    expect(result).toHaveLength(2);
  });
});

// — getAffectedCardsByBoardEffects —

describe('getAffectedCardsByBoardEffects', () => {
  it('returns empty array when boardEffects is empty', () => {
    const state = makeGameState();
    expect(getAffectedCardsByBoardEffects(state, PassiveType.BLOCK)).toEqual({});
  });

  it('returns instance ids affected by the matching passive type', () => {
    const state = makeGameState({
      boardEffects: {
        1: [{ id: 'be1', type: PassiveType.BLOCK, cards: { ids: [10, 11] } }],
      },
    });
    expect(getAffectedCardsByBoardEffects(state, PassiveType.BLOCK)).toEqual({ 1: [10, 11] });
  });

  it('ignores effects with a different passive type', () => {
    const state = makeGameState({
      boardEffects: {
        1: [{ id: 'be1', type: PassiveType.STAY_IN_PLAY, cards: { ids: [10] } }],
      },
    });
    expect(getAffectedCardsByBoardEffects(state, PassiveType.BLOCK)).toEqual({});
  });

  it('ignores effects without a cards.ids list', () => {
    const state = makeGameState({
      boardEffects: {
        1: [{ id: 'be1', type: PassiveType.BLOCK }],
      },
    });
    expect(getAffectedCardsByBoardEffects(state, PassiveType.BLOCK)).toEqual({});
  });

  it('aggregates ids from multiple board effect sources', () => {
    const state = makeGameState({
      boardEffects: {
        1: [{ id: 'be1', type: PassiveType.BLOCK, cards: { ids: [10] } }],
        2: [{ id: 'be2', type: PassiveType.BLOCK, cards: { ids: [11] } }],
      },
    });
    expect(getAffectedCardsByBoardEffects(state, PassiveType.BLOCK)).toEqual({ 1: [10], 2: [11] });
  });
});

// — cardIsBlocked —

describe('cardIsBlocked', () => {
  it('returns false when no board effects block any card', () => {
    const state = makeGameState();
    expect(cardIsBlocked(1, state)).toBe(false);
  });

  it('returns true when the instance id is in a BLOCK board effect', () => {
    const state = makeGameState({
      boardEffects: {
        99: [{ id: 'be1', type: PassiveType.BLOCK, cards: { ids: [1] } }],
      },
    });
    expect(cardIsBlocked(1, state)).toBe(true);
  });

  it('returns false when another instance is blocked but not this one', () => {
    const state = makeGameState({
      boardEffects: {
        99: [{ id: 'be1', type: PassiveType.BLOCK, cards: { ids: [2] } }],
      },
    });
    expect(cardIsBlocked(1, state)).toBe(false);
  });
});

// — cardShouldStayInPlay —

describe('cardShouldStayInPlay', () => {
  it('returns false when the instance does not exist', () => {
    const state = makeGameState();
    expect(cardShouldStayInPlay(99, state, {})).toBe(false);
  });

  it('returns true when the active state has a STAY_IN_PLAY passive', () => {
    const instance = makeInstance(1, 10, 1);
    const defs = {
      10: makeDef(10, [
        makeCardState(1, { passives: [{ id: 'p1', type: PassiveType.STAY_IN_PLAY }] }),
      ]),
    };
    const state = makeGameState({ instances: { 1: instance } });
    expect(cardShouldStayInPlay(1, state, defs)).toBe(true);
  });

  it('returns true when the instance is covered by a STAY_IN_PLAY board effect', () => {
    const instance = makeInstance(1, 10, 1);
    const defs = { 10: makeDef(10, [makeCardState(1)]) };
    const state = makeGameState({
      instances: { 1: instance },
      boardEffects: {
        99: [{ id: 'be1', type: PassiveType.STAY_IN_PLAY, cards: { ids: [1] } }],
      },
    });
    expect(cardShouldStayInPlay(1, state, defs)).toBe(true);
  });

  it('returns true when the instance has the stays_in_play sticker (id 7)', () => {
    const instance: CardInstance = {
      id: 1,
      cardId: 10,
      stateId: 1,
      stickers: { 1: [7] },
      trackProgress: [],
      cumulated: 0,
    };
    const defs = { 10: makeDef(10, [makeCardState(1)]) };
    const state = makeGameState({ instances: { 1: instance } });
    expect(cardShouldStayInPlay(1, state, defs)).toBe(true);
  });

  it('returns false when none of the stay-in-play conditions apply', () => {
    const instance = makeInstance(1, 10, 1);
    const defs = { 10: makeDef(10, [makeCardState(1)]) };
    const state = makeGameState({ instances: { 1: instance } });
    expect(cardShouldStayInPlay(1, state, defs)).toBe(false);
  });
});
