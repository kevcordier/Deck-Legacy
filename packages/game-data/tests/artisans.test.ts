import { loadGameCatalog } from '../src';
import { GameSession } from '@deck-legacy/engine/application/session/GameSession';
import { GameAggregate } from '@deck-legacy/engine/domain/aggregates/GameAggregate';
import { getCardProductionChoices } from '@deck-legacy/engine/domain/cards/getCardProductionChoices';
import { getActiveState } from '@deck-legacy/engine/domain/cards/selection/getActiveState';
import { getEffectiveGlory } from '@deck-legacy/engine/domain/cards/selection/getEffectiveGlory';
import { getStateActions } from '@deck-legacy/engine/domain/cards/selection/getStateActions';
import { Phase } from '@deck-legacy/engine/domain/enums';
import { createInstance } from '@deck-legacy/engine/domain/factory';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/state/emptyState';
import type { CardAction, GameState, PendingChoice } from '@deck-legacy/engine/domain/types';
import { describe, expect, it } from 'vitest';

const catalog = loadGameCatalog();
const OPTIONS = { allowCheats: false, unrestrictedRewind: false };

// Instance ids (expansions/foundations/deck.json): printed number + 191
const STATUES = 299;
const ARCHITECT = 302;
const JEWELER = 303;
const PILLAR = 307;
const RING = 312;
const PEARL = 313;
// Base game cards, with ids of this test: Trader (person, no production), Wild Grass (land, gold)
const PERSON = 5;
const LAND = 1;

const cardIds: Record<number, number> = {
  [STATUES]: 281,
  [ARCHITECT]: 284,
  [JEWELER]: 285,
  [PILLAR]: 289,
  [RING]: 294,
  [PEARL]: 295,
  [PERSON]: 5,
  [LAND]: 1,
};

function makeGame(overrides: Partial<GameState>, states: Record<number, number> = {}) {
  const state: GameState = {
    ...(JSON.parse(JSON.stringify(EMPTY_STATE)) as GameState),
    seed: 'artisans',
    activeExpansion: 'Invasion',
    phase: Phase.PLAYING,
    round: 1,
    turn: 1,
    instances: Object.fromEntries(
      Object.entries(cardIds).map(([id, cardId]) => [
        id,
        createInstance(Number(id), cardId, states[Number(id)] ?? 1, catalog.cards),
      ]),
    ),
    ...overrides,
  };
  return new GameAggregate('game', state, catalog.cards, catalog.stickers);
}

function found<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error('Missing test data');
  return value;
}

const actionOf = (agg: GameAggregate, id: number, actionId: string): CardAction =>
  found(
    getStateActions(agg.getGameState().instances[id], catalog.cards, catalog.stickers).find(
      a => a.id === actionId,
    ),
  );

const pending = (agg: GameAggregate): PendingChoice =>
  found(agg.getCurrentCardAction()?.getPendingChoices()[0]);

function pick(agg: GameAggregate, instanceIds: number[]) {
  const choice = pending(agg);
  agg.resolveCardActionChoice(
    { id: choice.id, type: choice.kind, sourceInstanceId: choice.sourceInstanceId, instanceIds },
    choice.type,
  );
}

const productionOf = (agg: GameAggregate, id: number) => {
  const state = agg.getGameState();
  return getCardProductionChoices(state.instances[id], state, catalog.cards, catalog.stickers);
};

/** The Ring (state `ringState`) equipped to the person. */
function equippedRing(ringState: number, overrides: Partial<GameState> = {}) {
  const agg = makeGame(
    { board: [RING, PERSON], drawPile: [LAND], ...overrides },
    {
      [RING]: ringState,
    },
  );
  agg.cardAction(actionOf(agg, RING, `294-${ringState}-1`), RING);
  if (agg.getCurrentCardAction()) pick(agg, [PERSON]);
  return agg;
}

describe('Equipment', () => {
  it('produces nothing until equipped, then adds its production to the holder', () => {
    expect(productionOf(makeGame({ board: [RING, PERSON] }), RING)).toEqual([]);
    const agg = equippedRing(1);
    expect(agg.getGameState().equipped).toEqual({ [RING]: PERSON });
    expect(productionOf(agg, PERSON)).toEqual([{ gold: 1 }]);
    expect(productionOf(agg, RING)).toEqual([]);
  });

  it('gives its passives to the holder (Diamond Ring: double production)', () => {
    const agg = equippedRing(4);
    agg.getGameState().boardEffects[RING] = catalog.cards[294].states[3].passives ?? [];
    agg.getGameState().instances[PERSON].stickers[1] = [2];
    expect(productionOf(agg, PERSON)).toEqual([{ wood: 2 }]);
  });

  it('leaves play with its holder', () => {
    const agg = equippedRing(1);
    agg.cardAction(
      {
        id: 'discard',
        actionEffects: [{ id: 1, type: 'DISCARD_CARD' as never, cards: { ids: [PERSON] } }],
      },
      LAND,
    );
    const state = agg.getGameState();
    expect(state.discardPile).toEqual(expect.arrayContaining([PERSON, RING]));
    expect(state.equipped).toEqual({});
  });

  it('cannot be upgraded while equipped', () => {
    const session = GameSession.restore(
      'a',
      [],
      catalog,
      OPTIONS,
      {},
      {
        seq: 0,
        state: equippedRing(1, { resources: { iron: 2 } }).getGameState(),
      },
    );
    session.execute({ type: 'resolveUpgrade', instanceId: RING, upgradeTo: 2 });
    expect(session.getState().instances[RING].stateId).toBe(1);
  });
});

describe('Ether Pearl', () => {
  it('makes the holder gain any 2 resources before its ✓ / ⌛ effects', () => {
    const agg = makeGame(
      { board: [PEARL, ARCHITECT], drawPile: [LAND], discoverablePile: [PILLAR] },
      {
        [PEARL]: 2,
        [ARCHITECT]: 2,
      },
    );
    agg.getGameState().boardEffects[PEARL] = catalog.cards[295].states[1].passives ?? [];
    agg.cardAction(actionOf(agg, PEARL, '295-2-1'), PEARL);
    if (agg.getCurrentCardAction()) pick(agg, [ARCHITECT]);
    agg.cardAction(actionOf(agg, ARCHITECT, '284-2-1'), ARCHITECT);
    expect(pending(agg).kind).toBe('ADD_RESOURCES');
  });
});

describe('Jeweler', () => {
  it('lets every iron gain become goods', () => {
    const agg = makeGame({ board: [JEWELER, PERSON] }, { [JEWELER]: 2 });
    agg.getGameState().boardEffects[JEWELER] = catalog.cards[285].states[1].passives ?? [];
    agg.cardAction(
      {
        id: 'gain',
        actionEffects: [{ id: 1, type: 'ADD_RESOURCES' as never, resources: { iron: 2 } }],
      },
      PERSON,
    );
    expect(pending(agg).choices).toEqual([{ iron: 2 }, { goods: 2 }]);
  });
});

describe('Statues', () => {
  it('writes half the stone spent in the next medal, and 4 per line of 3 different values', () => {
    const session = GameSession.restore(
      's',
      [],
      catalog,
      OPTIONS,
      {},
      {
        seq: 0,
        state: makeGame({ permanents: [STATUES], resources: { stone: 20 } }).getGameState(),
      },
    );
    // 1 stone is not enough to write a medal
    session.execute({ type: 'resolveAction', instanceId: STATUES, actionId: '281-1-1', amount: 1 });
    expect(session.getState().instances[STATUES].glories).toEqual([]);
    session.execute({ type: 'resolveAction', instanceId: STATUES, actionId: '281-1-1', amount: 7 });
    expect(session.getState().instances[STATUES].glories).toEqual([3]);

    const state = session.getState();
    const statues = { ...state.instances[STATUES], glories: [1, 2, 3, 4, 5, 6, 7, 8, 9] };
    // Every row, column and diagonal has 3 different values: 45 + 8 × 4
    expect(
      getEffectiveGlory(
        getActiveState(statues, catalog.cards),
        state,
        catalog.cards,
        statues,
        catalog.stickers,
      ),
    ).toBe(77);
  });
});

describe('Architect', () => {
  it('puts the buildings upgraded on top of the deck', () => {
    const agg = makeGame(
      { board: [ARCHITECT, PILLAR], drawPile: [LAND], resources: { stone: 4 } },
      {
        [ARCHITECT]: 2,
      },
    );
    agg.getGameState().boardEffects[ARCHITECT] = catalog.cards[284].states[1].passives ?? [];
    agg.upgradeCard(PILLAR, 2, { stone: 4 });
    expect(agg.getGameState().drawPile[0]).toBe(PILLAR);
  });
});
