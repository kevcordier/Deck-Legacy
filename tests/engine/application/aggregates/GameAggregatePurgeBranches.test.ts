import { makeDef, makeInstance, makeState } from '../fixtures';
import { GameAggregate } from '@engine/application/aggregates/GameAggregate';
import { GameEventType, PassiveType, Trigger } from '@engine/domain/enums';
import type { CardDef, ExpansionConfig, TriggerEntry } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it } from 'vitest';

describe('GameAggregate purge branch coverage', () => {
  it('returns default values on purge helpers when purgeState is missing', () => {
    const state = makeState({ purgeState: undefined });
    const agg = new GameAggregate(crypto.randomUUID(), state, { 1: makeDef({ id: 1 }) }, {}, []);

    expect(agg.getPurgeCandidates()).toEqual([]);
    expect(agg.getPurgePermanentCandidates()).toEqual([]);
    expect(agg.canSelectPermanentForPurge()).toBe(false);
    expect(agg.isPurgeSelectionComplete()).toBe(false);
    expect(agg.getSelectedPurgeIds()).toEqual([]);
  });

  it('marks purge selection complete when permanent quota remains but no candidate exists', () => {
    const state = makeState({
      phase: Phase.PURGE,
      purgeState: {
        batchSize: 1,
        permanentToPurge: 1,
        shuffledPool: [],
        completedBatchStarts: [],
        selectedCardIds: [],
        selectedPermanentIds: [],
        onPurgeTriggered: false,
        onStartDiscoverIds: [],
      },
      permanents: [],
      instances: {},
    });

    const agg = new GameAggregate(crypto.randomUUID(), state, { 1: makeDef({ id: 1 }) }, {}, []);
    expect(agg.isPurgeSelectionComplete()).toBe(true);
  });

  it('filters purge permanent candidates with all eligibility guards', () => {
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'Enemy', states: [{ id: 1, name: 'S', negative: true }] },
      2: { id: 2, name: 'NotPermanent', states: [{ id: 1, name: 'S', permanent: false }] },
      3: {
        id: 3,
        name: 'Protected',
        states: [
          {
            id: 1,
            name: 'S',
            permanent: true,
            passives: [{ id: 'cant', type: PassiveType.CANT_BE_DESTROYED }],
          },
        ],
      },
      4: { id: 4, name: 'Valid', states: [{ id: 1, name: 'S', permanent: true }] },
    };

    const state = makeState({
      phase: Phase.PURGE,
      permanents: [99, 1, 2, 3, 4],
      instances: {
        1: makeInstance({ id: 1, cardId: 1, stateId: 1 }),
        2: makeInstance({ id: 2, cardId: 2, stateId: 1 }),
        3: makeInstance({ id: 3, cardId: 3, stateId: 1 }),
        4: makeInstance({ id: 4, cardId: 4, stateId: 1 }),
      },
      purgeState: {
        batchSize: 1,
        permanentToPurge: 1,
        shuffledPool: [],
        completedBatchStarts: [],
        selectedCardIds: [],
        selectedPermanentIds: [],
        onPurgeTriggered: false,
        onStartDiscoverIds: [],
      },
    });

    const agg = new GameAggregate(crypto.randomUUID(), state, defs, {}, []);
    expect(agg.getPurgePermanentCandidates()).toEqual([4]);
  });

  it('does not select purge card when id is not in current candidates', () => {
    const state = makeState({
      phase: Phase.PURGE,
      instances: { 1: makeInstance({ id: 1, cardId: 1, stateId: 1 }) },
      purgeState: {
        batchSize: 1,
        permanentToPurge: 0,
        shuffledPool: [1],
        completedBatchStarts: [],
        selectedCardIds: [],
        selectedPermanentIds: [],
        onPurgeTriggered: false,
        onStartDiscoverIds: [],
      },
    });
    const agg = new GameAggregate(crypto.randomUUID(), state, { 1: makeDef({ id: 1 }) }, {}, []);

    const before = agg.getEvents().length;
    const result = agg.selectPurgeCard(999);

    expect(result).toBe(state);
    expect(agg.getEvents()).toHaveLength(before);
  });

  it('returns no purge candidates when all pool cards are already selected', () => {
    const state = makeState({
      phase: Phase.PURGE,
      purgeState: {
        batchSize: 2,
        permanentToPurge: 0,
        shuffledPool: [1, 2],
        completedBatchStarts: [],
        selectedCardIds: [1, 2],
        selectedPermanentIds: [],
        onPurgeTriggered: false,
        onStartDiscoverIds: [],
      },
    });

    const agg = new GameAggregate(crypto.randomUUID(), state, { 1: makeDef({ id: 1 }) }, {}, []);
    expect(agg.getPurgeCandidates()).toEqual([]);
  });

  it('does not select purge permanent when quota is already reached', () => {
    const state = makeState({
      phase: Phase.PURGE,
      permanents: [1],
      instances: { 1: makeInstance({ id: 1, cardId: 1, stateId: 1 }) },
      purgeState: {
        batchSize: 1,
        permanentToPurge: 1,
        shuffledPool: [],
        completedBatchStarts: [],
        selectedCardIds: [],
        selectedPermanentIds: [1],
        onPurgeTriggered: false,
        onStartDiscoverIds: [],
      },
    });
    const agg = new GameAggregate(crypto.randomUUID(), state, { 1: makeDef({ id: 1 }) }, {}, []);

    const before = agg.getEvents().length;
    const result = agg.selectPurgePermanent(1);

    expect(result).toBe(state);
    expect(agg.getEvents()).toHaveLength(before);
  });

  it('does not select purge permanent when id is not a valid candidate', () => {
    const state = makeState({
      phase: Phase.PURGE,
      permanents: [1],
      instances: { 1: makeInstance({ id: 1, cardId: 1, stateId: 1 }) },
      purgeState: {
        batchSize: 1,
        permanentToPurge: 1,
        shuffledPool: [],
        completedBatchStarts: [],
        selectedCardIds: [],
        selectedPermanentIds: [],
        onPurgeTriggered: false,
        onStartDiscoverIds: [],
      },
    });
    const agg = new GameAggregate(crypto.randomUUID(), state, { 1: makeDef({ id: 1 }) }, {}, []);

    const before = agg.getEvents().length;
    const result = agg.selectPurgePermanent(999);

    expect(result).toBe(state);
    expect(agg.getEvents()).toHaveLength(before);
  });

  it('selects purge permanent when candidate is valid', () => {
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'Permanent', states: [{ id: 1, name: 'S', permanent: true }] },
    };

    const state = makeState({
      phase: Phase.PURGE,
      permanents: [1],
      instances: { 1: makeInstance({ id: 1, cardId: 1, stateId: 1 }) },
      purgeState: {
        batchSize: 1,
        permanentToPurge: 1,
        shuffledPool: [],
        completedBatchStarts: [],
        selectedCardIds: [],
        selectedPermanentIds: [],
        onPurgeTriggered: false,
        onStartDiscoverIds: [],
      },
    });

    const agg = new GameAggregate(crypto.randomUUID(), state, defs, {}, []);
    const result = agg.selectPurgePermanent(1);

    expect(result.purgeState?.selectedPermanentIds).toEqual([1]);
    expect(agg.getEvents()[agg.getEvents().length - 1]?.type).toBe(
      GameEventType.PURGE_PERMANENT_SELECTED,
    );
  });

  it('returns early in finalizePurge when selection is incomplete', () => {
    const state = makeState({
      phase: Phase.PURGE,
      instances: { 1: makeInstance({ id: 1, cardId: 1, stateId: 1 }) },
      purgeState: {
        batchSize: 1,
        permanentToPurge: 0,
        shuffledPool: [1],
        completedBatchStarts: [],
        selectedCardIds: [],
        selectedPermanentIds: [],
        onPurgeTriggered: false,
        onStartDiscoverIds: [],
      },
    });
    const agg = new GameAggregate(crypto.randomUUID(), state, { 1: makeDef({ id: 1 }) }, {}, []);

    const result = agg.finalizePurge();
    expect(result).toBe(state);
  });

  it('returns after ON_PURGE trigger creation without finalizing purge', () => {
    const defs: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'TriggerCard',
        states: [
          {
            id: 1,
            name: 'S',
            actions: [
              {
                id: '1-1-1',
                trigger: Trigger.ON_PURGE,
                actionEffects: [],
              },
            ],
          },
        ],
      },
    };

    const state = makeState({
      phase: Phase.PURGE,
      instances: { 1: makeInstance({ id: 1, cardId: 1, stateId: 1 }) },
      purgeState: {
        batchSize: 1,
        permanentToPurge: 0,
        shuffledPool: [1],
        completedBatchStarts: [0],
        selectedCardIds: [1],
        selectedPermanentIds: [],
        onPurgeTriggered: false,
        onStartDiscoverIds: [],
      },
    });
    const agg = new GameAggregate(crypto.randomUUID(), state, defs, {}, []);

    const result = agg.finalizePurge();

    expect(Object.keys(result.triggerPile).length).toBeGreaterThan(0);
    expect(result.purgeState?.onPurgeTriggered).toBe(true);
    expect(result.purgedCards).toEqual([]);
  });

  it('returns when purge triggers are still pending', () => {
    const pendingTrigger: TriggerEntry = {
      effectDef: { id: 'x', actionEffects: [] },
      sourceInstanceId: 1,
    };

    const state = makeState({
      phase: Phase.PURGE,
      triggerPile: { t1: pendingTrigger },
      instances: { 1: makeInstance({ id: 1, cardId: 1, stateId: 1 }) },
      purgeState: {
        batchSize: 1,
        permanentToPurge: 0,
        shuffledPool: [1],
        completedBatchStarts: [0],
        selectedCardIds: [1],
        selectedPermanentIds: [],
        onPurgeTriggered: true,
        onStartDiscoverIds: [],
      },
    });
    const agg = new GameAggregate(crypto.randomUUID(), state, { 1: makeDef({ id: 1 }) }, {}, []);

    const result = agg.finalizePurge();
    expect(result).toBe(state);
  });

  it('finalizes purge and ignores missing instances while computing glory', () => {
    const state = makeState({
      phase: Phase.PURGE,
      triggerPile: {},
      instances: {},
      purgeState: {
        batchSize: 1,
        permanentToPurge: 0,
        shuffledPool: [999],
        completedBatchStarts: [0],
        selectedCardIds: [999],
        selectedPermanentIds: [],
        onPurgeTriggered: true,
        onStartDiscoverIds: [],
      },
    });
    const agg = new GameAggregate(crypto.randomUUID(), state, { 1: makeDef({ id: 1 }) }, {}, []);

    const result = agg.finalizePurge();

    expect(result.purgedCards).toContain(999);
    expect(result.purgedGlory[result.purgedGlory.length - 1]).toBe(0);
  });
});

describe('GameAggregate campaign score branch coverage', () => {
  it('uses empty onStart discover list when expansion has no onStart config', () => {
    const state = makeState({
      drawPile: [1],
      discardPile: [2],
      board: [3],
      instances: {
        1: makeInstance({ id: 1, cardId: 1, stateId: 1 }),
        2: makeInstance({ id: 2, cardId: 1, stateId: 1 }),
        3: makeInstance({ id: 3, cardId: 1, stateId: 1 }),
      },
    });

    const agg = new GameAggregate(crypto.randomUUID(), state, { 1: makeDef({ id: 1 }) }, {}, []);
    const expansion: ExpansionConfig = {
      deck: [{ id: 10, cardId: 1 }],
      purge: { purge: 1, permanent: 0 },
    };

    const result = agg.selectExpansion('x', expansion);

    expect(result.purgeState?.onStartDiscoverIds).toEqual([]);
  });

  it('saveCampaignScore uses base segment by default and opens expansion choice', () => {
    const scoringDef: CardDef = {
      id: 1,
      name: 'Scoring',
      states: [{ id: 1, name: 'S', glory: { amount: 3 } }],
    };
    const state = makeState({
      phase: Phase.GAME_OVER,
      drawPile: [1],
      instances: { 1: makeInstance({ id: 1, cardId: 1, stateId: 1 }) },
      purgedGlory: [2],
      activeExpansion: undefined,
    });
    const agg = new GameAggregate(crypto.randomUUID(), state, { 1: scoringDef }, {}, []);

    const result = agg.saveCampaignScore();
    const lastEvent = agg.getEvents()[agg.getEvents().length - 1];

    expect(lastEvent.type).toBe(GameEventType.CAMPAIGN_SCORE_SAVED);
    expect(result.campaignScores.base).toBe(5);
    expect(result.phase).toBe(Phase.EXPANSION_CHOICE);
  });

  it('saveCampaignScore uses active expansion segment and can keep current phase', () => {
    const scoringDef: CardDef = {
      id: 1,
      name: 'Scoring',
      states: [{ id: 1, name: 'S', glory: { amount: 1 } }],
    };
    const state = makeState({
      phase: Phase.GAME_OVER,
      drawPile: [1],
      instances: { 1: makeInstance({ id: 1, cardId: 1, stateId: 1 }) },
      activeExpansion: 'Prosperity',
    });
    const agg = new GameAggregate(crypto.randomUUID(), state, { 1: scoringDef }, {}, []);

    const result = agg.saveCampaignScore(false);

    expect(result.campaignScores.Prosperity).toBe(1);
    expect(result.phase).toBe(Phase.GAME_OVER);
  });

  it('resets round and keeps positive expansionMaxRound on expansion selection', () => {
    const state = makeState({
      round: 7,
      turn: 2,
      drawPile: [1],
      instances: { 1: makeInstance({ id: 1, cardId: 1, stateId: 1 }) },
    });
    const agg = new GameAggregate(crypto.randomUUID(), state, { 1: makeDef({ id: 1 }) }, {}, []);
    const expansion: ExpansionConfig = {
      expansionMaxRound: 3,
      deck: [{ id: 10, cardId: 1 }],
      purge: { purge: 1, permanent: 0 },
    };

    const result = agg.selectExpansion('x', expansion);

    expect(result.round).toBe(0);
    expect(result.turn).toBe(0);
    expect(result.expansionMaxRound).toBe(3);
  });

  it('drops non-positive expansionMaxRound values on expansion selection', () => {
    const state = makeState({
      drawPile: [1],
      instances: { 1: makeInstance({ id: 1, cardId: 1, stateId: 1 }) },
    });
    const agg = new GameAggregate(crypto.randomUUID(), state, { 1: makeDef({ id: 1 }) }, {}, []);
    const expansion: ExpansionConfig = {
      expansionMaxRound: 0,
      deck: [{ id: 10, cardId: 1 }],
      purge: { purge: 1, permanent: 0 },
    };

    const result = agg.selectExpansion('x', expansion);

    expect(result.expansionMaxRound).toBeUndefined();
  });
});
