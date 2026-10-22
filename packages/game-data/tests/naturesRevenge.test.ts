import { loadGameCatalog } from '../src';
import { GameSession } from '@deck-legacy/engine/application/session/GameSession';
import { GameAggregate } from '@deck-legacy/engine/domain/aggregates/GameAggregate';
import { cardSelector } from '@deck-legacy/engine/domain/cards/selection/cardSelector';
import { getActiveState } from '@deck-legacy/engine/domain/cards/selection/getActiveState';
import { getEffectiveGlory } from '@deck-legacy/engine/domain/cards/selection/getEffectiveGlory';
import { PendingChoiceType, Phase, TargetScope } from '@deck-legacy/engine/domain/enums';
import { createInstance } from '@deck-legacy/engine/domain/factory';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/state/emptyState';
import type { GameState } from '@deck-legacy/engine/domain/types';
import { describe, expect, it } from 'vitest';

const catalog = loadGameCatalog();
const OPTIONS = { allowCheats: false, unrestrictedRewind: false };

// Instance ids (expansions/foundations/deck.json): printed number + 191
const CURSED_LANDS = 224;
const BAD_OMEN = 225;
const VOLCANO = 227;
const DROUGHT = 232;
const EARTHQUAKE = 233;
// Base game cards, with ids of this test: Wild Grass (land, gold), Trader (person), Rats (enemy)
const LANDS = [1, 2, 3, 4];
const PERSONS = [5, 6, 7, 8];
const ENEMY = 9;

const cardIds: Record<number, number> = {
  [CURSED_LANDS]: 206,
  [BAD_OMEN]: 207,
  [VOLCANO]: 209,
  [DROUGHT]: 214,
  [EARTHQUAKE]: 215,
  [ENEMY]: 179,
  ...Object.fromEntries(LANDS.map(id => [id, 1])),
  ...Object.fromEntries(PERSONS.map(id => [id, 5])),
};

function baseState(overrides: Partial<GameState>, states: Record<number, number> = {}): GameState {
  return {
    ...(JSON.parse(JSON.stringify(EMPTY_STATE)) as GameState),
    seed: 'nature',
    activeExpansion: "Nature's Revenge",
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
}

const aggregate = (state: GameState) =>
  new GameAggregate('game', state, catalog.cards, catalog.stickers);

const blockedBy = (state: GameState, id: number) =>
  cardSelector(
    { scope: [TargetScope.BLOCKED_BY_THIS] },
    id,
    state,
    catalog.cards,
    catalog.stickers,
  );

function resolveTriggers(agg: GameAggregate, actionId: string) {
  for (const [triggerId, entry] of Object.entries(agg.getGameState().triggerPile)) {
    if (entry.effectDef.id === actionId) {
      agg.cardAction(entry.effectDef, entry.sourceInstanceId, triggerId);
    }
  }
}

describe('Cursed Lands', () => {
  it('blocks 3 random lands of the kingdom when discovered, out of the deck', () => {
    const agg = aggregate(
      baseState({
        permanents: [],
        drawPile: [1, 2, 5],
        discardPile: [3, 4],
        discoveryPile: [CURSED_LANDS],
      }),
    );
    agg.cardAction(
      {
        id: 'advance',
        unlimited: true,
        actionEffects: [{ id: 1, type: 'ADVANCE_STORY' as never, value: 1 }],
      },
      5,
    );
    resolveTriggers(agg, '206-1-1');

    const state = agg.getGameState();
    const blocked = blockedBy(state, CURSED_LANDS);
    expect(blocked).toHaveLength(3);
    expect(blocked.every(id => LANDS.includes(id))).toBe(true);
    expect(state.board).toEqual(expect.arrayContaining(blocked));
    expect([...state.drawPile, ...state.discardPile].filter(id => blocked.includes(id))).toEqual(
      [],
    );
  });

  it('is upgraded by paying 20 resources of any types, split by the player', () => {
    const state = baseState({
      permanents: [CURSED_LANDS],
      resources: { gold: 12, wood: 10 },
    });
    const session = GameSession.restore('cursed', [], catalog, OPTIONS, {}, { seq: 0, state });
    session.execute({ type: 'resolveUpgrade', instanceId: CURSED_LANDS, upgradeTo: 2 });
    const [choice] = session.toView().pendingChoices ?? [];
    expect(choice?.type).toBe(PendingChoiceType.SPLIT_RESOURCES);

    // A split that is not 20 is refused
    session.execute({
      type: 'resolvePayCost',
      resolved: { resources: { gold: 12 }, discardedCardIds: [], destroyedCardIds: [] },
    });
    expect(session.getState().instances[CURSED_LANDS].stateId).toBe(1);
    // An invalid payment cancels the upgrade, as any invalid input
    expect(session.toView().pendingChoices).toBeNull();
    session.execute({ type: 'resolveUpgrade', instanceId: CURSED_LANDS, upgradeTo: 2 });

    session.execute({
      type: 'resolvePayCost',
      resolved: { resources: { gold: 12, wood: 8 }, discardedCardIds: [], destroyedCardIds: [] },
    });
    expect(session.getState().instances[CURSED_LANDS].stateId).toBe(2);
    expect(session.getState().resources).toEqual({ wood: 2 });
  });
});

describe('Haunted Souls', () => {
  it('blocks 3 random persons of the deck at the start of the round, once', () => {
    const agg = aggregate(
      baseState(
        { phase: Phase.ROUND_END, round: 1, permanents: [CURSED_LANDS], drawPile: [...PERSONS, 1] },
        { [CURSED_LANDS]: 2 },
      ),
    );
    agg.roundStarted();
    resolveTriggers(agg, '206-2-1');
    const blocked = blockedBy(agg.getGameState(), CURSED_LANDS);
    expect(blocked).toHaveLength(3);
    expect(blocked.every(id => PERSONS.includes(id))).toBe(true);
    expect(agg.getGameState().drawPile).toHaveLength(2);
  });
});

describe('Drought', () => {
  it('crosses out 1 production on each land in play, then turns', () => {
    const agg = aggregate(baseState({ board: [1, 2], drawPile: [DROUGHT] }));
    agg.turnStarted();
    resolveTriggers(agg, '214-1-1');
    const state = agg.getGameState();
    expect(state.instances[1].removedResourcesByState?.[1]?.production).toEqual(['gold']);
    expect(state.instances[2].removedResourcesByState?.[1]?.production).toEqual(['gold']);
    expect(state.instances[DROUGHT].stateId).toBe(2);
  });
});

describe('Earthquake', () => {
  it('can end the turn at once', () => {
    const agg = aggregate(baseState({ board: [5], drawPile: [EARTHQUAKE, 6] }));
    agg.turnStarted();
    const [[triggerId, entry]] = Object.entries(agg.getGameState().triggerPile);
    agg.cardAction(entry.effectDef, EARTHQUAKE, triggerId);
    const [choice] = agg.getCurrentCardAction()?.getPendingChoices() ?? [];
    agg.resolveCardActionChoice(
      {
        id: choice.id,
        type: choice.kind,
        sourceInstanceId: choice.sourceInstanceId,
        newActionEffects: [choice.choices[0] as never],
      },
      choice.type,
    );
    expect(agg.getGameState().phase).toBe(Phase.TURN_END);
  });
});

describe('Bad Omen', () => {
  it('is worth −3 glory for each negative card of the kingdom', () => {
    const state = baseState({
      permanents: [BAD_OMEN],
      drawPile: [ENEMY, 1],
      discardPile: [VOLCANO],
    });
    const instance = state.instances[BAD_OMEN];
    const glory = getEffectiveGlory(
      getActiveState(instance, catalog.cards),
      state,
      catalog.cards,
      instance,
      catalog.stickers,
    );
    expect(glory).toBe(-6);
  });
});

describe("Nature's Revenge setup", () => {
  it('first purges 2 friendly events, and Gray Mines count −5 only when purged', () => {
    const state = baseState(
      { phase: Phase.GAME_OVER, drawPile: [VOLCANO, 1, 5], campaignScores: { base: 0 } },
      { [VOLCANO]: 3 },
    );
    const mines = state.instances[VOLCANO];
    expect(
      getEffectiveGlory(getActiveState(mines, catalog.cards), state, catalog.cards, mines, {}),
    ).toBe(0);

    const agg = aggregate(state);
    agg.selectExpansion("Nature's Revenge", catalog.expansions["Nature's Revenge"]);
    expect(agg.getGameState().purgeState?.firstBatch).toMatchObject({ picks: 2, tags: ['event'] });
  });
});
