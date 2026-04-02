import { describe, it, expect } from 'vitest';
import { resolveActionEffect } from '@engine/application/effectResolver';
import { ActionType, PendingChoiceType, TargetScope } from '@engine/domain/enums';
import type { Action, CardDef, CardInstance, GameState } from '@engine/domain/types';

// — fixtures —

const makeInstance = (id: number, cardId: number, stateId: number): CardInstance => ({
  id,
  cardId,
  stateId,
  stickers: {},
  trackProgress: null,
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

const makeAction = (overrides: Partial<Action> & Pick<Action, 'id' | 'type'>): Action => ({
  ...overrides,
});

// — base resolved action —

describe('resolveActionEffect — base fields', () => {
  it('always sets id as `<instanceId>-<action.id>`', () => {
    const action = makeAction({ id: 5, type: ActionType.ADD_RESOURCES });
    const [resolved] = resolveActionEffect(action, 10);
    expect(resolved.id).toBe('10-5');
  });

  it('always copies action type and sourceInstanceId', () => {
    const action = makeAction({ id: 1, type: ActionType.ADD_RESOURCES });
    const [resolved] = resolveActionEffect(action, 7);
    expect(resolved.type).toBe(ActionType.ADD_RESOURCES);
    expect(resolved.sourceInstanceId).toBe(7);
  });
});

// — card resolution —

describe('resolveActionEffect — card selection', () => {
  it('resolves instanceId directly when ids has exactly one entry', () => {
    const action = makeAction({
      id: 1,
      type: ActionType.DISCARD_CARD,
      cards: { scope: TargetScope.BOARD, ids: [42] },
    });
    const [resolved, pending] = resolveActionEffect(action, 1);
    expect(resolved.instanceId).toBe(42);
    expect(pending).toEqual([]);
  });

  it('resolves instanceId when only one card matches selector', () => {
    const gs = makeGameState({
      board: [2],
      instances: { 2: makeInstance(2, 10, 1) },
    });
    const defs: Record<number, CardDef> = {
      10: { id: 10, name: 'Card', states: [{ id: 1, name: 'State 1' }] },
    };
    const action = makeAction({
      id: 1,
      type: ActionType.DISCARD_CARD,
      cards: { scope: TargetScope.BOARD },
    });
    const [resolved, pending] = resolveActionEffect(action, 99, gs, defs);
    expect(resolved.instanceId).toBe(2);
    expect(pending).toEqual([]);
  });

  it('creates a pending choice when multiple cards match selector', () => {
    const gs = makeGameState({
      board: [2, 3],
      instances: {
        2: makeInstance(2, 10, 1),
        3: makeInstance(3, 10, 1),
      },
    });
    const defs: Record<number, CardDef> = {
      10: { id: 10, name: 'Card', states: [{ id: 1, name: 'State 1' }] },
    };
    const action = makeAction({
      id: 1,
      type: ActionType.DISCARD_CARD,
      cards: { scope: TargetScope.BOARD, number: 1 },
    });
    const [resolved, pending] = resolveActionEffect(action, 99, gs, defs);
    expect(resolved.instanceId).toBeUndefined();
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe(PendingChoiceType.CHOOSE_CARD);
    expect(pending[0].id).toBe('99-1');
  });

  it('sets instanceId to undefined when no cards match', () => {
    const gs = makeGameState({ board: [], instances: {} });
    const defs: Record<number, CardDef> = {};
    const action = makeAction({
      id: 1,
      type: ActionType.DISCARD_CARD,
      cards: { scope: TargetScope.BOARD },
    });
    const [resolved, pending] = resolveActionEffect(action, 99, gs, defs);
    expect(resolved.instanceId).toBeUndefined();
    expect(pending).toEqual([]);
  });
});

// — resource resolution —

describe('resolveActionEffect — resources', () => {
  it('resolves plain resources directly', () => {
    const action = makeAction({
      id: 1,
      type: ActionType.ADD_RESOURCES,
      resources: { gold: 3, wood: 1 },
    });
    const [resolved, pending] = resolveActionEffect(action, 1);
    expect(resolved.resources).toEqual({ gold: 3, wood: 1 });
    expect(pending).toEqual([]);
  });

  it('creates a pending choice when multiple resource choices are given', () => {
    const action = makeAction({
      id: 1,
      type: ActionType.ADD_RESOURCES,
      resources: { choice: [{ gold: 2 }, { wood: 3 }] },
    });
    const [, pending] = resolveActionEffect(action, 1);
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe(PendingChoiceType.CHOOSE_RESOURCE);
    expect(pending[0].choices).toEqual([{ gold: 2 }, { wood: 3 }]);
  });
});

// — stickerId resolution —

describe('resolveActionEffect — stickerId', () => {
  it('resolves numeric stickerId directly', () => {
    const action = makeAction({
      id: 1,
      type: ActionType.ADD_STICKER,
      stickerId: 42,
    });
    const [resolved] = resolveActionEffect(action, 1);
    expect(resolved.stickerId).toBe(42);
  });
});

// — state resolution —

describe('resolveActionEffect — states', () => {
  it('resolves stateId directly when only one state given', () => {
    const action = makeAction({ id: 1, type: ActionType.CHOOSE_STATE, states: [2] });
    const [resolved, pending] = resolveActionEffect(action, 1);
    expect(resolved.stateId).toBe(2);
    expect(pending).toEqual([]);
  });

  it('creates a pending choice when multiple states given', () => {
    const action = makeAction({ id: 1, type: ActionType.CHOOSE_STATE, states: [1, 2] });
    const [, pending] = resolveActionEffect(action, 1);
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe(PendingChoiceType.CHOOSE_STATE);
    expect(pending[0].choices).toEqual([1, 2]);
  });
});
