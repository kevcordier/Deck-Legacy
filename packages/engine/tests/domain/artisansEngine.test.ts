import { makeInstance, makeState } from './fixtures';
import { isWithinAmountLimits } from '@engine/application/session/input/isWithinAmountLimits';
import { GameAggregate } from '@engine/domain/aggregates/GameAggregate';
import { EquipStrategy } from '@engine/domain/cardAction/EquipStrategy';
import { getCardProductionChoices } from '@engine/domain/cards/getCardProductionChoices';
import { getProductionChoicesForAction } from '@engine/domain/cards/getProductionChoicesForAction';
import { cardSelector } from '@engine/domain/cards/selection/cardSelector';
import { cardShouldStayInPlay } from '@engine/domain/cards/selection/cardShouldStayInPlay';
import { getEffectiveGlory } from '@engine/domain/cards/selection/getEffectiveGlory';
import { resolveActionEffect } from '@engine/domain/effects/resolveActionEffect';
import { withGainReplacement } from '@engine/domain/effects/withGainReplacement';
import {
  ActionEffectType,
  CardTag,
  PassiveType,
  Phase,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import { destroyCards } from '@engine/domain/state/destroyCards';
import { leaveUpgradedCard } from '@engine/domain/state/leaveUpgradedCard';
import { pruneEquipment } from '@engine/domain/state/pruneEquipment';
import type { CardAction, CardDef, GameState } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const PERSON = 1;
const RING = 2;
const HALL = 3;

const defs: Record<number, CardDef> = {
  1: {
    id: 1,
    name: 'Person',
    states: [
      {
        id: 1,
        name: 'Person',
        tags: [CardTag.PERSON],
        productions: [{ gold: 1 }],
        actions: [{ id: '1-1-1', actionEffects: [] }],
      },
    ],
  },
  2: {
    id: 2,
    name: 'Ring',
    states: [
      {
        id: 1,
        name: 'Ring',
        tags: [CardTag.ITEM],
        equip: CardTag.PERSON,
        productions: [{ wood: 1 }],
      },
    ],
  },
  3: {
    id: 3,
    name: 'Hall',
    states: [
      {
        id: 1,
        name: 'Hall',
        tags: [CardTag.BUILDING],
        glory: { amount: 0, emptyValues: 9, gridBonus: 4 },
        upgrade: [{ cost: {}, upgradeTo: 2 }],
      },
      { id: 2, name: 'Hall 2', tags: [CardTag.BUILDING] },
    ],
  },
};

function stateWith(overrides: Partial<GameState> = {}): GameState {
  return makeState({
    instances: {
      [PERSON]: makeInstance({ id: PERSON, cardId: 1 }),
      [RING]: makeInstance({ id: RING, cardId: 2 }),
      [HALL]: makeInstance({ id: HALL, cardId: 3 }),
    },
    phase: Phase.PLAYING,
    round: 1,
    turn: 1,
    ...overrides,
  });
}

const equippedState = (overrides: Partial<GameState> = {}) =>
  stateWith({ board: [PERSON, RING], equipped: { [RING]: PERSON }, ...overrides });

describe('equipment', () => {
  it('is placed under the chosen card by EQUIP', () => {
    const strategy = new EquipStrategy(defs);
    const state = stateWith({ board: [PERSON, RING] });
    const base = { id: 'x', type: ActionEffectType.EQUIP, sourceInstanceId: RING };
    expect(strategy.apply(state, base)).toBe(state);
    expect(strategy.apply(state, { ...base, instanceIds: [PERSON] }).equipped).toEqual({
      [RING]: PERSON,
    });
  });

  it('keeps its link only while both cards are in play', () => {
    const state = equippedState();
    expect(pruneEquipment(state)).toBe(state);
    expect(pruneEquipment(stateWith())).toEqual(stateWith());
    expect(pruneEquipment({ ...state, board: [RING] }).equipped).toEqual({});
  });

  it('is destroyed with its holder', () => {
    const state = destroyCards(equippedState(), [PERSON]);
    expect(state.destroyedPile).toEqual([PERSON, RING]);
    expect(state.equipped).toEqual({});
  });

  it('is selected only as the holder, or with `equipped`', () => {
    const state = equippedState();
    expect(cardSelector({ scope: [TargetScope.BOARD] }, -1, state, defs, {})).toEqual([PERSON]);
    expect(
      cardSelector({ scope: [TargetScope.BOARD], equipped: true }, -1, state, defs, {}),
    ).toEqual([RING]);
    expect(cardSelector({ scope: [TargetScope.HOLDER] }, RING, state, defs, {})).toEqual([PERSON]);
    expect(cardSelector({ scope: [TargetScope.HOLDER] }, PERSON, state, defs, {})).toEqual([]);
  });

  it('stays in play with its holder', () => {
    const state = equippedState();
    expect(cardShouldStayInPlay(RING, state, defs)).toBe(false);
    state.instances[PERSON].stickers[1] = [7];
    expect(cardShouldStayInPlay(RING, state, defs)).toBe(true);
  });

  it('produces through its holder only', () => {
    const state = equippedState();
    expect(getCardProductionChoices(state.instances[RING], state, defs, {})).toEqual([]);
    expect(getCardProductionChoices(state.instances[PERSON], state, defs, {})).toEqual([
      { gold: 1, wood: 1 },
    ]);
  });

  it('runs GAIN_BEFORE_HOLDER_ACTION before the holder ✓ effects', () => {
    const state = equippedState({
      drawPile: [HALL],
      boardEffects: {
        [RING]: [
          {
            id: 'pearl',
            type: PassiveType.GAIN_BEFORE_HOLDER_ACTION,
            actionEffects: [
              { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 2 } },
            ],
          },
        ],
      },
    });
    const action = defs[1].states[0].actions?.[0] as CardAction;
    const gs = new GameAggregate('game', state, defs, {}).cardAction(action, PERSON);
    expect(gs.resources.gold).toBe(2);
  });
});

describe('production bonuses', () => {
  const withBonus = (choices: 'produced' | 'any', base = { gold: 1 }) => {
    const state = stateWith({
      board: [PERSON],
      boardEffects: {
        9: [
          { id: 'p', type: PassiveType.ADD_PRODUCTION_CHOICE, cards: { ids: [PERSON] }, choices },
        ],
      },
    });
    return getProductionChoicesForAction(base, state, defs, state.instances[PERSON], {});
  };

  it("'produced' adds 1 of a resource the card already produces", () => {
    expect(withBonus('produced')).toEqual([{ gold: 2 }]);
    expect(withBonus('produced', {} as { gold: number })).toEqual([{}]);
  });

  it("'any' adds 1 of any offered resource", () => {
    expect(withBonus('any')).toHaveLength(6);
  });
});

describe('REPLACE_GAIN', () => {
  const jeweler = stateWith({
    boardEffects: {
      9: [{ id: 'j', type: PassiveType.REPLACE_GAIN, resources: { iron: 1, goods: 1 } }],
    },
  });

  it('turns a fixed iron gain into a choice with goods', () => {
    expect(
      withGainReplacement(
        { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { iron: 2 } },
        jeweler,
      ).resources,
    ).toEqual({ choice: [{ iron: 2 }, { goods: 2 }] });
  });

  it('leaves other gains and choices as they are', () => {
    const gold = { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 2 } };
    expect(withGainReplacement(gold, jeweler)).toBe(gold);
    const choice = {
      id: 1,
      type: ActionEffectType.ADD_RESOURCES,
      resources: { choice: [{ iron: 1 }] },
    };
    expect(withGainReplacement(choice, jeweler)).toBe(choice);
  });

  it('lets productions of iron become goods', () => {
    expect(
      getProductionChoicesForAction({ iron: 1 }, jeweler, defs, jeweler.instances[PERSON], {}),
    ).toEqual([{ iron: 1 }, { goods: 1 }]);
  });
});

describe('amount paid', () => {
  it('counts for a `paid` value, divided by `per`', () => {
    const [resolved] = resolveActionEffect(
      {
        id: 1,
        type: ActionEffectType.ADD_GLORY,
        cards: { scope: [TargetScope.SELF] },
        valuePerElement: { amount: 1, paid: true, per: 2 },
      },
      HALL,
      stateWith(),
      defs,
      {},
      { paidAmount: 7 },
    );
    expect(resolved.value).toBe(3);
  });

  it("applies the effects once with amountPer 'all'", () => {
    const action: CardAction = {
      id: 'statues',
      cost: { resources: [{ [ResourceType.STONE]: 'any' }] },
      amountPer: 'all',
      actionEffects: [
        {
          id: 1,
          type: ActionEffectType.ADD_CUMULATED,
          cards: { scope: [TargetScope.SELF] },
          value: 1,
        },
      ],
    };
    const state = stateWith({ permanents: [HALL], resources: { stone: 6 } });
    const gs = new GameAggregate('game', state, defs, {}).cardAction(action, HALL, undefined, 6);
    expect(gs.instances[HALL].cumulated).toBe(1);
  });

  it('respects the action limits', () => {
    const action: CardAction = { id: 'a', actionEffects: [], amountLimits: { min: 2, max: 20 } };
    expect(isWithinAmountLimits({ id: 'b', actionEffects: [] })).toBe(true);
    expect(isWithinAmountLimits(action)).toBe(false);
    expect(isWithinAmountLimits(action, 2)).toBe(true);
    expect(isWithinAmountLimits(action, 21)).toBe(false);
    expect(isWithinAmountLimits({ ...action, amountLimits: {} }, 1)).toBe(true);
  });
});

describe('grid bonus', () => {
  it('counts once the 9 medals are written', () => {
    const state = stateWith();
    const glory = (glories: number[]) => {
      const instance = { ...state.instances[HALL], glories };
      return getEffectiveGlory(defs[3].states[0], state, defs, instance, {});
    };
    expect(glory([1, 2])).toBe(3);
    expect(glory([1, 1, 1, 1, 1, 1, 1, 1, 1])).toBe(9);
    expect(glory([1, 2, 3, 2, 3, 1, 3, 1, 2])).toBe(18 + 7 * 4); // every line but the 3-3-3 diagonal
  });
});

describe('UPGRADED_ON_TOP_OF_DECK', () => {
  it('puts the upgraded card on top of the deck instead of the discard pile', () => {
    const passive = {
      id: 'architect',
      type: PassiveType.UPGRADED_ON_TOP_OF_DECK,
      cards: { tags: [CardTag.BUILDING] },
    };
    const state = stateWith({ board: [HALL], drawPile: [PERSON], boardEffects: { 9: [passive] } });
    const placed = leaveUpgradedCard(state, HALL, defs, {});
    expect(placed.drawPile).toEqual([HALL, PERSON]);
    expect(placed.discardPile).toEqual([]);
    expect(leaveUpgradedCard(stateWith({ board: [HALL] }), HALL, defs, {}).discardPile).toEqual([
      HALL,
    ]);
  });
});
