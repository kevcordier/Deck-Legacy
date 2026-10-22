import { loadGameCatalog } from '../src';
import { GameSession } from '@deck-legacy/engine/application/session/GameSession';
import { GameAggregate } from '@deck-legacy/engine/domain/aggregates/GameAggregate';
import { getActiveState } from '@deck-legacy/engine/domain/cards/selection/getActiveState';
import { getEffectiveGlory } from '@deck-legacy/engine/domain/cards/selection/getEffectiveGlory';
import { getStateActions } from '@deck-legacy/engine/domain/cards/selection/getStateActions';
import { PendingChoiceType, Phase } from '@deck-legacy/engine/domain/enums';
import { createInstance } from '@deck-legacy/engine/domain/factory';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/state/emptyState';
import type { CardAction, GameState, PendingChoice } from '@deck-legacy/engine/domain/types';
import { describe, expect, it } from 'vitest';

const catalog = loadGameCatalog();
const OPTIONS = { allowCheats: false, unrestrictedRewind: false };

// Instance ids (expansions/foundations/deck.json): printed number + 191
const WORKSHOP = 334;
const IRRIGATION = 335;
const WHEELBARROW = 336;
const STAGE = 337;
const INDUSTRY = 340;
const CRANE = 344;
const CALCULATIONS = 346;
const PILLAR = 307; // a Golden Pillar project (Statue), a building
const NOBLE_HOUSES = 316; // permanent, its ⌛ effect marks a box
// Base game cards, with ids of this test: Wild Grass (land, gold), Trader (person)
const LAND = 1;
const LAND_2 = 2;
const PERSONS = [5, 6];

const cardIds: Record<number, number> = {
  [WORKSHOP]: 316,
  [IRRIGATION]: 317,
  [WHEELBARROW]: 318,
  [STAGE]: 319,
  [INDUSTRY]: 322,
  [CRANE]: 326,
  [CALCULATIONS]: 328,
  [PILLAR]: 289,
  [NOBLE_HOUSES]: 298,
  [LAND]: 1,
  [LAND_2]: 1,
  ...Object.fromEntries(PERSONS.map(id => [id, 5])),
};

function makeGame(overrides: Partial<GameState>, states: Record<number, number> = {}) {
  const state: GameState = {
    ...(JSON.parse(JSON.stringify(EMPTY_STATE)) as GameState),
    seed: 'mechanics',
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

const restore = (agg: GameAggregate) =>
  GameSession.restore('m', [], catalog, OPTIONS, {}, { seq: 0, state: agg.getGameState() });

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

function pick(agg: GameAggregate, values: object) {
  const choice = pending(agg);
  agg.resolveCardActionChoice(
    { id: choice.id, type: choice.kind, sourceInstanceId: choice.sourceInstanceId, ...values },
    choice.type,
  );
}

const gloryOf = (agg: GameAggregate, id: number) => {
  const state = agg.getGameState();
  const instance = state.instances[id];
  return getEffectiveGlory(
    getActiveState(instance, catalog.cards),
    state,
    catalog.cards,
    instance,
    catalog.stickers,
  );
};

describe('Crane', () => {
  it('lowers building upgrades by 2 resources the player chooses, and puts them at the bottom', () => {
    const agg = makeGame(
      { board: [CRANE, LAND, PILLAR], drawPile: [5], resources: { stone: 2 } },
      { [CRANE]: 2 },
    );
    agg.cardAction(actionOf(agg, CRANE, '326-2-1'), CRANE);
    pick(agg, { instanceIds: [LAND] });

    const session = restore(agg);
    // The Statue costs 4 stone: 2 to pay
    session.execute({ type: 'resolveUpgrade', instanceId: PILLAR, upgradeTo: 2 });
    const [choice] = session.toView().pendingChoices ?? [];
    expect(choice).toMatchObject({ type: PendingChoiceType.SPLIT_RESOURCES, total: 2 });
    session.execute({
      type: 'resolvePayCost',
      resolved: { resources: { stone: 2 }, discardedCardIds: [], destroyedCardIds: [] },
    });
    const state = session.getState();
    expect(state.instances[PILLAR].stateId).toBe(2);
    expect(state.drawPile.at(-1)).toBe(PILLAR);
  });

  it('does nothing until it is equipped', () => {
    const session = restore(
      makeGame({ board: [CRANE, PILLAR], drawPile: [5], resources: { stone: 4 } }, { [CRANE]: 2 }),
    );
    session.execute({ type: 'resolveUpgrade', instanceId: PILLAR, upgradeTo: 2 });
    expect(session.getState().instances[PILLAR].stateId).toBe(2);
    expect(session.getState().resources.stone ?? 0).toBe(0);
  });
});

describe('Performance', () => {
  it('re-arranges the next undiscovered cards and may destroy 1 of them', () => {
    const session = restore(
      makeGame(
        {
          board: [STAGE, ...PERSONS],
          drawPile: [LAND],
          discoverablePile: [IRRIGATION, CRANE, PILLAR],
        },
        { [STAGE]: 2 },
      ),
    );
    session.execute({ type: 'resolveAction', instanceId: STAGE, actionId: '319-2-1' });
    session.execute({
      type: 'resolvePayCost',
      resolved: { resources: {}, discardedCardIds: PERSONS, destroyedCardIds: [] },
    });
    const [choice] = session.toView().pendingChoices ?? [];
    expect(choice).toMatchObject({
      type: PendingChoiceType.ORDER_CARDS,
      choices: [IRRIGATION, CRANE],
    });
    session.execute({
      type: 'resolvePlayerChoice',
      choiceType: PendingChoiceType.ORDER_CARDS,
      choice: {
        id: choice.id,
        type: choice.kind,
        sourceInstanceId: STAGE,
        instanceIds: [CRANE],
        destroyedIds: [IRRIGATION],
      },
    });
    const state = session.getState();
    expect(state.discoverablePile).toEqual([CRANE, PILLAR]);
    expect(state.destroyedPile).toContain(IRRIGATION);
  });
});

describe('Forbidden Knowledge', () => {
  it('discovers the next undiscovered card of the box that is not permanent', () => {
    const agg = makeGame(
      { board: [STAGE], drawPile: [LAND], discoverablePile: [CALCULATIONS, PILLAR] },
      { [STAGE]: 3 },
    );
    agg.cardAction(actionOf(agg, STAGE, '319-3-1'), STAGE);
    expect(agg.getGameState().discoverablePile).toEqual([CALCULATIONS]);
  });
});

describe('Irrigation', () => {
  it('is discarded to boost the production whose sticker was just added', () => {
    const agg = makeGame({ board: [IRRIGATION, 5], drawPile: [LAND], stickerStock: { 1: 2 } });
    agg.cardAction(
      {
        id: 'sticker',
        unlimited: true,
        actionEffects: [
          {
            id: 1,
            type: 'ADD_STICKER' as never,
            cards: { ids: [IRRIGATION] },
            stickers: { ids: [1] },
          },
        ],
      },
      5,
    );
    const [[triggerId, entry]] = Object.entries(agg.getGameState().triggerPile);
    agg.cardAction(entry.effectDef, IRRIGATION, triggerId);
    const state = agg.getGameState();
    expect(state.instances[IRRIGATION].stickers[1]).toEqual([1, 1]);
    expect(state.discardPile).toContain(IRRIGATION);
    expect(state.triggerPile).toEqual({});
  });
});

describe('Inventor Workshop', () => {
  it('counts as 1 more invention for each box, for its glory', () => {
    const agg = makeGame({ board: [WORKSHOP] }, { [WORKSHOP]: 3 });
    agg.getGameState().instances[WORKSHOP].trackProgress.push(1, 2);
    // Itself and its 2 boxes: 3 inventions in play
    expect(gloryOf(agg, WORKSHOP)).toBe(6);
  });
});

describe('Industry', () => {
  it('uses the ⌛ effect of a permanent card', () => {
    const agg = makeGame(
      { board: [INDUSTRY], permanents: [NOBLE_HOUSES], drawPile: [LAND], resources: { gold: 6 } },
      { [INDUSTRY]: 3 },
    );
    agg.cardAction(actionOf(agg, INDUSTRY, '322-3-1'), INDUSTRY);
    if (agg.getCurrentCardAction()?.getPendingChoices().length) {
      pick(agg, { instanceIds: [NOBLE_HOUSES] });
    }
    expect(agg.getGameState().instances[NOBLE_HOUSES].trackProgress).toEqual([1]);
    expect(agg.getGameState().phase).toBe(Phase.PLAYING);
  });
});

describe('Wheelbarrow', () => {
  it('moves a production from a land to another, and its holder is discarded', () => {
    const agg = makeGame({
      board: [WHEELBARROW, 5, LAND, LAND_2],
      drawPile: [6],
      stickerStock: { 1: 1 },
    });
    agg.cardAction(actionOf(agg, WHEELBARROW, '318-1-1'), WHEELBARROW);
    pick(agg, { instanceIds: [5] });
    agg.cardAction(actionOf(agg, WHEELBARROW, '318-1-2'), WHEELBARROW);
    pick(agg, { instanceIds: [LAND_2] });
    pick(agg, { instanceIds: [LAND] });
    if (agg.getCurrentCardAction()) pick(agg, { resources: { gold: 1 } });
    const state = agg.getGameState();
    expect(state.instances[LAND].removedResourcesByState?.[1]?.production).toEqual(['gold']);
    expect(state.instances[LAND_2].stickers[1]).toEqual([1]);
    expect(state.discardPile).toEqual(expect.arrayContaining([5, WHEELBARROW]));
  });
});

describe('Calculations', () => {
  it('is worth 1 glory per mark, 100 at most', () => {
    const agg = makeGame({ permanents: [CALCULATIONS] });
    agg.getGameState().instances[CALCULATIONS].cumulated = 120;
    expect(gloryOf(agg, CALCULATIONS)).toBe(100);
  });
});
