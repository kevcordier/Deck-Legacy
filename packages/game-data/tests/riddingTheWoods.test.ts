import { loadGameCatalog } from '../src';
import { GameAggregate } from '@deck-legacy/engine/application/aggregates/GameAggregate';
import {
  getActiveState,
  getProductionChoicesForAction,
} from '@deck-legacy/engine/application/cardHelpers';
import { EMPTY_STATE } from '@deck-legacy/engine/application/emptyState';
import { createInstance } from '@deck-legacy/engine/application/factory';
import { ActionEffectType, PendingChoiceType, Phase } from '@deck-legacy/engine/domain/enums';
import type { GameState, Passive } from '@deck-legacy/engine/domain/types';
import { describe, expect, it } from 'vitest';

const catalog = loadGameCatalog();
const EXPANSION = 'Ridding the Woods';

// Instance ids of the expansion deck (expansions/riddingTheWoods/deck.json)
const LADY = 139;
const ROBBIN = 140;
const BANDIT = 141;
const FOREST = 142;
const BANDIT_2 = 144;
const HUGE_ROBBER = 145;
const CAMP = 146;
const TAX_COLLECTOR = 148;
const WILD_GRASS = 1;

function makeGame(overrides: Partial<GameState>, states: Record<number, number> = {}) {
  const entries = [{ id: WILD_GRASS, cardId: 1 }, ...catalog.expansions[EXPANSION].deck];
  const instances = Object.fromEntries(
    entries.map(({ id, cardId }) => [
      id,
      createInstance(id, cardId, states[id] ?? 1, catalog.cards),
    ]),
  );
  const state: GameState = {
    ...(JSON.parse(JSON.stringify(EMPTY_STATE)) as GameState),
    activeExpansion: EXPANSION,
    phase: Phase.PLAYING,
    instances,
    ...overrides,
  };
  return new GameAggregate('game', state, catalog.cards, catalog.stickers);
}

function found<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Missing test data');
  return value;
}

function passivesOf(id: number, stateId = 1): Record<number, Passive[]> {
  const { cardId } = found(catalog.expansions[EXPANSION].deck.find(e => e.id === id));
  return { [id]: found(catalog.cards[cardId].states.find(s => s.id === stateId)).passives ?? [] };
}

const robbinDefeat = found(catalog.cards[123].states[0].actions?.find(a => a.id === '123-1-2'));

function triggerIds(agg: GameAggregate): string[] {
  return Object.values(agg.getGameState().triggerPile).map(t => t.effectDef.id);
}

function resolveTrigger(agg: GameAggregate, actionId: string) {
  const [triggerId, entry] = found(
    Object.entries(agg.getGameState().triggerPile).find(([, t]) => t.effectDef.id === actionId),
  );
  return agg.cardAction(entry.effectDef, entry.sourceInstanceId, triggerId);
}

const stateOf = (agg: GameAggregate, id: number) =>
  getActiveState(agg.getGameState().instances[id], catalog.cards).name;

describe('A Certain Lady', () => {
  it('marks enemies played with her and turns rogue when the track is complete', () => {
    const agg = makeGame({ drawPile: [LADY, BANDIT, BANDIT_2] });
    agg.turnStarted();
    // Lady and both bandits are played together: 2 enemies in play
    resolveTrigger(agg, '122-1-1');
    expect(agg.getGameState().instances[LADY].trackProgress).toEqual([1, 2]);

    const later = makeGame(
      { board: [LADY], boardEffects: passivesOf(LADY), drawPile: [BANDIT, BANDIT_2] },
      {},
    );
    later.advance();
    resolveTrigger(later, '122-1-3');
    expect(later.getGameState().instances[LADY].trackProgress).toEqual([1, 2]);

    const rogue = makeGame({ board: [LADY, HUGE_ROBBER], drawPile: [] });
    rogue.getGameState().instances[LADY].trackProgress = [1, 2, 3];
    rogue.getGameState().boardEffects = passivesOf(LADY);
    rogue.getGameState().drawPile = [BANDIT];
    rogue.advance();
    resolveTrigger(rogue, '122-1-3');
    resolveTrigger(rogue, '122-1-2');
    expect(stateOf(rogue, LADY)).toBe('Rogue Lady');
  });

  it('stops marking once the expansion is over', () => {
    const agg = makeGame({
      drawPile: [LADY, BANDIT],
      campaignScores: { [EXPANSION]: 12 },
    });
    agg.turnStarted();
    expect(triggerIds(agg)).not.toContain('122-1-1');
  });

  it('as Rogue Lady crosses out 1 gold production only when a card produces gold', () => {
    const agg = makeGame({ board: [WILD_GRASS], drawPile: [LADY] }, { [LADY]: 2 });
    agg.turnStarted();
    expect(triggerIds(agg)).toContain('122-2-1');

    const noGold = makeGame({ drawPile: [LADY] }, { [LADY]: 2 });
    noGold.turnStarted();
    expect(triggerIds(noGold)).not.toContain('122-2-1');
  });
});

describe("Robbin' Leader", () => {
  const defeatWithLadyIn = (pile: Partial<GameState>) => {
    const agg = makeGame({
      board: [ROBBIN],
      resources: { weapon: 3 },
      ...pile,
    });
    agg.getGameState().instances[ROBBIN].trackProgress = [1, 2, 3, 4, 5, 6, 7];
    agg.cardAction(robbinDefeat, ROBBIN);
    return agg;
  };

  it('takes A Certain Lady from the deck when his track is complete', () => {
    const agg = defeatWithLadyIn({ drawPile: [LADY] });
    expect(triggerIds(agg)).toEqual(['123-1-3']);
    resolveTrigger(agg, '123-1-3');
    expect(agg.getGameState().destroyedPile).toContain(LADY);
    expect(stateOf(agg, ROBBIN)).toBe('Sobbing');
  });

  it('takes her from the discard pile without shuffling', () => {
    const agg = defeatWithLadyIn({ discardPile: [LADY] });
    expect(triggerIds(agg)).toEqual(['123-1-4']);
  });

  it('is destroyed when there is no lady', () => {
    const agg = defeatWithLadyIn({});
    expect(triggerIds(agg)).toEqual(['123-1-5']);
    resolveTrigger(agg, '123-1-5');
    expect(agg.getGameState().destroyedPile).toContain(ROBBIN);
  });

  it('lets only weapons be gained while in play', () => {
    const gs = makeGame({ board: [ROBBIN], boardEffects: passivesOf(ROBBIN) }).getGameState();
    const wall = { ...gs.instances[147], stateId: 2 };
    expect(
      getProductionChoicesForAction(
        { gold: 4 },
        gs,
        catalog.cards,
        gs.instances[TAX_COLLECTOR],
        {},
      ),
    ).toEqual([{}]);
    expect(getProductionChoicesForAction({ weapon: 1 }, gs, catalog.cards, wall, {})).toEqual([
      { weapon: 1 },
    ]);
  });
});

describe('defeating an enemy', () => {
  const defeatRobbin = (extra: Partial<GameState>) => {
    const agg = makeGame(
      { board: [ROBBIN, FOREST], resources: { weapon: 5, gold: 4 }, ...extra },
      { [FOREST]: 2 },
    );
    agg.cardAction(robbinDefeat, ROBBIN);
    return agg;
  };

  it('lets the Unsafe Forest upgrade', () => {
    const agg = defeatRobbin({});
    expect(agg.getGameState().instances[ROBBIN].trackProgress).toEqual([1]);
    resolveTrigger(agg, '125-2-1');
    expect(stateOf(agg, FOREST)).toBe('Calm Forest');
    expect(agg.getGameState().resources).toEqual({});
  });

  it('cannot use weapons while a Robber Camp is in play', () => {
    expect(() =>
      defeatRobbin({ board: [ROBBIN, FOREST, CAMP], boardEffects: passivesOf(CAMP) }),
    ).toThrow();
  });
});

describe('Prisoners', () => {
  it('escape when 2 enemies are in play', () => {
    const agg = makeGame({ board: [HUGE_ROBBER], drawPile: [BANDIT, BANDIT_2] }, { [BANDIT]: 2 });
    agg.turnStarted();
    resolveTrigger(agg, '124-2-1');
    expect(stateOf(agg, BANDIT)).toBe('Bandit');

    const alone = makeGame({ drawPile: [BANDIT, BANDIT_2] }, { [BANDIT]: 2 });
    alone.turnStarted();
    expect(triggerIds(alone)).not.toContain('124-2-1');
  });

  it('can be added to a purge', () => {
    const agg = makeGame(
      {
        phase: Phase.PURGE,
        drawPile: [WILD_GRASS, BANDIT, BANDIT_2],
        purgeState: {
          batchSize: 1,
          permanentToPurge: 0,
          shuffledPool: [BANDIT, WILD_GRASS, BANDIT_2],
          completedBatchStarts: [],
          selectedCardIds: [],
          selectedPermanentIds: [],
          onPurgeTriggered: false,
          onStartDiscoverIds: [],
        },
      },
      { [BANDIT]: 2, [BANDIT_2]: 2 },
    );
    expect(agg.getPurgeCandidates()).toEqual([WILD_GRASS]);
    agg.selectPurgeCard(WILD_GRASS);
    agg.finalizePurge();
    expect(triggerIds(agg)).toEqual(['124-2-2']);

    resolveTrigger(agg, '124-2-2');
    agg.resolveCardActionChoice(
      {
        id: `${BANDIT}-1`,
        type: ActionEffectType.ADD_TO_PURGE,
        sourceInstanceId: BANDIT,
        instanceIds: [BANDIT, BANDIT_2],
      },
      PendingChoiceType.CHOOSE_CARD,
    );
    expect(agg.getSelectedPurgeIds()).toEqual([WILD_GRASS, BANDIT, BANDIT_2]);
  });
});

describe('Tax Collector', () => {
  it('loses 1 glory each time it produces', () => {
    const agg = makeGame({ board: [TAX_COLLECTOR] });
    agg.cardProduced(TAX_COLLECTOR, { gold: 4 });
    resolveTrigger(agg, '131-1-1');
    expect(agg.getGameState().instances[TAX_COLLECTOR].glories).toEqual([-1]);
  });
});

describe('starting Ridding the Woods', () => {
  it('purges with a wood focus and adds its stickers', () => {
    const agg = makeGame({ drawPile: [WILD_GRASS], stickerStock: { 10: 5, 16: 5 } });
    agg.selectExpansion(EXPANSION, catalog.expansions[EXPANSION]);
    const gs = agg.getGameState();

    expect(gs.phase).toBe(Phase.PURGE);
    expect(gs.purgeState).toMatchObject({
      batchSize: 8,
      permanentToPurge: 2,
      focus: { resource: 'wood', count: 2 },
    });
    expect(gs.stickerStock).toEqual({ 10: 11, 16: 7 });
  });
});
