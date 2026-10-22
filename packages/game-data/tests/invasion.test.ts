import { loadGameCatalog } from '../src';
import { GameAggregate } from '@deck-legacy/engine/domain/aggregates/GameAggregate';
import { cardSelector } from '@deck-legacy/engine/domain/cards/selection/cardSelector';
import { getStateActions } from '@deck-legacy/engine/domain/cards/selection/getStateActions';
import { CardTag, Phase, TargetScope } from '@deck-legacy/engine/domain/enums';
import { createInstance } from '@deck-legacy/engine/domain/factory';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/state/emptyState';
import type { CardAction, GameState } from '@deck-legacy/engine/domain/types';
import { describe, expect, it } from 'vitest';

const catalog = loadGameCatalog();

// Instance ids (expansions/foundations/deck.json): printed number + 191
const SIEGE_TOWER = 208;
const ARCHER = 209;
const TROOP = 210;
const COMMANDER = 214;
const CITY_ABLAZE = 218;
// Base game cards, with ids of this test: Jester (stays in play), Grand Castle (building, sword)
const JESTER = 1;
const CASTLE = 2;
const CASTLE_2 = 3;

const cardIds: Record<number, number> = {
  [SIEGE_TOWER]: 190,
  [ARCHER]: 191,
  [TROOP]: 192,
  [COMMANDER]: 196,
  [CITY_ABLAZE]: 200,
  [JESTER]: 32,
  [CASTLE]: 106,
  [CASTLE_2]: 106,
};

function found<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error('Missing test data');
  return value;
}

function makeGame(overrides: Partial<GameState>, states: Record<number, number> = {}) {
  const instances = Object.fromEntries(
    Object.entries(cardIds).map(([id, cardId]) => [
      id,
      createInstance(Number(id), cardId, states[Number(id)] ?? 1, catalog.cards),
    ]),
  );
  const state: GameState = {
    ...(JSON.parse(JSON.stringify(EMPTY_STATE)) as GameState),
    activeExpansion: 'Invasion',
    phase: Phase.PLAYING,
    round: 1,
    turn: 1,
    instances,
    ...overrides,
  };
  return new GameAggregate('game', state, catalog.cards, catalog.stickers);
}

const actionOf = (agg: GameAggregate, id: number, actionId: string): CardAction =>
  found(
    getStateActions(agg.getGameState().instances[id], catalog.cards, catalog.stickers).find(
      a => a.id === actionId,
    ),
  );

function resolveTriggers(agg: GameAggregate, actionId: string) {
  for (const [triggerId, entry] of Object.entries(agg.getGameState().triggerPile)) {
    if (entry.effectDef.id === actionId) {
      agg.cardAction(entry.effectDef, entry.sourceInstanceId, triggerId);
    }
  }
}

const blockedBy = (agg: GameAggregate, id: number) =>
  cardSelector(
    { scope: [TargetScope.BLOCKED_BY_THIS] },
    id,
    agg.getGameState(),
    catalog.cards,
    catalog.stickers,
  );

describe('Enemy Troop', () => {
  it('counts as 5 enemies, then fewer at each defeat', () => {
    const enemiesInPlay = (state: number) =>
      cardSelector(
        { scope: [TargetScope.BOARD], tags: [CardTag.ENEMY] },
        -1,
        makeGame({ board: [TROOP] }, { [TROOP]: state }).getGameState(),
        catalog.cards,
        catalog.stickers,
      ).length;
    expect([1, 2, 3, 4].map(enemiesInPlay)).toEqual([5, 3, 2, 1]);
  });
});

describe('Siege Tower', () => {
  it('blocks the friendly cards that stay in play when played', () => {
    const agg = makeGame({ drawPile: [SIEGE_TOWER], board: [JESTER, CASTLE] });
    agg.turnStarted();
    resolveTriggers(agg, '190-1-1');
    expect(blockedBy(agg, SIEGE_TOWER)).toEqual([JESTER]);
  });

  it('lowers its upgrade cost with swords', () => {
    const agg = makeGame({ board: [SIEGE_TOWER], resources: { weapon: 4 } });
    agg.cardAction(actionOf(agg, SIEGE_TOWER, '190-1-2'), SIEGE_TOWER);
    agg.cardAction(actionOf(agg, SIEGE_TOWER, '190-1-2'), SIEGE_TOWER);
    const removed = agg.getGameState().instances[SIEGE_TOWER].removedResourcesByState?.[1];
    expect(removed?.upgradeCost).toEqual(['weapon', 'weapon']);
  });
});

describe('Enemy Commander', () => {
  it('crosses out 1 production for every 3 enemies in play, itself included', () => {
    const agg = makeGame({ board: [COMMANDER, TROOP, CASTLE], drawPile: [] }, { [TROOP]: 3 });
    agg.turnEnded();
    const [[triggerId, entry]] = Object.entries(agg.getGameState().triggerPile);
    agg.cardAction(entry.effectDef, entry.sourceInstanceId, triggerId);
    // Commander + Enemy Duo = 3 enemies: one production to cross out, then nothing more
    let crossedOut = 0;
    for (let [choice] = agg.getCurrentCardAction()?.getPendingChoices() ?? []; choice;) {
      const pick =
        choice.type === 'choose_card'
          ? { instanceIds: [CASTLE] }
          : { resources: choice.choices[0] as Record<string, number> };
      if (choice.type === 'choose_card') crossedOut++;
      agg.resolveCardActionChoice(
        { id: choice.id, type: choice.kind, sourceInstanceId: choice.sourceInstanceId, ...pick },
        choice.type,
      );
      [choice] = agg.getCurrentCardAction()?.getPendingChoices() ?? [];
    }
    expect(crossedOut).toBe(1);
    expect(agg.getGameState().instances[CASTLE].removedResourcesByState?.[1]?.production).toEqual([
      'weapon',
    ]);
  });
});

describe('City Ablaze', () => {
  it('blocks the buildings in play, and those played later', () => {
    const agg = makeGame({ drawPile: [CITY_ABLAZE], board: [CASTLE] });
    agg.turnStarted();
    resolveTriggers(agg, '200-1-1');
    expect(blockedBy(agg, CITY_ABLAZE)).toEqual([CASTLE]);
  });
});

describe('Enemy Archer', () => {
  it('crosses out a production of the top card of the deck when another enemy is in play', () => {
    const agg = makeGame({ board: [ARCHER, TROOP], drawPile: [CASTLE] });
    agg.turnEnded();
    const entry = found(
      Object.entries(agg.getGameState().triggerPile).find(([, t]) => t.effectDef.id === '191-1-3'),
    );
    agg.cardAction(entry[1].effectDef, ARCHER, entry[0]);
    const [choice] = found(agg.getCurrentCardAction()).getPendingChoices();
    expect(choice.choices).toHaveLength(2);
  });
});
