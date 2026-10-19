import { loadGameCatalog } from '../src';
import { GameAggregate } from '@deck-legacy/engine/domain/aggregates/GameAggregate';
import { getActiveState } from '@deck-legacy/engine/domain/cards/selection/getActiveState';
import { getStateActions } from '@deck-legacy/engine/domain/cards/selection/getStateActions';
import { PendingChoiceType, Phase } from '@deck-legacy/engine/domain/enums';
import { createInstance } from '@deck-legacy/engine/domain/factory';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/state/emptyState';
import type { CardAction, GameState } from '@deck-legacy/engine/domain/types';
import { describe, expect, it } from 'vitest';

const catalog = loadGameCatalog();
const EXPANSION = 'Merchants';

// Instance ids of the expansion deck (expansions/merchants/deck.json): printed number + 167
const MERCHANTS = 168;
const CAMELS = 169;
const SPICES = 170;
const FURS = 171;
const WEAVING = 172;
const SECOND_MERCHANTS = 177;
const BEER = 179;
const MEAD = 183;
const BRIGANDS = 186;
const CAMELS_24 = 191;
const CAMELS_25 = 192;
// Base game cards: Wild Grass (land, gold) and Peasant (person, gold)
const WILD_GRASS = 1;
const PEASANT = 5;

function makeGame(overrides: Partial<GameState>, states: Record<number, number> = {}) {
  const expansion = catalog.expansions[EXPANSION];
  const entries = [
    { id: WILD_GRASS, cardId: 1 },
    { id: 2, cardId: 1 },
    { id: 3, cardId: 1 },
    { id: PEASANT, cardId: 5 },
    { id: 6, cardId: 5 },
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
    round: 1,
    turn: 1,
    instances,
    discoverablePile: (expansion.discoverable ?? []).map(entry => entry.id),
    ...overrides,
  };
  return new GameAggregate('game', state, catalog.cards, catalog.stickers);
}

function found<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error('Missing test data');
  return value;
}

const nameOf = (agg: GameAggregate, id: number) =>
  getActiveState(agg.getGameState().instances[id], catalog.cards).name;

const actionOf = (agg: GameAggregate, id: number, actionId: string): CardAction =>
  found(
    getStateActions(agg.getGameState().instances[id], catalog.cards, catalog.stickers).find(
      a => a.id === actionId,
    ),
  );

function resolveTrigger(agg: GameAggregate, actionId: string) {
  const [triggerId, entry] = found(
    Object.entries(agg.getGameState().triggerPile).find(([, t]) => t.effectDef.id === actionId),
  );
  return agg.cardAction(entry.effectDef, entry.sourceInstanceId, triggerId);
}

function choose(
  agg: GameAggregate,
  pick: Partial<Parameters<GameAggregate['resolveCardActionChoice']>[0]>,
) {
  const [choice] = found(agg.getCurrentCardAction()).getPendingChoices();
  return agg.resolveCardActionChoice(
    { id: choice.id, type: choice.kind, sourceInstanceId: choice.sourceInstanceId, ...pick },
    choice.type,
  );
}

function payCards(agg: GameAggregate, ids: number[]) {
  return agg.resolveCardActionCost({ resources: {}, discardedCardIds: ids, destroyedCardIds: [] });
}

describe('starting Merchants', () => {
  it('purges 7, adds its stickers and discovers only the permanent Merchants', () => {
    // A kingdom without the expansion cards yet: selecting it creates them.
    const agg = new GameAggregate(
      'game',
      {
        ...(JSON.parse(JSON.stringify(EMPTY_STATE)) as GameState),
        phase: Phase.GAME_OVER,
        drawPile: [WILD_GRASS],
        discoverablePile: [],
        instances: { [WILD_GRASS]: createInstance(WILD_GRASS, 1, 1, catalog.cards) },
      },
      catalog.cards,
      catalog.stickers,
    );
    agg.selectExpansion(EXPANSION, catalog.expansions[EXPANSION]);
    expect(agg.getGameState().purgeState).toMatchObject({ batchSize: 7, permanentToPurge: 2 });
    expect(agg.getGameState().stickerStock).toEqual({ 1: 5, 6: 10, 7: 1, 16: 1, 17: 1, 18: 1 });

    agg.finalizePurge();
    const gs = agg.getGameState();
    expect(gs.permanents).toEqual([MERCHANTS]);
    expect(gs.round).toBe(1);
    expect(gs.discoverablePile).toContain(CAMELS);
  });
});

describe('Merchants', () => {
  it('discovers the card paid for, then no longer offers it', () => {
    const agg = makeGame({ permanents: [MERCHANTS], board: [WILD_GRASS], resources: { gold: 7 } });
    agg.cardAction(actionOf(agg, MERCHANTS, '150-1-1'), MERCHANTS);

    const gs = agg.getGameState();
    expect(gs.discardPile).toContain(CAMELS);
    expect(gs.resources.gold ?? 0).toBe(0);
    expect(gs.permanents).toEqual([MERCHANTS]);
    expect(() => agg.cardAction(actionOf(agg, MERCHANTS, '150-1-1'), MERCHANTS)).toThrow();
  });

  it('brings the Brigands and turns at the end of round 1, then gives way to the second Merchants', () => {
    const agg = makeGame({ permanents: [MERCHANTS], drawPile: [] });
    agg.roundEnded();
    resolveTrigger(agg, '150-1-5');
    expect(agg.getGameState().discardPile).toContain(BRIGANDS);
    expect(agg.getGameState().instances[MERCHANTS].stateId).toBe(2);

    agg.roundEnded();
    resolveTrigger(agg, '150-2-5');
    const gs = agg.getGameState();
    expect(gs.destroyedPile).toContain(MERCHANTS);
    expect(gs.permanents).toEqual([SECOND_MERCHANTS]);
  });
});

describe('Brigands', () => {
  it('forbids advancing and other time effects, not its own', () => {
    const agg = makeGame({
      board: [BRIGANDS, WILD_GRASS],
      permanents: [MERCHANTS],
      drawPile: [2, 3],
      resources: { gold: 7, weapon: 8 },
      boardEffects: {
        [BRIGANDS]:
          getActiveState(createInstance(BRIGANDS, 168, 1, catalog.cards), catalog.cards).passives ??
          [],
      },
    });
    const before = agg.getGameState();
    expect(agg.advance()).toBe(before);
    expect(agg.cardAction(actionOf(agg, MERCHANTS, '150-1-1'), MERCHANTS)).toBe(before);

    agg.cardAction(actionOf(agg, BRIGANDS, '168-1-3'), BRIGANDS);
    expect(nameOf(agg, BRIGANDS)).toBe('Brigand Boss');
  });

  it('turns into their boss when 2 producing cards are destroyed', () => {
    const agg = makeGame({ board: [BRIGANDS, WILD_GRASS, 2, PEASANT] });
    agg.cardAction(actionOf(agg, BRIGANDS, '168-1-2'), BRIGANDS);
    agg.resolveCardActionCost({
      resources: {},
      discardedCardIds: [],
      destroyedCardIds: [2, PEASANT],
    });

    const gs = agg.getGameState();
    expect(gs.destroyedPile).toEqual(expect.arrayContaining([2, PEASANT]));
    expect(nameOf(agg, BRIGANDS)).toBe('Brigand Boss');
  });
});

describe('Spices', () => {
  it('rotates to Cummin, which resets once its 4 boxes are marked, for good', () => {
    const agg = makeGame({ board: [SPICES, PEASANT] });
    agg.cardAction(actionOf(agg, SPICES, '152-1-1'), SPICES);
    payCards(agg, [PEASANT]);
    choose(agg, { stateId: 2 });
    expect(nameOf(agg, SPICES)).toBe('Cummin');

    for (let box = 1; box <= 4; box++) {
      agg.cardAction(actionOf(agg, SPICES, '152-2-1'), SPICES);
    }
    resolveTrigger(agg, '152-2-2');
    const gs = agg.getGameState();
    expect(gs.resources.gold).toBe(12);
    expect(nameOf(agg, SPICES)).toBe('Spices');
    expect(gs.instances[SPICES].trackProgress).toEqual([1, 2, 3, 4]);
  });
});

describe('Furs', () => {
  it('gives a person sticker 18, whose action puts it at the bottom of the deck', () => {
    const agg = makeGame(
      { board: [PEASANT], drawPile: [2], stickerStock: { 18: 1 } },
      { [FURS]: 2 },
    );
    agg.cardAction(actionOf(agg, FURS, '153-2-1'), FURS);
    choose(agg, { instanceIds: [PEASANT] });
    expect(agg.getGameState().instances[PEASANT].stickers[1]).toEqual([18]);
    expect(nameOf(agg, FURS)).toBe('Cheeta Fur');

    agg.cardAction(actionOf(agg, PEASANT, 'sticker-18'), PEASANT);
    expect(agg.getGameState().drawPile).toEqual([2, PEASANT]);
  });
});

describe('Weaving', () => {
  it('discards a person and spends the gold of the next box, worth its glory', () => {
    const agg = makeGame({ permanents: [WEAVING], board: [PEASANT], resources: { gold: 2 } });
    agg.cardAction(actionOf(agg, WEAVING, '154-1-1'), WEAVING);
    payCards(agg, [PEASANT]);

    const gs = agg.getGameState();
    expect(gs.discardPile).toContain(PEASANT);
    expect(gs.resources.gold ?? 0).toBe(0);
    expect(gs.instances[WEAVING].cumulated).toBe(1);
  });
});

describe('Beer and Hangover', () => {
  it('discards each person played and is destroyed once its 5 boxes are marked', () => {
    const agg = makeGame({ board: [BEER], drawPile: [PEASANT, 6] }, { [BEER]: 2 });
    agg.turnStarted();
    resolveTrigger(agg, '161-2-1');

    const gs = agg.getGameState();
    expect(gs.board).toEqual([BEER]);
    expect(gs.discardPile).toEqual(expect.arrayContaining([PEASANT, 6]));
    expect(gs.instances[BEER].trackProgress).toEqual([6, 7]);
  });
});

describe('Mead', () => {
  it('loses the next 3 resources once Too Much Mead is played', () => {
    const agg = makeGame({ drawPile: [MEAD, WILD_GRASS] }, { [MEAD]: 2 });
    agg.turnStarted();
    resolveTrigger(agg, '165-2-1');
    agg.cardProduced(WILD_GRASS, { gold: 1 });
    expect(agg.getGameState().resources.gold).toBe(0);
    expect(agg.getGameState().resourcesToLose).toBe(2);
  });
});

describe('Camel Herd', () => {
  it('resets to discover the Pair of Camels the player chooses', () => {
    const agg = makeGame({ board: [CAMELS] }, { [CAMELS]: 3 });
    agg.cardAction(actionOf(agg, CAMELS, '151-3-1'), CAMELS);
    const [choice] = found(agg.getCurrentCardAction()).getPendingChoices();
    expect(choice.type).toBe(PendingChoiceType.CHOOSE_CARD);
    expect(choice.choices).toEqual([CAMELS_24, CAMELS_25]);
    choose(agg, { instanceIds: [CAMELS_25] });

    const gs = agg.getGameState();
    expect(gs.discardPile).toEqual(expect.arrayContaining([CAMELS, CAMELS_25]));
    expect(nameOf(agg, CAMELS)).toBe('Pair of Camels');
  });
});
