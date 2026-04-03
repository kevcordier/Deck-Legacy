import { describe, it, expect } from 'vitest';
import { DiscoverCardStrategy } from '@engine/application/cardAction/DiscoverCardStrategy';
import { ActionType, Trigger } from '@engine/domain/enums';
import type { CardDef, CardInstance, GameState } from '@engine/domain/types';

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

const makePayload = (instanceId: number, cardDefs: Record<number, CardDef>) => ({
  id: `${instanceId}-1`,
  type: ActionType.DISCOVER_CARD,
  sourceInstanceId: 0,
  instanceId,
  cardDefs,
});

// — DiscoverCardStrategy —

describe('DiscoverCardStrategy', () => {
  const strategy = new DiscoverCardStrategy();

  it('moves a non-permanent card to the discard pile', () => {
    const instance = makeInstance(5, 10, 1);
    const gs = makeGameState({
      instances: { 5: instance },
      discoveryPile: [5],
    });
    const defs: Record<number, CardDef> = {
      10: { id: 10, name: 'Card 10', states: [{ id: 1, name: 'State 1' }] },
    };
    const result = strategy.applyEffect(gs, makePayload(5, defs));
    expect(result.discardPile).toContain(5);
    expect(result.discoveryPile).not.toContain(5);
  });

  it('adds a permanent card to the permanents pile, not discard', () => {
    const instance = makeInstance(5, 10, 1);
    const gs = makeGameState({
      instances: { 5: instance },
      discoveryPile: [5],
    });
    const defs: Record<number, CardDef> = {
      10: { id: 10, name: 'Card 10', permanent: true, states: [{ id: 1, name: 'State 1' }] },
    };
    const result = strategy.applyEffect(gs, makePayload(5, defs));
    expect(result.permanents).toContain(5);
    expect(result.discardPile).not.toContain(5);
  });

  it('does not mutate the original game state', () => {
    const instance = makeInstance(5, 10, 1);
    const gs = makeGameState({
      instances: { 5: instance },
      discoveryPile: [5],
    });
    const defs: Record<number, CardDef> = {
      10: { id: 10, name: 'Card 10', states: [{ id: 1, name: 'State 1' }] },
    };
    strategy.applyEffect(gs, makePayload(5, defs));
    expect(gs.discoveryPile).toContain(5);
    expect(gs.discardPile).not.toContain(5);
  });

  it('adds ON_DISCOVER trigger effects to the triggerPile', () => {
    const instance = makeInstance(5, 10, 1);
    const onDiscoverEffect = {
      label: 'Test trigger',
      actions: [{ id: 1, type: ActionType.ADD_RESOURCES }],
      trigger: Trigger.ON_DISCOVER,
      optional: false,
    };
    const gs = makeGameState({
      instances: { 5: instance },
      discoveryPile: [5],
    });
    const defs: Record<number, CardDef> = {
      10: {
        id: 10,
        name: 'Card 10',
        states: [{ id: 1, name: 'State 1', cardEffects: [onDiscoverEffect] }],
      },
    };
    const result = strategy.applyEffect(gs, makePayload(5, defs));
    expect(Object.keys(result.triggerPile)).toHaveLength(1);
  });

  it('does not add to triggerPile when there are no ON_DISCOVER effects', () => {
    const instance = makeInstance(5, 10, 1);
    const gs = makeGameState({
      instances: { 5: instance },
      discoveryPile: [5],
    });
    const defs: Record<number, CardDef> = {
      10: { id: 10, name: 'Card 10', states: [{ id: 1, name: 'State 1', cardEffects: [] }] },
    };
    const result = strategy.applyEffect(gs, makePayload(5, defs));
    expect(Object.keys(result.triggerPile)).toHaveLength(0);
  });
});
