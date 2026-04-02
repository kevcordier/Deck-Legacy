import { describe, it, expect } from 'vitest';
import {
  getEffectiveProductions,
  tagClass,
  getActiveState,
  canAffordResources,
  getInstancesTriggerEffects,
} from '@engine/application/cardHelpers';
import { ActionType, Trigger, TargetScope, ResourceType } from '@engine/domain/enums';
import type { CardDef, CardInstance, Sticker } from '@engine/domain/types';

// — helpers —

const makeInstance = (id: number, cardId: number, stateId: number): CardInstance => ({
  id,
  cardId,
  stateId,
  stickers: {},
  trackProgress: null,
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
      trackProgress: null,
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
      trackProgress: null,
    };
    const stickers: Record<number, Sticker> = {
      101: { id: 101, type: 'add', production: 'gold', glory: 0, description: '' },
    };
    const result = getEffectiveProductions({ gold: 2 }, instance, stickers);
    expect(result).toEqual({ gold: 2 });
  });

  it('ignores non-add sticker types', () => {
    const instance: CardInstance = {
      id: 1,
      cardId: 10,
      stateId: 1,
      stickers: { 1: [101] },
      trackProgress: null,
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
  it('returns tag-enemy for "enemy"', () => {
    expect(tagClass('enemy')).toBe('tag tag-enemy');
  });

  it('returns tag-enemy for "ennemy" (typo variant)', () => {
    expect(tagClass('ennemy')).toBe('tag tag-enemy');
  });

  it('returns tag-building for "building"', () => {
    expect(tagClass('building')).toBe('tag tag-building');
  });

  it('returns tag-seafaring for "seafaring"', () => {
    expect(tagClass('seafaring')).toBe('tag tag-seafaring');
  });

  it('returns tag-event for "event"', () => {
    expect(tagClass('event')).toBe('tag tag-event');
  });

  it('is case-insensitive', () => {
    expect(tagClass('ENEMY')).toBe('tag tag-enemy');
    expect(tagClass('Building')).toBe('tag tag-building');
  });

  it('returns generic tag class for unknown tags', () => {
    expect(tagClass('unknown')).toBe('tag');
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
