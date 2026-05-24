import { makeState } from '../fixtures';
import { CampaignScoreSavedStrategy } from '@engine/application/gameEvent/CampaignScoreSavedStrategy';
import { ExpansionSelectedStrategy } from '@engine/application/gameEvent/ExpansionSelectedStrategy';
import { PurgeCardSelectedStrategy } from '@engine/application/gameEvent/PurgeCardSelectedStrategy';
import { PurgeOnTriggeredStrategy } from '@engine/application/gameEvent/PurgeOnTriggeredStrategy';
import { PurgePermanentSelectedStrategy } from '@engine/application/gameEvent/PurgePermanentSelectedStrategy';
import { GameEventType } from '@engine/domain/enums';
import type {
  CampaignScoreSavedEvent,
  ExpansionSelectedEvent,
  PurgeCardSelectedEvent,
  PurgeOnTriggeredEvent,
  PurgePermanentSelectedEvent,
} from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it } from 'vitest';

describe('Small game event strategies', () => {
  it('CampaignScoreSavedStrategy keeps current phase when openExpansionChoice is false', () => {
    const strategy = new CampaignScoreSavedStrategy();
    const state = makeState({ phase: Phase.ROUND_END, campaignScores: { a: 1 } });

    const result = strategy.apply(state, {
      id: 'c1',
      type: GameEventType.CAMPAIGN_SCORE_SAVED,
      timestamp: 0,
      segment: 'b',
      score: 7,
      openExpansionChoice: false,
    } as CampaignScoreSavedEvent);

    expect(result.campaignScores).toEqual({ a: 1, b: 7 });
    expect(result.phase).toBe(Phase.ROUND_END);
  });

  it('CampaignScoreSavedStrategy opens expansion choice when flag is true', () => {
    const strategy = new CampaignScoreSavedStrategy();
    const state = makeState({ phase: Phase.ROUND_END, campaignScores: {} });

    const result = strategy.apply(state, {
      id: 'c2',
      type: GameEventType.CAMPAIGN_SCORE_SAVED,
      timestamp: 0,
      segment: 'a',
      score: 3,
      openExpansionChoice: true,
    } as CampaignScoreSavedEvent);

    expect(result.phase).toBe(Phase.EXPANSION_CHOICE);
    expect(result.campaignScores.a).toBe(3);
  });

  it('ExpansionSelectedStrategy defaults parameterOverrides to empty object', () => {
    const strategy = new ExpansionSelectedStrategy({
      1: { id: 1, name: 'C', states: [{ id: 10, name: 'S' }] },
    });
    const state = makeState({ discoveryPile: [5], instances: {}, round: 7, turn: 3 });

    const result = strategy.apply(state, {
      id: 'e1',
      type: GameEventType.EXPANSION_SELECTED,
      timestamp: 0,
      expansionName: 'exp',
      deckEntries: [
        { id: 5, cardId: 1 },
        { id: 6, cardId: 1 },
      ],
      purgeBatchSize: 2,
      purgePermanentCount: 1,
      purgePool: [5, 6],
      onStartDiscoverIds: [],
    } as ExpansionSelectedEvent);

    expect(result.parameterOverrides).toEqual({});
    expect(result.expansionMaxRound).toBeUndefined();
    expect(result.round).toBe(0);
    expect(result.turn).toBe(0);
    expect(result.discoveryPile).toEqual([5, 6]);
    expect(result.phase).toBe(Phase.PURGE);
  });

  it('ExpansionSelectedStrategy stores expansionMaxRound when provided', () => {
    const strategy = new ExpansionSelectedStrategy({
      1: { id: 1, name: 'C', states: [{ id: 10, name: 'S' }] },
    });
    const state = makeState({ discoveryPile: [], instances: {} });

    const result = strategy.apply(state, {
      id: 'e2',
      type: GameEventType.EXPANSION_SELECTED,
      timestamp: 0,
      expansionName: 'exp',
      expansionMaxRound: 3,
      deckEntries: [{ id: 5, cardId: 1 }],
      purgeBatchSize: 2,
      purgePermanentCount: 1,
      purgePool: [5],
      onStartDiscoverIds: [],
    } as ExpansionSelectedEvent);

    expect(result.expansionMaxRound).toBe(3);
  });

  it('PurgeCardSelectedStrategy returns original state when purgeState is missing', () => {
    const strategy = new PurgeCardSelectedStrategy();
    const state = makeState({ purgeState: undefined });

    const result = strategy.apply(state, {
      id: 'p1',
      type: GameEventType.PURGE_CARD_SELECTED,
      timestamp: 0,
      instanceId: 5,
      batchStart: 0,
    } as PurgeCardSelectedEvent);

    expect(result).toBe(state);
  });

  it('PurgeOnTriggeredStrategy returns original state when purgeState is missing', () => {
    const strategy = new PurgeOnTriggeredStrategy();
    const state = makeState({ purgeState: undefined });

    const result = strategy.apply(state, {
      id: 'p2',
      type: GameEventType.PURGE_ON_TRIGGERED,
      timestamp: 0,
      triggers: {},
    } as PurgeOnTriggeredEvent);

    expect(result).toBe(state);
  });

  it('PurgePermanentSelectedStrategy returns original state when purgeState is missing', () => {
    const strategy = new PurgePermanentSelectedStrategy();
    const state = makeState({ purgeState: undefined });

    const result = strategy.apply(state, {
      id: 'p3',
      type: GameEventType.PURGE_PERMANENT_SELECTED,
      timestamp: 0,
      instanceId: 9,
    } as PurgePermanentSelectedEvent);

    expect(result).toBe(state);
  });
});
