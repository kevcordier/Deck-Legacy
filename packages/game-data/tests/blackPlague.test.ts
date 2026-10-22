import { loadGameCatalog } from '../src';
import { GameAggregate } from '@deck-legacy/engine/domain/aggregates/GameAggregate';
import { getStateActions } from '@deck-legacy/engine/domain/cards/selection/getStateActions';
import { ActionEffectType, Phase, TargetScope } from '@deck-legacy/engine/domain/enums';
import { createInstance } from '@deck-legacy/engine/domain/factory';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/state/emptyState';
import type { CardAction, GameState } from '@deck-legacy/engine/domain/types';
import { describe, expect, it } from 'vitest';

const catalog = loadGameCatalog();
const CAMPAIGN = 'The Black Plague';

// Instance ids (expansions/foundations/deck.json): printed number + 191
const CAMPAIGN_CARD = 193;
const BLACK_PLAGUE = 194;
const TREATMENT = 195;
const QUARANTINE = 196;
const RATS_6 = 197;
const RATS_7 = 198;
const RATS_8 = 199;
const RATS_11 = 202;
// Base game Peasants (person, gold)
const PEASANT = 5;
const PEASANT_2 = 6;
const INFECTED = 61;
const MARKED = 161;

function found<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error('Missing test data');
  return value;
}

function makeGame(overrides: Partial<GameState>, states: Record<number, number> = {}) {
  const campaign = catalog.expansions[CAMPAIGN];
  const entries = [{ id: PEASANT, cardId: 5 }, { id: PEASANT_2, cardId: 5 }, ...campaign.campaign];
  const instances = Object.fromEntries(
    entries.map(({ id, cardId }) => [
      id,
      createInstance(id, cardId, states[id] ?? 1, catalog.cards),
    ]),
  );
  const state: GameState = {
    ...(JSON.parse(JSON.stringify(EMPTY_STATE)) as GameState),
    activeExpansion: CAMPAIGN,
    phase: Phase.PLAYING,
    round: 1,
    turn: 1,
    instances,
    discoverablePile: [],
    stickerStock: { [INFECTED]: 35, [MARKED]: 35 },
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

const stickersOf = (agg: GameAggregate, id: number) => {
  const instance = agg.getGameState().instances[id];
  return instance.stickers[instance.stateId] ?? [];
};

function choose(agg: GameAggregate, instanceIds: number[]) {
  const [choice] = found(agg.getCurrentCardAction()).getPendingChoices();
  return agg.resolveCardActionChoice(
    { id: choice.id, type: choice.kind, sourceInstanceId: choice.sourceInstanceId, instanceIds },
    choice.type,
  );
}

describe('starting The Black Plague', () => {
  it('discovers its campaign card, whose first box discovers 6 cards before round 1', () => {
    const ids = Array.from({ length: 10 }, (_, i) => i + 1);
    const agg = new GameAggregate(
      'game',
      {
        ...(JSON.parse(JSON.stringify(EMPTY_STATE)) as GameState),
        phase: Phase.GAME_OVER,
        drawPile: ids,
        discoverablePile: [],
        campaignScores: { base: 0 },
        instances: Object.fromEntries(ids.map(id => [id, createInstance(id, 1, 1, catalog.cards)])),
      },
      catalog.cards,
      catalog.stickers,
    );
    agg.selectExpansion(CAMPAIGN, catalog.expansions[CAMPAIGN]);
    expect(agg.getGameState().purgeState).toMatchObject({ batchSize: 6, permanentToPurge: 2 });
    while (agg.getPurgeCandidates().length > 0) agg.selectPurgeCard(agg.getPurgeCandidates()[0]);
    agg.finalizePurge();

    expect(agg.getGameState().phase).toBe(Phase.ROUND_END);
    expect(agg.getGameState().permanents).toEqual([CAMPAIGN_CARD]);
    resolveTriggers(agg, '175-1-2');
    // The green box: the player picks the foundation to discover (Science)
    const [foundation] = agg.getCurrentCardAction()?.getPendingChoices() ?? [];
    expect(foundation.choices).toContain(236);
    agg.resolveCardActionChoice(
      {
        id: foundation.id,
        type: foundation.kind,
        sourceInstanceId: foundation.sourceInstanceId,
        instanceIds: [236],
      },
      foundation.type,
    );

    const gs = agg.getGameState();
    expect(gs.instances[CAMPAIGN_CARD].trackProgress).toEqual([1]);
    expect(gs.permanents).toEqual([CAMPAIGN_CARD, BLACK_PLAGUE, TREATMENT, QUARANTINE]);
    expect(gs.discardPile).toEqual(expect.arrayContaining([RATS_6, RATS_7, RATS_8]));
    expect(gs.discoveryPile[0]).toBe(200);

    agg.roundStarted();
    expect(agg.getGameState().round).toBe(1);
    expect(agg.getGameState().drawPile).toEqual(expect.arrayContaining([RATS_6, RATS_7, RATS_8]));
  });

  it('marks the next box at the end of each round: 5 cards after round 1', () => {
    const agg = makeGame({
      permanents: [CAMPAIGN_CARD],
      drawPile: [],
      discoveryPile: Array.from({ length: 13 }, (_, i) => 194 + i),
    });
    agg.getGameState().instances[CAMPAIGN_CARD].trackProgress.push(1);
    agg.roundEnded();
    resolveTriggers(agg, '175-1-1');

    const gs = agg.getGameState();
    expect(gs.instances[CAMPAIGN_CARD].trackProgress).toEqual([1, 2]);
    expect(gs.discoveryPile).toEqual(Array.from({ length: 8 }, (_, i) => 199 + i));
  });
});

describe('the infection', () => {
  it('spreads from Rats to every person in play', () => {
    const agg = makeGame({ permanents: [BLACK_PLAGUE], drawPile: [RATS_6, PEASANT, PEASANT_2] });
    agg.turnStarted();
    resolveTriggers(agg, '176-1-1');
    resolveTriggers(agg, '176-1-2');

    expect(stickersOf(agg, PEASANT)).toEqual([INFECTED]);
    expect(stickersOf(agg, PEASANT_2)).toEqual([INFECTED]);
  });

  it('marks an infected person discarded, then destroys it the second time', () => {
    const agg = makeGame({ permanents: [BLACK_PLAGUE], board: [PEASANT], drawPile: [] });
    agg.getGameState().instances[PEASANT].stickers[1] = [INFECTED];

    agg.turnEnded();
    resolveTriggers(agg, '176-1-3');
    expect(stickersOf(agg, PEASANT)).toEqual([INFECTED, MARKED]);
    expect(agg.getGameState().discardPile).toContain(PEASANT);

    const again = makeGame({ permanents: [BLACK_PLAGUE], board: [PEASANT], drawPile: [] });
    again.getGameState().instances[PEASANT].stickers[1] = [INFECTED, MARKED];
    again.turnEnded();
    resolveTriggers(again, '176-1-3');
    expect(again.getGameState().destroyedPile).toContain(PEASANT);
  });

  it('marks only a person discarded from play, not from the top of the deck', () => {
    const agg = makeGame({ permanents: [BLACK_PLAGUE], drawPile: [PEASANT] });
    agg.getGameState().instances[PEASANT].stickers[1] = [INFECTED];
    agg.cardAction(
      {
        id: 'discard-top',
        unlimited: true,
        actionEffects: [
          {
            id: 1,
            type: ActionEffectType.DISCARD_CARD,
            cards: { scope: [TargetScope.TOP_OF_DECK] },
          },
        ],
      },
      BLACK_PLAGUE,
    );

    expect(agg.getGameState().discardPile).toContain(PEASANT);
    expect(agg.getGameState().triggerPile).toEqual({});
  });

  it('marks a person discarded from Quarantine, which is in play', () => {
    const agg = makeGame(
      { permanents: [BLACK_PLAGUE, QUARANTINE], board: [PEASANT], drawPile: [] },
      { [QUARANTINE]: 2 },
    );
    agg.getGameState().instances[PEASANT].stickers[1] = [INFECTED];
    agg.cardAction(actionOf(agg, QUARANTINE, '178-2-1'), QUARANTINE);
    choose(agg, [PEASANT]);
    agg.cardAction(actionOf(agg, QUARANTINE, '178-2-2'), QUARANTINE);
    choose(agg, [PEASANT]);
    resolveTriggers(agg, '176-1-3');

    expect(agg.getGameState().discardPile).toContain(PEASANT);
    expect(stickersOf(agg, PEASANT)).toEqual([INFECTED, MARKED]);
  });

  it('is cured by Treatment, which ends the turn', () => {
    const agg = makeGame({
      permanents: [TREATMENT],
      board: [PEASANT],
      drawPile: [PEASANT_2],
      resources: { gold: 3 },
    });
    agg.getGameState().instances[PEASANT].stickers[1] = [INFECTED, MARKED];
    agg.cardAction(actionOf(agg, TREATMENT, '177-1-1'), TREATMENT);
    choose(agg, [PEASANT]);

    expect(stickersOf(agg, PEASANT)).toEqual([]);
    expect(agg.getGameState().resources.gold ?? 0).toBe(0);
  });
});

describe('Quarantine', () => {
  it('keeps a blocked person out of the deck until it releases it', () => {
    const agg = makeGame(
      { permanents: [QUARANTINE], board: [PEASANT, PEASANT_2], drawPile: [] },
      {
        [QUARANTINE]: 2,
      },
    );
    agg.cardAction(actionOf(agg, QUARANTINE, '178-2-1'), QUARANTINE);
    choose(agg, [PEASANT]);
    // Capacity 1: no second person
    expect(() => agg.cardAction(actionOf(agg, QUARANTINE, '178-2-1'), QUARANTINE)).toThrow();

    agg.turnEnded();
    expect(agg.getGameState().board).toEqual([PEASANT]);
    agg.roundStarted();
    expect(agg.getGameState().board).toEqual([PEASANT]);
    expect(agg.getGameState().drawPile).not.toContain(PEASANT);

    agg.turnStarted();
    agg.cardAction(actionOf(agg, QUARANTINE, '178-2-2'), QUARANTINE);
    expect(agg.getGameState().discardPile).toContain(PEASANT);
    // Once per turn: a second use does nothing
    const events = agg.getEvents().length;
    agg.cardAction(actionOf(agg, QUARANTINE, '178-2-2'), QUARANTINE);
    expect(agg.getEvents()).toHaveLength(events);
  });
});

describe('Rats', () => {
  it('go back in serial order in the Black Plague deck', () => {
    const agg = makeGame({ board: [RATS_8, PEASANT], discoveryPile: [RATS_7, RATS_11] });
    // A Peasant produces gold, not weapons: a weapon producer is needed.
    agg.getGameState().instances[PEASANT].stickers[1] = [5];
    agg.cardAction(actionOf(agg, RATS_8, '179-1-2'), RATS_8);
    agg.resolveCardActionCost({ resources: {}, discardedCardIds: [PEASANT], destroyedCardIds: [] });

    expect(agg.getGameState().discoveryPile).toEqual([RATS_7, RATS_8, RATS_11]);
  });

  it('are destroyed instead once the Black Plague is over', () => {
    const agg = makeGame({ activeExpansion: undefined, board: [RATS_8, PEASANT] });
    agg.getGameState().instances[PEASANT].stickers[1] = [5];
    agg.cardAction(actionOf(agg, RATS_8, '179-1-2'), RATS_8);
    agg.resolveCardActionCost({ resources: {}, discardedCardIds: [PEASANT], destroyedCardIds: [] });

    expect(agg.getGameState().destroyedPile).toContain(RATS_8);
  });
});
