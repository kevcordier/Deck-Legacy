import { describe, it, expect } from 'vitest';
import {
  getEffectiveProductions,
  tagClass,
  getActiveState,
  canAffordResources,
  getInstancesTriggerEffects,
  getTrackGlory,
} from '@engine/application/cardHelpers';
import { ActionType, Trigger, TargetScope, ResourceType } from '@engine/domain/enums';
import type { CardDef, CardInstance, Sticker } from '@engine/domain/types';

// — helpers —

const makeInstance = (id: number, cardId: number, stateId: number): CardInstance => ({
  id,
  cardId,
  stateId,
  stickers: {},
  trackProgress: [],
});

const makeDef = (id: number, states: CardDef['states'] = []): CardDef => ({
  id,
  name: `Card ${id}`,
  states,
});

const makeState = (id: number, overrides: Partial<CardDef['states'][number]> = {}) => ({
  id,
  name: `State ${id}`,
  ...overrides,
});

// — getEffectiveProductions —

describe('getEffectiveProductions', () => {
  it('returns base resources when no stickers are present', () => {
    const instance = makeInstance(1, 10, 1);
    const result = getEffectiveProductions({ gold: 2, wood: 1 }, instance);
    expect(result).toEqual({ gold: 2, wood: 1 });
  });

  it('adds sticker production bonuses to base', () => {
    const instance: CardInstance = {
      id: 1,
      cardId: 10,
      stateId: 1,
      stickers: { 1: [101] },
      trackProgress: [],
    };
    const stickers: Record<number, Sticker> = {
      101: { id: 101, type: 'add', production: 'gold', glory: 0, description: '' },
    };
    const result = getEffectiveProductions({ gold: 2 }, instance, stickers);
    expect(result).toEqual({ gold: 3 });
  });

  it('ignores stickers of a different stateId', () => {
    const instance: CardInstance = {
      id: 1,
      cardId: 10,
      stateId: 2,
      stickers: { 1: [101] }, // stickers for state 1, not active state 2
      trackProgress: [],
    };
    const stickers: Record<number, Sticker> = {
      101: { id: 101, type: 'add', production: 'gold', glory: 0, description: '' },
    };
    const result = getEffectiveProductions({ gold: 2 }, instance, stickers);
    expect(result).toEqual({ gold: 2 });
  });

  it('ignores sticker ids that have no entry in the stickers record', () => {
    const instance: CardInstance = {
      id: 1,
      cardId: 10,
      stateId: 1,
      stickers: { 1: [999] }, // sticker 999 does not exist in stickers map
      trackProgress: [],
    };
    const result = getEffectiveProductions({ gold: 2 }, instance, {});
    expect(result).toEqual({ gold: 2 });
  });

  it('ignores non-add sticker types', () => {
    const instance: CardInstance = {
      id: 1,
      cardId: 10,
      stateId: 1,
      stickers: { 1: [101] },
      trackProgress: [],
    };
    const stickers: Record<number, Sticker> = {
      101: { id: 101, type: 'remove', production: ResourceType.GOLD, glory: 0, description: '' },
    };
    const result = getEffectiveProductions({ gold: 2 }, instance, stickers);
    expect(result).toEqual({ gold: 2 });
  });
});

// — tagClass —

describe('tagClass', () => {
  it('returns tag class for "enemy"', () => {
    expect(tagClass('enemy', true)).toBe(
      'bg-base-ink/10 border border-base-ink/20 bg-red-500/10 border-red-500/20',
    );
  });

  it('returns tag class for "building"', () => {
    expect(tagClass('building', false)).toBe(
      'bg-base-ink/10 border border-base-ink/20 bg-gray-500/10 border-gray-300/20',
    );
  });

  it('returns tag class for "person"', () => {
    expect(tagClass('person', false)).toBe(
      'bg-base-ink/10 border border-base-ink/20 bg-yellow-500/10 border-yellow-500/20',
    );
  });

  it('returns tag class for "seafaring"', () => {
    expect(tagClass('seafaring', false)).toBe(
      'bg-base-ink/10 border border-base-ink/20 bg-sky-500/10 border-sky-300/20',
    );
  });

  it('returns tag class for "land"', () => {
    expect(tagClass('land', false)).toBe(
      'bg-base-ink/10 border border-base-ink/20 bg-green-500/10 border-green-500/20',
    );
  });

  it('returns tag class for "livestock"', () => {
    expect(tagClass('livestock', false)).toBe(
      'bg-base-ink/10 border border-base-ink/20 bg-orange-500/10 border-orange-500/20',
    );
  });

  it('returns tag class for "event"', () => {
    expect(tagClass('event', false)).toBe('bg-base-ink/10 border border-base-ink/20');
  });

  it('is case-insensitive', () => {
    expect(tagClass('ENEMY', true)).toBe(
      'bg-base-ink/10 border border-base-ink/20 bg-red-500/10 border-red-500/20',
    );
    expect(tagClass('Building', false)).toBe(
      'bg-base-ink/10 border border-base-ink/20 bg-gray-500/10 border-gray-300/20',
    );
  });

  it('returns generic tag class for unknown tags', () => {
    expect(tagClass('unknown', false)).toBe('bg-base-ink/10 border border-base-ink/20');
  });
});

// — getActiveState —

describe('getActiveState', () => {
  it('returns the matching card state', () => {
    const instance = makeInstance(1, 10, 2);
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [makeState(1), makeState(2)]),
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
      10: makeDef(10, [makeState(1)]),
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
    const cs = makeState(1);
    expect(getTrackGlory(instance, cs)).toBe(0);
  });

  it('returns 0 when trackProgress is empty even if track exists', () => {
    const instance = makeInstance(1, 10, 1);
    const cs = makeState(1, {
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
    };
    const cs = makeState(1, {
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
    };
    const cs = makeState(1, {
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
    };
    const cs = makeState(1, {
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
      10: makeDef(10, [makeState(1, { cardEffects: [] })]),
    };
    const result = getInstancesTriggerEffects([instance], defs, Trigger.ON_PLAY);
    expect(result).toEqual([]);
  });

  it('collects effects matching the trigger', () => {
    const instance = makeInstance(1, 10, 1);
    const effect = {
      label: 'Test',
      actions: [{ id: 1, type: ActionType.ADD_RESOURCES, cards: { scope: TargetScope.SELF } }],
      trigger: Trigger.ON_PLAY,
      optional: false,
    };
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [makeState(1, { cardEffects: [effect] })]),
    };
    const result = getInstancesTriggerEffects([instance], defs, Trigger.ON_PLAY);
    expect(result).toHaveLength(1);
    expect(result[0].effectDef).toBe(effect);
    expect(result[0].sourceInstanceId).toBe(1);
  });

  it('injects a CHOOSE_STATE effect for ON_DISCOVER when card has chooseState', () => {
    const instance = makeInstance(1, 10, 1);
    const defs: Record<number, CardDef> = {
      10: { id: 10, name: 'Card 10', chooseState: true, states: [makeState(1)] },
    };
    const result = getInstancesTriggerEffects([instance], defs, Trigger.ON_DISCOVER);
    expect(result).toHaveLength(1);
    expect(result[0].effectDef.actions[0].type).toBe(ActionType.CHOOSE_STATE);
  });

  it('aggregates effects from multiple instances', () => {
    const inst1 = makeInstance(1, 10, 1);
    const inst2 = makeInstance(2, 11, 1);
    const effect1 = {
      label: 'E1',
      actions: [{ id: 1, type: ActionType.ADD_RESOURCES }],
      trigger: Trigger.END_OF_TURN,
      optional: false,
    };
    const effect2 = {
      label: 'E2',
      actions: [{ id: 1, type: ActionType.DISCARD_CARD }],
      trigger: Trigger.END_OF_TURN,
      optional: false,
    };
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [makeState(1, { cardEffects: [effect1] })]),
      11: makeDef(11, [makeState(1, { cardEffects: [effect2] })]),
    };
    const result = getInstancesTriggerEffects([inst1, inst2], defs, Trigger.END_OF_TURN);
    expect(result).toHaveLength(2);
  });
});
