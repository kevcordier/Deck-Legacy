import { makeInstance, makeState } from './fixtures';
import { isValidOrder } from '@engine/application/session/input/isValidOrder';
import { sanitizeChoice } from '@engine/application/session/input/sanitizeChoice';
import { GameAggregate } from '@engine/domain/aggregates/GameAggregate';
import { AddStickerStrategy } from '@engine/domain/cardAction/AddStickerStrategy';
import { EquipStrategy } from '@engine/domain/cardAction/EquipStrategy';
import { OrderCardsStrategy } from '@engine/domain/cardAction/OrderCardsStrategy';
import { RemoveResourceOnCardStrategy } from '@engine/domain/cardAction/RemoveResourceOnCardStrategy';
import { canAffordCost } from '@engine/domain/cards/canAffordCost';
import { getEffectiveUpgradeCost } from '@engine/domain/cards/getEffectiveUpgradeCost';
import { getUsableActionEffects } from '@engine/domain/cards/getUsableActionEffects';
import { cardSelector } from '@engine/domain/cards/selection/cardSelector';
import { countValuePerElement } from '@engine/domain/cards/selection/countValuePerElement';
import { evaluateCondition } from '@engine/domain/cards/selection/evaluateCondition';
import { getActivePassives } from '@engine/domain/cards/selection/getActivePassives';
import { resolveCost } from '@engine/domain/costResolver';
import { resolveActionEffect } from '@engine/domain/effects/resolveActionEffect';
import {
  ActionEffectType,
  CardTag,
  PassiveType,
  PendingChoiceType,
  Phase,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import { leaveUpgradedCard } from '@engine/domain/state/leaveUpgradedCard';
import type { CardAction, CardDef, GameState, PendingChoice, Sticker } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const PERSON = 1;
const GEAR = 2;
const SHED = 3;
const TOWER = 4;

const stickers: Record<number, Sticker> = { 1: { id: 1, production: 'gold' } };

const defs: Record<number, CardDef> = {
  1: {
    id: 1,
    name: 'Person',
    states: [
      {
        id: 1,
        name: 'Person',
        tags: [CardTag.PERSON],
        actions: [
          { id: 'checked', actionEffects: [] },
          { id: 'timed', endsTurn: true, actionEffects: [] },
          { id: 'free', unlimited: true, actionEffects: [] },
        ],
      },
    ],
  },
  2: {
    id: 2,
    name: 'Gear',
    states: [
      {
        id: 1,
        name: 'Gear',
        tags: [CardTag.INVENTION],
        equip: CardTag.PERSON,
        passives: [{ id: 'p', type: PassiveType.STAY_IN_PLAY }],
        actions: [{ id: 'use', actionEffects: [] }],
      },
    ],
  },
  3: {
    id: 3,
    name: 'Shed',
    states: [
      {
        id: 1,
        name: 'Shed',
        tags: [CardTag.BUILDING, CardTag.INVENTION],
        productions: [{ gold: 1 }],
        track: { inOrder: true, steps: [{ id: 1 }, { id: 2 }] },
        passives: [
          {
            id: 'count',
            type: PassiveType.COUNT_AS,
            cards: { tags: [CardTag.INVENTION] },
            valuePerElement: { amount: 1, markedSteps: true },
          },
        ],
        actions: [
          {
            id: 'sticker',
            trigger: Trigger.ON_STICKER_ADDED,
            condition: { type: 'stickerAdded', ids: [1] },
            actionEffects: [],
          },
        ],
        upgrade: [{ cost: { resources: [{ gold: 3, wood: 1 }] }, upgradeTo: 1 }],
      },
    ],
  },
  4: {
    id: 4,
    name: 'Tower',
    states: [{ id: 1, name: 'Tower', tags: [CardTag.PERMANENT, CardTag.BUILDING] }],
  },
};

function stateWith(overrides: Partial<GameState> = {}): GameState {
  return makeState({
    instances: {
      [PERSON]: makeInstance({ id: PERSON, cardId: 1 }),
      [GEAR]: makeInstance({ id: GEAR, cardId: 2 }),
      [SHED]: makeInstance({ id: SHED, cardId: 3 }),
      [TOWER]: makeInstance({ id: TOWER, cardId: 4 }),
    },
    phase: Phase.PLAYING,
    round: 1,
    turn: 1,
    ...overrides,
  });
}

describe('discounted upgrade cost', () => {
  const crane = {
    id: 'crane',
    type: PassiveType.ADJUST_UPDATE_COST,
    amount: 2,
    cards: { tags: [CardTag.BUILDING] },
  };

  it('is lowered by the passive amount, the player choosing the units paid', () => {
    const state = stateWith({
      board: [SHED],
      boardEffects: { 9: [crane] },
      resources: { gold: 2 },
    });
    const cost = getEffectiveUpgradeCost(
      defs[3].states[0].upgrade?.[0].cost ?? {},
      state,
      defs,
      {},
      SHED,
    );
    expect(cost.discount).toBe(2);
    expect(canAffordCost(cost, SHED, state, defs, {})).toBe(true);
    const [, choices] = resolveCost(cost, SHED, state, defs, {});
    expect(choices[0]).toMatchObject({ type: PendingChoiceType.SPLIT_RESOURCES, total: 2 });
    expect(canAffordCost(cost, SHED, stateWith({ resources: { gold: 1 } }), defs, {})).toBe(false);
  });

  it('asks nothing when it is free', () => {
    const [, choices] = resolveCost(
      { resources: [{ gold: 2 }], discount: 2 },
      SHED,
      stateWith(),
      defs,
      {},
    );
    expect(choices).toEqual([]);
  });

  it('cannot be paid with too few resources', () => {
    expect(() =>
      resolveCost(
        { resources: [{ gold: 3 }], discount: 1 },
        SHED,
        stateWith({ resources: { gold: 1 } }),
        defs,
        {},
      ),
    ).toThrow();
  });
});

describe('equipment passives and effects', () => {
  it('apply only once equipped', () => {
    const state = stateWith({ board: [PERSON, GEAR] });
    expect(getActivePassives(state, GEAR, defs)).toEqual([]);
    expect(getActivePassives(state, 99, defs)).toEqual([]);
    const equipped = new EquipStrategy(defs).apply(state, {
      id: 'x',
      type: ActionEffectType.EQUIP,
      sourceInstanceId: GEAR,
      instanceIds: [PERSON],
    });
    expect(equipped.boardEffects[GEAR]).toEqual(defs[2].states[0].passives);
  });

  it('discard the holder when a ✓ effect of the equipment is used', () => {
    const state = stateWith({
      board: [PERSON, GEAR],
      drawPile: [SHED],
      equipped: { [GEAR]: PERSON },
    });
    const action = defs[2].states[0].actions?.[0] as CardAction;
    const gs = new GameAggregate('game', state, defs, {}).cardAction(action, GEAR);
    expect(gs.discardPile).toEqual(expect.arrayContaining([PERSON, GEAR]));
  });
});

describe('COUNT_AS per element and tag', () => {
  it('counts the marked boxes as more cards, only for selections of its tags', () => {
    const state = stateWith({ board: [SHED] });
    state.instances[SHED].trackProgress = [1, 2];
    const inventions = cardSelector(
      { scope: [TargetScope.BOARD], tags: [CardTag.INVENTION] },
      -1,
      state,
      defs,
      {},
    );
    expect(inventions).toEqual([SHED, SHED, SHED]);
    expect(
      cardSelector({ scope: [TargetScope.BOARD], tags: [CardTag.BUILDING] }, -1, state, defs, {}),
    ).toEqual([SHED]);
  });
});

describe('ON_STICKER_ADDED', () => {
  it('fires on the card that got the sticker, with the stickers it got', () => {
    const state = stateWith({ board: [SHED], stickerStock: { 1: 1 } });
    const after = new AddStickerStrategy(defs, stickers).apply(state, {
      id: 'x',
      type: ActionEffectType.ADD_STICKER,
      sourceInstanceId: PERSON,
      instanceIds: [SHED],
      stickerIds: [1],
    });
    expect(after.lastAddedStickers).toEqual({ [SHED]: [1] });
    expect(Object.values(after.triggerPile).map(entry => entry.effectDef.id)).toEqual(['sticker']);
    expect(evaluateCondition({ type: 'stickerAdded' }, after, SHED, defs, {})).toBe(true);
    expect(evaluateCondition({ type: 'stickerAdded', ids: [2] }, after, SHED, defs, {})).toBe(
      false,
    );

    const [resolved] = resolveActionEffect(
      {
        id: 1,
        type: ActionEffectType.ADD_STICKER,
        cards: { scope: [TargetScope.SELF] },
        stickers: { lastAdded: true, ids: [1, 2] },
      },
      SHED,
      { ...after, stickerStock: { 1: 1 } },
      defs,
      stickers,
    );
    expect(resolved.stickerIds).toEqual([1]);
  });
});

describe('usable actions', () => {
  it('may be limited to ✓ / ⌛ effects, or ⌛ effects only', () => {
    const state = stateWith({ board: [PERSON] });
    const used = (usable?: 'activated' | 'timed') =>
      getUsableActionEffects(PERSON, state, defs, {}, usable).map(e => e.usedAction?.actionId);
    expect(used()).toEqual(['checked', 'timed', 'free']);
    expect(used('activated')).toEqual(['checked', 'timed']);
    expect(used('timed')).toEqual(['timed']);
  });
});

describe('box selectors', () => {
  const state = stateWith({ board: [SHED], discoverablePile: [TOWER, PERSON, GEAR] });

  it('take the first undiscovered card of the box that is not permanent', () => {
    expect(
      cardSelector(
        { scope: [TargetScope.BOX], withoutTags: [CardTag.PERMANENT], firstOnly: true },
        -1,
        state,
        defs,
        {},
      ),
    ).toEqual([PERSON]);
  });

  it('count the cards in play while the selecting card is in play', () => {
    const inPlay = { scope: [TargetScope.ANY], inPlayWhenInPlay: true };
    const kingdom = stateWith({ board: [SHED], drawPile: [GEAR] });
    expect(cardSelector(inPlay, SHED, kingdom, defs, {})).toEqual([]);
    expect(cardSelector(inPlay, TOWER, kingdom, defs, {})).toEqual([GEAR, SHED]);
  });
});

describe('ORDER_CARDS', () => {
  const state = stateWith({ discoverablePile: [PERSON, GEAR, SHED] });

  it('offers the next cards of the box, 1 of them may be destroyed', () => {
    const [, pending] = resolveActionEffect(
      { id: 1, type: ActionEffectType.ORDER_CARDS, value: 2 },
      TOWER,
      state,
      defs,
      {},
    );
    expect(pending[0]).toMatchObject({
      type: PendingChoiceType.ORDER_CARDS,
      choices: [PERSON, GEAR],
      pickMax: 1,
    });
    const [, none] = resolveActionEffect(
      { id: 1, type: ActionEffectType.ORDER_CARDS, value: 0 },
      TOWER,
      state,
      defs,
      {},
    );
    expect(none).toEqual([]);
  });

  it('puts them back in the given order and destroys the chosen one', () => {
    const strategy = new OrderCardsStrategy();
    const payload = { id: 'x', type: ActionEffectType.ORDER_CARDS, sourceInstanceId: TOWER };
    expect(strategy.apply(state, payload)).toBe(state);
    const after = strategy.apply(state, {
      ...payload,
      instanceIds: [GEAR],
      destroyedIds: [PERSON],
    });
    expect(after.discoverablePile).toEqual([GEAR, SHED]);
    expect(after.destroyedPile).toEqual([PERSON]);
    const single = strategy.apply(stateWith({ discoveryPile: [PERSON, GEAR] }), {
      ...payload,
      instanceIds: [GEAR, PERSON],
    });
    expect(single.discoveryPile).toEqual([GEAR, PERSON]);
  });

  it('accepts only an order of the offered cards', () => {
    const pending = {
      id: 'x',
      kind: ActionEffectType.ORDER_CARDS,
      type: PendingChoiceType.ORDER_CARDS,
      sourceInstanceId: TOWER,
      choices: [PERSON, GEAR],
      pickMin: 0,
      pickMax: 1,
    } as PendingChoice;
    const base = { id: 'x', type: ActionEffectType.ORDER_CARDS, sourceInstanceId: TOWER };
    expect(isValidOrder({ ...base, instanceIds: [GEAR, PERSON] }, pending)).toBe(true);
    expect(isValidOrder({ ...base, instanceIds: [GEAR], destroyedIds: [PERSON] }, pending)).toBe(
      true,
    );
    expect(isValidOrder({ ...base, instanceIds: [], destroyedIds: [PERSON, GEAR] }, pending)).toBe(
      false,
    );
    expect(isValidOrder({ ...base, instanceIds: [GEAR, SHED] }, pending)).toBe(false);
    expect(
      sanitizeChoice(
        { ...base, instanceIds: [GEAR, PERSON] },
        PendingChoiceType.ORDER_CARDS,
        pending,
      ),
    ).toMatchObject({ instanceIds: [GEAR, PERSON], destroyedIds: [] });
    expect(
      sanitizeChoice({ ...base, instanceIds: [GEAR] }, PendingChoiceType.ORDER_CARDS, pending),
    ).toBeNull();
  });
});

describe('stickerHere on the last selected card', () => {
  it('gives the sticker to the card chosen before', () => {
    const [resolved] = resolveActionEffect(
      {
        id: 1,
        type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
        cards: { ids: [SHED] },
        resources: { gold: 1 },
        stickerHere: 'lastSelected',
      },
      PERSON,
      stateWith({ board: [SHED, TOWER] }),
      defs,
      stickers,
      { lastSelectedIds: [TOWER] },
    );
    expect(resolved).toMatchObject({ stickerHere: true, stickerTargetId: TOWER });
    const after = new RemoveResourceOnCardStrategy(stickers).apply(
      stateWith({ stickerStock: { 1: 1 } }),
      { ...resolved, instanceIds: [SHED], resources: { gold: 1 } },
    );
    expect(after.instances[TOWER].stickers[1]).toEqual([1]);
  });
});

describe('values per element', () => {
  it('are capped by `max`', () => {
    const state = stateWith();
    state.instances[SHED].cumulated = 150;
    expect(
      countValuePerElement({ amount: 1, accumulation: true, max: 100 }, state, SHED, defs, {}),
    ).toBe(100);
  });
});

describe('UPGRADED_TO_BOTTOM_OF_DECK', () => {
  it('puts the upgraded card at the bottom of the deck', () => {
    const state = stateWith({
      board: [SHED],
      drawPile: [PERSON],
      boardEffects: {
        9: [{ id: 'crane', type: PassiveType.UPGRADED_TO_BOTTOM_OF_DECK, cards: { ids: [SHED] } }],
      },
    });
    expect(leaveUpgradedCard(state, SHED, defs, {}).drawPile).toEqual([PERSON, SHED]);
  });
});
