import { loadGameCatalog } from '../src';
import { GameAggregate } from '@deck-legacy/engine/domain/aggregates/GameAggregate';
import { getProductionChoicesForAction } from '@deck-legacy/engine/domain/cards/getProductionChoicesForAction';
import { getActiveState } from '@deck-legacy/engine/domain/cards/selection/getActiveState';
import { getEffectiveGlory } from '@deck-legacy/engine/domain/cards/selection/getEffectiveGlory';
import { ActionEffectType, PendingChoiceType, Phase } from '@deck-legacy/engine/domain/enums';
import { createInstance } from '@deck-legacy/engine/domain/factory';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/state/emptyState';
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
  const expansion = catalog.expansions[EXPANSION];
  const entries = [
    { id: WILD_GRASS, cardId: 1 },
    ...expansion.campaign,
    ...(expansion.discoverable ?? []),
  ];
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
  const { cardId } = found(catalog.expansions[EXPANSION].campaign.find(e => e.id === id));
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

    const later = makeGame({ board: [LADY], drawPile: [BANDIT, BANDIT_2] }, {});
    later.advance();
    resolveTrigger(later, '122-1-1');
    expect(later.getGameState().instances[LADY].trackProgress).toEqual([1, 2]);

    const rogue = makeGame({ board: [LADY, HUGE_ROBBER], drawPile: [] });
    rogue.getGameState().instances[LADY].trackProgress = [1, 2, 3];
    rogue.getGameState().drawPile = [BANDIT];
    rogue.advance();
    // only the enemy just played counts, not the Huge Robber already in play
    expect(triggerIds(rogue).filter(id => id.startsWith('122'))).toEqual(['122-1-1']);
    resolveTrigger(rogue, '122-1-1');
    // the last step upgrades her; Rogue Lady starts with an empty track
    expect(stateOf(rogue, LADY)).toBe('Rogue Lady');
    expect(rogue.getGameState().instances[LADY].trackProgress).toEqual([1, 2, 3, 4]);
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

  it('takes her from the discard pile or from play', () => {
    for (const pile of [{ discardPile: [LADY] }, { board: [ROBBIN, LADY] }]) {
      const agg = defeatWithLadyIn(pile);
      resolveTrigger(agg, '123-1-3');
      expect(agg.getGameState().destroyedPile).toEqual([LADY]);
      expect(stateOf(agg, ROBBIN)).toBe('Sobbing');
    }
  });

  it('is destroyed when there is no lady', () => {
    const agg = defeatWithLadyIn({});
    expect(triggerIds(agg)).toEqual(['123-1-3']);
    resolveTrigger(agg, '123-1-3');
    expect(agg.getGameState().destroyedPile).toEqual([ROBBIN]);
    expect(stateOf(agg, ROBBIN)).toBe("Robbin' Leader");
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
    resolveTrigger(agg, '130-1-1');
    const state = agg.getGameState();
    const instance = state.instances[TAX_COLLECTOR];
    expect(instance.cumulated).toBe(1);
    expect(
      getEffectiveGlory(getActiveState(instance, catalog.cards), state, catalog.cards, instance),
    ).toBe(-1);
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

// Instance ids of Ridding the Woods cards 11-29
const ROBBER_VETERAN = 149;
const GUARD = 151;
const WAGON = 152;
const DRUID_CAMP = 162;
const ARCHERY = 150;
const HILLTOP = 163;
const KEEPER = 164;
const TOWN = 143;
const FORT = 147;

const actionOf = (cardId: number, actionId: string) =>
  found(catalog.cards[cardId].states.flatMap(s => s.actions ?? []).find(a => a.id === actionId));

describe('Lousy Guard', () => {
  it('is discarded when played without an enemy', () => {
    const alone = makeGame({ drawPile: [GUARD, WILD_GRASS] });
    alone.turnStarted();
    expect(alone.getGameState().discardPile).toContain(GUARD);

    const guarded = makeGame({ drawPile: [GUARD, ROBBER_VETERAN] });
    guarded.turnStarted();
    expect(guarded.getGameState().board).toContain(GUARD);
  });

  it('is discarded as soon as the last enemy leaves play', () => {
    const agg = makeGame({ drawPile: [GUARD, ROBBER_VETERAN] });
    agg.turnStarted();
    agg.getGameState().resources = { weapon: 5 };
    agg.cardAction(actionOf(131, '131-1-2'), ROBBER_VETERAN);
    expect(agg.getGameState().discardPile).toEqual(expect.arrayContaining([GUARD, ROBBER_VETERAN]));
  });
});

describe('Treasure Wagon', () => {
  it('loses 1 production per enemy and is worth 5 glory per production left when purged', () => {
    const agg = makeGame({ drawPile: [WAGON, ROBBER_VETERAN, BANDIT, BANDIT_2] });
    agg.turnStarted();
    resolveTrigger(agg, '134-1-1');
    agg.getGameState().drawPile = [BANDIT, BANDIT_2];
    agg.getGameState().board = [WAGON];
    agg.getGameState().boardEffects = passivesOf(WAGON);
    agg.advance();
    resolveTrigger(agg, '134-1-2');
    const gs = agg.getGameState();
    expect(
      getProductionChoicesForAction({ gold: 9 }, gs, catalog.cards, gs.instances[WAGON], {}),
    ).toEqual([{ gold: 6 }]);

    agg.getGameState().phase = Phase.PURGE;
    agg.getGameState().purgeState = {
      batchSize: 8,
      permanentToPurge: 0,
      shuffledPool: [],
      completedBatchStarts: [],
      selectedCardIds: [WAGON],
      selectedPermanentIds: [],
      onPurgeTriggered: false,
      onStartDiscoverIds: [],
    };
    agg.finalizePurge();
    resolveTrigger(agg, '134-1-3');
    expect(agg.getGameState().instances[WAGON].glories).toEqual([30]);
  });
});

describe('Druid Camp', () => {
  it('discards the cards that stay in play', () => {
    const agg = makeGame({ board: [FOREST, WILD_GRASS], drawPile: [DRUID_CAMP] }, { [FOREST]: 4 });
    agg.turnStarted();
    resolveTrigger(agg, '144-1-1');
    expect(agg.getGameState().discardPile).toEqual([FOREST]);
  });
});

describe('Bait and Trap', () => {
  it('can only be used with a lady in play', () => {
    const baitAndTrap = actionOf(132, '132-2-1');
    const alone = makeGame({ board: [ARCHERY], discardPile: [BANDIT] }, { [ARCHERY]: 2 });
    expect(() => alone.cardAction(baitAndTrap, ARCHERY)).toThrow();

    const withLady = makeGame({ board: [ARCHERY, LADY], discardPile: [BANDIT] }, { [ARCHERY]: 2 });
    withLady.cardAction(baitAndTrap, ARCHERY);
    withLady.resolveCardActionChoice(
      {
        id: `${ARCHERY}-1`,
        type: ActionEffectType.PLAY_CARD,
        sourceInstanceId: ARCHERY,
        instanceIds: [BANDIT],
      },
      PendingChoiceType.CHOOSE_CARD,
    );
    expect(withLady.getGameState().board).toContain(BANDIT);
    expect(withLady.getGameState().resources).toEqual({ weapon: 2 });
  });
});

describe('Keeper of Secrets', () => {
  it('clears the board, turns into The Chase and is destroyed by its red track', () => {
    const agg = makeGame({ board: [WILD_GRASS], drawPile: [KEEPER] });
    agg.turnStarted();
    resolveTrigger(agg, '146-1-1');
    expect(stateOf(agg, KEEPER)).toBe('The Chase');
    expect(agg.getGameState().discardPile).toEqual(expect.arrayContaining([WILD_GRASS, KEEPER]));

    const chase = makeGame({ board: [KEEPER], drawPile: [WILD_GRASS] }, { [KEEPER]: 2 });
    chase.turnEnded();
    expect(triggerIds(chase)).toEqual(['146-2-3']);
    chase.getGameState().instances[KEEPER].cumulated = 2;
    expect(
      getActiveState(chase.getGameState().instances[KEEPER], catalog.cards).actions?.length,
    ).toBe(3);
  });
});

describe('Ceremony', () => {
  it('adds sticker 10 to one of the 5 discarded cards, then turns back', () => {
    const friendly = [WILD_GRASS, TOWN, FORT, TAX_COLLECTOR, CAMP];
    const agg = makeGame(
      { board: [HILLTOP, ...friendly], stickerStock: { 10: 1 } },
      { [HILLTOP]: 4, [CAMP]: 3 },
    );
    agg.cardAction(actionOf(145, '145-4-1'), HILLTOP);
    agg.resolveCardActionChoice(
      {
        id: `${HILLTOP}-1`,
        type: ActionEffectType.DISCARD_CARD,
        sourceInstanceId: HILLTOP,
        instanceIds: friendly,
      },
      PendingChoiceType.CHOOSE_CARD,
    );
    agg.resolveCardActionChoice(
      {
        id: `${HILLTOP}-2`,
        type: ActionEffectType.ADD_STICKER,
        sourceInstanceId: HILLTOP,
        instanceIds: [TOWN],
      },
      PendingChoiceType.CHOOSE_CARD,
    );
    const gs = agg.getGameState();
    expect(gs.instances[TOWN].stickers[1]).toEqual([10]);
    expect(friendly.filter(id => id !== TOWN).every(id => !gs.instances[id].stickers[1])).toBe(
      true,
    );
    expect(stateOf(agg, HILLTOP)).toBe('Hill Megalith');
  });
});

describe('expansion discovery', () => {
  it('discovers the first 5 cards at the start, then the expansion cards before the base ones', () => {
    const agg = makeGame({ drawPile: [WILD_GRASS], discoveryPile: [2] });
    agg.selectExpansion(EXPANSION, catalog.expansions[EXPANSION]);
    agg.finalizePurge();
    const gs = agg.getGameState();
    const kingdom = [...gs.drawPile, ...gs.board, ...gs.discardPile];
    expect(kingdom).toEqual(expect.arrayContaining([139, 140, 141, 142, 143]));
    expect(kingdom).not.toContain(144);
    expect(gs.discoveryPile.slice(0, 2)).toEqual([144, 145]);
    expect(gs.discoveryPile.at(-1)).toBe(2);
  });
});
