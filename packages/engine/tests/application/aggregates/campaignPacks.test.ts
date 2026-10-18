import { makeDef, makeInstance, makeState } from '../fixtures';
import { GameAggregate } from '@engine/application/aggregates/GameAggregate';
import { AdvanceStoryStrategy } from '@engine/application/cardAction/AdvanceStoryStrategy';
import { DiscoverCardStrategy } from '@engine/application/cardAction/DiscoverCardStrategy';
import { EndGameStrategy } from '@engine/application/cardAction/EndGameStrategy';
import { cardSelector } from '@engine/application/cardSelector';
import { ExpansionSelectedStrategy } from '@engine/application/gameEvent/ExpansionSelectedStrategy';
import { GameEndedStrategy } from '@engine/application/gameEvent/GameEndedStrategy';
import { GameStartedStrategy } from '@engine/application/gameEvent/GameStartedStrategy';
import { PurgeFinalizedStrategy } from '@engine/application/gameEvent/PurgeFinalizedStrategy';
import { ActionEffectType, GameEventType, Phase, TargetScope } from '@engine/domain/enums';
import type {
  ExpansionSelectedEvent,
  GameEvent,
  GameStartedEvent,
  GameState,
  PurgeFinalizedEvent,
} from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const defs = { 1: makeDef({ id: 1 }) };
const instances = (ids: number[]) =>
  Object.fromEntries(ids.map(id => [id, makeInstance({ id, cardId: 1 })]));

/** A game between two rounds, with its campaign and discoverable piles. */
function between(overrides: Partial<GameState>) {
  const state = makeState({
    round: 1,
    phase: Phase.ROUND_END,
    discardPile: [1, 2],
    instances: instances([1, 2, 3, 4, 5, 6]),
    ...overrides,
  });
  return new GameAggregate(crypto.randomUUID(), state, defs, {}, []);
}

const types = (events: GameEvent[]) => events.map(event => event.type);

describe('campaign and discoverable packs', () => {
  it('advances the story with its own event at the start of a round', () => {
    const agg = between({ discoveryPile: [3, 4, 5], discoverablePile: [6] });

    agg.roundStarted();

    expect(types(agg.getEvents())).toEqual([
      GameEventType.ROUND_STARTED,
      GameEventType.STORY_ADVANCED,
    ]);
    expect(agg.getEvents()[1]).toMatchObject({ discoveredIds: [3, 4] });
    const state = agg.getGameState();
    expect(state.discoveryPile).toEqual([5]);
    expect(state.discoverablePile).toEqual([6]);
    expect(state.lastAddedCards).toEqual([3, 4]);
    expect([...state.drawPile].sort((a, b) => a - b)).toEqual([1, 2, 3, 4]);
  });

  it('ends the campaign when the campaign pile is empty, whatever is still discoverable', () => {
    const agg = between({ discoveryPile: [], discoverablePile: [6] });

    agg.roundStarted();

    expect(types(agg.getEvents())).toEqual([GameEventType.GAME_ENDED]);
    expect(agg.getGameState().phase).toBe(Phase.GAME_OVER);
  });

  it('ends the campaign when the campaign pile holds fewer cards than a round discovers', () => {
    const agg = between({ discoveryPile: [3], discoverablePile: [6] });

    agg.roundStarted();

    expect(types(agg.getEvents())).toEqual([GameEventType.GAME_ENDED]);
  });

  it('makes the round just ended the last one when the campaign pile runs short', () => {
    const playing = { phase: Phase.TURN_END, discardPile: [], board: [1, 2] };
    const short = between({ ...playing, discoveryPile: [3], discoverablePile: [6] });

    short.roundEnded();

    expect(types(short.getEvents())).toEqual([GameEventType.ROUND_ENDED]);
    expect(short.getGameState().phase).toBe(Phase.ROUND_END);
    expect(short.isLastRound()).toBe(true);

    const enough = between({ ...playing, discoveryPile: [3, 4], discoverablePile: [6] });
    expect(enough.isLastRound()).toBe(false);
    enough.roundEnded();
    expect(enough.getGameState().phase).toBe(Phase.ROUND_START);

    const singlePile = between({ ...playing, discoveryPile: [], discoverablePile: undefined });
    expect(singlePile.isLastRound()).toBe(false);
  });

  it('keeps the former rules in a game started with a single discovery pile', () => {
    const agg = between({ discoveryPile: [3, 4, 5], discoverablePile: undefined });

    agg.roundStarted();

    expect(types(agg.getEvents())).toEqual([GameEventType.ROUND_STARTED]);
    expect(agg.getEvents()[0]).toMatchObject({ lastAddedCards: [3, 4] });
    expect(agg.getGameState().discoveryPile).toEqual([5]);

    const ended = between({ discoveryPile: [], discoverablePile: undefined });
    ended.roundStarted();
    expect(types(ended.getEvents())).toEqual([GameEventType.ROUND_STARTED]);
  });

  it('empties the campaign pile at the end of the game, except with a single discovery pile', () => {
    const event = { id: 'e', type: GameEventType.GAME_ENDED, timestamp: 0 };
    const twoPacks = makeState({ discoveryPile: [3], discoverablePile: [6] });
    const single = makeState({ discoveryPile: [3] });

    expect(new GameEndedStrategy().apply(twoPacks, event).discoveryPile).toEqual([]);
    expect(new GameEndedStrategy().apply(single, event).discoveryPile).toEqual([3]);
    expect(new EndGameStrategy().apply(twoPacks).discoveryPile).toEqual([]);
    expect(new EndGameStrategy().apply(single).discoveryPile).toEqual([3]);
  });

  it('starts a game with both piles, and replays an older start without the discoverable one', () => {
    const event: GameStartedEvent = {
      id: 'g',
      type: GameEventType.GAME_STARTED,
      timestamp: 0,
      initialDeck: [1],
      deck: [1, 2, 3].map(id => ({ id, cardId: 1 })),
      stickerStock: {},
      discoveryPile: [2],
      discoverablePile: [3],
    };
    const strategy = new GameStartedStrategy(defs);

    const state = strategy.apply(makeState(), event);
    expect(Object.keys(state.instances)).toEqual(['1', '2', '3']);
    expect(state.discoverablePile).toEqual([3]);

    const { discoverablePile: _omitted, ...older } = event;
    const olderEvent: GameStartedEvent = { ...older, discoveryPile: [2, 3] };
    const olderState = strategy.apply(makeState(), olderEvent);
    expect(olderState.discoveryPile).toEqual([2, 3]);
    expect(olderState.discoverablePile).toBeUndefined();
  });

  it('discovers a card by id from either pile', () => {
    const state = makeState({
      discoveryPile: [3],
      discoverablePile: [6],
      instances: instances([3, 6]),
    });

    const result = new DiscoverCardStrategy(defs).apply(state, {
      id: '1',
      type: ActionEffectType.DISCOVER_CARD,
      sourceInstanceId: 1,
      instanceIds: [6],
    });

    expect(result.discoverablePile).toEqual([]);
    expect(result.discardPile).toContain(6);
    expect(cardSelector({ scope: [TargetScope.DISCOVERY] }, 1, state, defs, {})).toEqual([3, 6]);
  });

  it('advances the story from a card effect: the next cards of the campaign pile', () => {
    const state = makeState({
      discoveryPile: [3, 4, 5],
      discoverablePile: [6],
      instances: instances([3, 4, 5, 6]),
    });
    const effect = { id: '1', type: ActionEffectType.ADVANCE_STORY, sourceInstanceId: 1 };
    const strategy = new AdvanceStoryStrategy(defs);

    const result = strategy.apply(state, { ...effect, value: 2 });
    expect(result.discoveryPile).toEqual([5]);
    expect(result.discoverablePile).toEqual([6]);
    expect(result.discardPile).toEqual([3, 4]);
    expect(result.lastAddedCards).toEqual([3, 4]);

    // One card by default; nothing left to discover does nothing.
    expect(strategy.apply(state, effect).lastAddedCards).toEqual([3]);
    expect(strategy.apply(makeState(), effect).discardPile).toEqual([]);
  });

  it('adds the packs of an expansion to the matching piles', () => {
    const event = {
      id: 'x',
      type: GameEventType.EXPANSION_SELECTED,
      timestamp: 0,
      expansionName: 'exp',
      deckEntries: [7, 8, 9].map(id => ({ id, cardId: 1 })),
      discoverableIds: [9],
      purgeBatchSize: 1,
      purgePermanentCount: 0,
      purgePool: [],
      onStartDiscoverIds: [],
      expansionDiscoveryFirst: true,
    } as ExpansionSelectedEvent;
    const strategy = new ExpansionSelectedStrategy(defs);

    const twoPacks = strategy.apply(makeState({ discoverablePile: [6] }), event);
    expect(twoPacks.discoveryPile).toEqual([7, 8]);
    expect(twoPacks.discoverablePile).toEqual([6, 9]);

    // A game started with a single discovery pile puts every expansion card there.
    const single = strategy.apply(makeState({ discoveryPile: [6] }), event);
    expect(single.discoveryPile).toEqual([7, 8, 9, 6]);
    expect(single.discoverablePile).toBeUndefined();
  });

  it('does not bring back the discoverable cards of an expansion already played', () => {
    // Card 9 came with a first campaign of the expansion: discovered and upgraded, 6 still waits.
    const state = makeState({
      discoverablePile: [6],
      discardPile: [9],
      instances: { ...instances([6]), 9: makeInstance({ id: 9, cardId: 1, stateId: 2 }) },
    });
    const event = {
      id: 'x2',
      type: GameEventType.EXPANSION_SELECTED,
      timestamp: 0,
      expansionName: 'second campaign',
      deckEntries: [7, 6, 9].map(id => ({ id, cardId: 1 })),
      discoverableIds: [6, 9],
      purgeBatchSize: 1,
      purgePermanentCount: 0,
      purgePool: [],
      onStartDiscoverIds: [],
    } as ExpansionSelectedEvent;

    const result = new ExpansionSelectedStrategy(defs).apply(state, event);

    expect(result.discoveryPile).toEqual([7]);
    expect(result.discoverablePile).toEqual([6]);
    expect(result.discardPile).toEqual([9]);
    expect(result.instances[9].stateId).toBe(2);
    expect(result.instances[7]).toBeDefined();
  });

  it('discovers the start cards of an expansion and purges cards from either pile', () => {
    const state = makeState({
      discoveryPile: [7],
      discoverablePile: [8, 9],
      instances: instances([7, 8, 9]),
    });

    const result = new PurgeFinalizedStrategy(defs).apply(state, {
      id: 'p',
      type: GameEventType.PURGE_FINALIZED,
      timestamp: 0,
      purgedIds: [9],
      glory: 0,
      onStartDiscoverIds: [7, 8],
    } as PurgeFinalizedEvent);

    expect(result.discoveryPile).toEqual([]);
    expect(result.discoverablePile).toEqual([]);
    expect(result.lastAddedCards).toEqual([7, 8]);
  });
});
