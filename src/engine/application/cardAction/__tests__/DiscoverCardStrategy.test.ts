import { DiscoverCardStrategy } from '@engine/application/cardAction/DiscoverCardStrategy';
import { ActionType, Trigger } from '@engine/domain/enums';
import type { CardInstance, GameState } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

// — fixtures —

const makeInstance = (id: number, cardId: number, stateId: number): CardInstance => ({
  id,
  cardId,
  stateId,
  stickers: {},
  trackProgress: [],
});

const makeGameState = (overrides: Partial<GameState> = {}): GameState => ({
  instances: {},
  drawPile: [],
  discardPile: [],
  board: [],
  destroyedPile: [],
  permanents: [],
  blockingCards: {},
  resources: {},
  stickerStock: {},
  discoveryPile: [],
  triggerPile: {},
  lastAddedIds: [],
  round: 0,
  turn: 0,
  ...overrides,
});

const makePayload = (instanceId: number) => ({
  id: `${instanceId}-1`,
  type: ActionType.DISCOVER_CARD,
  sourceInstanceId: 0,
  instanceId,
});

// — DiscoverCardStrategy —

describe('DiscoverCardStrategy', () => {
  const onDiscoverEffect = {
    label: 'Test trigger',
    actions: [{ id: 1, type: ActionType.ADD_RESOURCES }],
    trigger: Trigger.ON_DISCOVER,
    optional: false,
  };
  const strategy = new DiscoverCardStrategy({
    5: { id: 5, name: 'Card 5', states: [{ id: 1, name: 'State 1' }] },
    10: { id: 10, name: 'Card 10', states: [{ id: 1, name: 'State 1' }] },
    1: { id: 1, name: 'Card 1', states: [{ id: 1, name: 'State 1' }] },
    11: { id: 11, name: 'Card 11', permanent: true, states: [{ id: 1, name: 'State 1' }] },
    12: {
      id: 12,
      name: 'Card 12',
      states: [{ id: 1, name: 'State 1', cardEffects: [onDiscoverEffect] }],
    },
    14: { id: 14, name: 'Card 14', states: [{ id: 1, name: 'State 1', cardEffects: [] }] },
    15: { id: 15, name: 'Card 15', parchmentCard: true, states: [{ id: 1, name: 'State 1' }] },
  });

  it('moves a non-permanent card to the discard pile', () => {
    const instance = makeInstance(5, 10, 1);
    const gs = makeGameState({
      instances: { 5: instance },
      discoveryPile: [5],
    });
    const result = strategy.applyEffect(gs, makePayload(5));
    expect(result.discardPile).toContain(5);
    expect(result.discoveryPile).not.toContain(5);
  });

  it('adds a permanent card to the permanents pile, not discard', () => {
    const instance = makeInstance(5, 11, 1);
    const gs = makeGameState({
      instances: { 5: instance },
      discoveryPile: [5],
    });
    const result = strategy.applyEffect(gs, makePayload(5));
    expect(result.permanents).toContain(5);
    expect(result.discardPile).not.toContain(5);
  });

  it('does not mutate the original game state', () => {
    const instance = makeInstance(5, 10, 1);
    const gs = makeGameState({
      instances: { 5: instance },
      discoveryPile: [5],
    });
    strategy.applyEffect(gs, makePayload(5));
    expect(gs.discoveryPile).toContain(5);
    expect(gs.discardPile).not.toContain(5);
  });

  it('adds ON_DISCOVER trigger effects to the triggerPile', () => {
    const instance = makeInstance(5, 12, 1);
    const gs = makeGameState({
      instances: { 5: instance },
      discoveryPile: [5],
    });
    const result = strategy.applyEffect(gs, makePayload(5));
    expect(Object.keys(result.triggerPile)).toHaveLength(1);
  });

  it('does not add to triggerPile when there are no ON_DISCOVER effects', () => {
    const instance = makeInstance(5, 14, 1);
    const gs = makeGameState({
      instances: { 5: instance },
      discoveryPile: [5],
    });
    const result = strategy.applyEffect(gs, makePayload(5));
    expect(Object.keys(result.triggerPile)).toHaveLength(0);
  });

  it('does not add a parchment card to lastAddedIds', () => {
    const instance = makeInstance(5, 15, 1);
    const gs = makeGameState({
      instances: { 5: instance },
      discoveryPile: [5],
    });
    const result = strategy.applyEffect(gs, makePayload(5));
    expect(result.lastAddedIds).not.toContain(5);
  });

  it('adds a non-parchment card to lastAddedIds', () => {
    const instance = makeInstance(5, 10, 1);
    const gs = makeGameState({
      instances: { 5: instance },
      discoveryPile: [5],
    });
    const result = strategy.applyEffect(gs, makePayload(5));
    expect(result.lastAddedIds).toContain(5);
  });
});
