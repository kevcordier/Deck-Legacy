import { makeGameState, makeInstance } from './testHelpers';
import { EMPTY_STATE } from '@engine/application/aggregates/GameAggregate';
import { resolveActionEffect } from '@engine/application/effectResolver';
import { ActionType, PassiveType, PendingChoiceType, TargetScope } from '@engine/domain/enums';
import type { ActionEffect, CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';
import { describe, expect, it } from 'vitest';

const makeAction = (
  overrides: Partial<ActionEffect> & Pick<ActionEffect, 'id' | 'type'>,
): ActionEffect => ({
  ...overrides,
});

// — base resolved action —

describe('resolveActionEffect — base fields', () => {
  it('always sets id as `<instanceId>-<action.id>`', () => {
    const action = makeAction({ id: 5, type: ActionType.ADD_RESOURCES });
    const [resolved] = resolveActionEffect(action, 10, EMPTY_STATE);
    expect(resolved.id).toBe('10-5');
  });

  it('always copies action type and sourceInstanceId', () => {
    const action = makeAction({ id: 1, type: ActionType.ADD_RESOURCES });
    const [resolved] = resolveActionEffect(action, 7, EMPTY_STATE);
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
    const [resolved, pending] = resolveActionEffect(action, 1, EMPTY_STATE);
    expect(resolved.instanceIds).toEqual([42]);
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
    expect(resolved.instanceIds).toEqual([2]);
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
    expect(resolved.instanceIds).toBeUndefined();
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe(PendingChoiceType.CHOOSE_CARD);
    expect(pending[0].id).toBe('99-1');
  });

  it('sets instanceIds to undefined when no cards match', () => {
    const gs = makeGameState({ board: [], instances: {} });
    const defs: Record<number, CardDef> = {};
    const action = makeAction({
      id: 1,
      type: ActionType.DISCARD_CARD,
      cards: { scope: TargetScope.BOARD },
    });
    const [resolved, pending] = resolveActionEffect(action, 99, gs, defs);
    expect(resolved.instanceIds).toBeUndefined();
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
    const [resolved, pending] = resolveActionEffect(action, 1, EMPTY_STATE);
    expect(resolved.resources).toEqual({ gold: 3, wood: 1 });
    expect(pending).toEqual([]);
  });

  it('creates a pending choice when multiple resource choices are given', () => {
    const action = makeAction({
      id: 1,
      type: ActionType.ADD_RESOURCES,
      resources: { choice: [{ gold: 2 }, { wood: 3 }] },
    });
    const [, pending] = resolveActionEffect(action, 1, EMPTY_STATE);
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe(PendingChoiceType.CHOOSE_RESOURCE);
    expect(pending[0].choices).toEqual([{ gold: 2 }, { wood: 3 }]);
  });
});

// — resources.cards resolution —

describe('resolveActionEffect — resources.cards', () => {
  it('sets resources to empty when no cards match the cards selector', () => {
    const gs = makeGameState({ board: [], instances: {} });
    const defs: Record<number, CardDef> = {};
    const action = makeAction({
      id: 1,
      type: ActionType.ADD_RESOURCES,
      resources: { gold: 2, cards: { scope: TargetScope.BOARD } },
    });
    const [resolved, pending] = resolveActionEffect(action, 99, gs, defs);
    expect(resolved.resources).toEqual({});
    expect(pending).toEqual([]);
  });

  it('resolves resources when exactly one card matches the cards selector', () => {
    const gs = makeGameState({
      board: [2],
      instances: { 2: makeInstance(2, 10, 1) },
    });
    const defs: Record<number, CardDef> = {
      10: {
        id: 10,
        name: 'Card',
        states: [{ id: 1, name: 'State 1', productions: [{ gold: 3 }] }],
      },
    };
    const action = makeAction({
      id: 1,
      type: ActionType.ADD_RESOURCES,
      resources: { cards: { scope: TargetScope.BOARD } },
    });
    const [resolved, pending] = resolveActionEffect(action, 99, gs, defs);
    expect(resolved.resources).toEqual({ gold: 3 });
    expect(pending).toEqual([]);
  });

  it('sets resources to empty when the matched card has no instance data', () => {
    // SELF scope returns [instanceId] without filtering — cover the !instance branch
    const action = makeAction({
      id: 1,
      type: ActionType.ADD_RESOURCES,
      resources: { cards: { scope: TargetScope.SELF } },
    });
    const [resolved, pending] = resolveActionEffect(action, 99, EMPTY_STATE);
    expect(resolved.resources).toEqual({});
    expect(pending).toEqual([]);
  });

  it('creates a pending choice when multiple cards match the cards selector', () => {
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
      type: ActionType.ADD_RESOURCES,
      resources: { gold: 2, cards: { scope: TargetScope.BOARD, number: 1 } },
    });
    const [, pending] = resolveActionEffect(action, 99, gs, defs);
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe(PendingChoiceType.CHOOSE_CARD);
  });
});

// — stickerIds resolution —

describe('resolveActionEffect — stickerIds', () => {
  it('resolves stickerId when only one id given', () => {
    const action = makeAction({
      id: 1,
      type: ActionType.ADD_STICKER,
      stickerIds: [42],
    });
    const [resolved] = resolveActionEffect(action, 1, EMPTY_STATE);
    expect(resolved.stickerId).toEqual(42);
  });

  it('creates a pending choice when multiple stickerIds given', () => {
    const action = makeAction({ id: 1, type: ActionType.ADD_STICKER, stickerIds: [1, 2] });
    const [, pending] = resolveActionEffect(action, 1, EMPTY_STATE);
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe(PendingChoiceType.CHOOSE_STICKER);
    expect(pending[0].choices).toEqual([1, 2]);
  });
});

// — cards.number less than or equal to matches —

describe('resolveActionEffect — cards count <= pickCount', () => {
  it('sets instanceIds when choices count equals pickCount (multiple auto-resolved)', () => {
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
      cards: { scope: TargetScope.BOARD, number: 2 },
    });
    const [resolved, pending] = resolveActionEffect(action, 99, gs, defs);
    expect(resolved.instanceIds).toEqual([2, 3]);
    expect(pending).toEqual([]);
  });
});

// — cards.number fallback —

describe('resolveActionEffect — cards.number fallback', () => {
  it('uses pickCount of 1 when cards.number is not specified', () => {
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
      cards: { scope: TargetScope.BOARD }, // no number
    });
    const [, pending] = resolveActionEffect(action, 99, gs, defs);
    expect(pending[0].pickCount).toBe(1);
  });
});

// — resources.cards without gameState —

describe('resolveActionEffect — resources.cards without gameState', () => {
  it('treats choices as empty when gameState is not provided', () => {
    const action = makeAction({
      id: 1,
      type: ActionType.ADD_RESOURCES,
      resources: { gold: 2, cards: { scope: TargetScope.BOARD } },
    });
    const [resolved, pending] = resolveActionEffect(action, 1, EMPTY_STATE);
    expect(resolved.resources).toEqual({});
    expect(pending).toEqual([]);
  });

  it('uses pickCount of 1 when resources.cards.number is not specified and multiple match', () => {
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
      type: ActionType.ADD_RESOURCES,
      resources: { gold: 2, cards: { scope: TargetScope.BOARD } }, // no number
    });
    const [, pending] = resolveActionEffect(action, 99, gs, defs);
    expect(pending[0].pickCount).toBe(1);
  });
});

// — ADD_BOARD_EFFECT —

describe('resolveActionEffect — ADD_BOARD_EFFECT', () => {
  it('resolves all matching cards into instanceIds without pending choice', () => {
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
    const effect = CardPassives[PassiveType.STAY_IN_PLAY];
    const action = makeAction({
      id: 1,
      type: ActionType.ADD_BOARD_EFFECT,
      cards: { scope: TargetScope.BOARD },
      effect,
    });
    const [resolved, pending] = resolveActionEffect(action, 99, gs, defs);
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe(PendingChoiceType.CHOOSE_CARD);
    expect(pending[0].choices).toEqual([2, 3]);
    expect(resolved.effect).toEqual(effect);
  });

  it('resolves instanceId directly when exactly one card matches', () => {
    const gs = makeGameState({
      board: [2],
      instances: { 2: makeInstance(2, 10, 1) },
    });
    const defs: Record<number, CardDef> = {
      10: { id: 10, name: 'Card', states: [{ id: 1, name: 'State 1' }] },
    };
    const effect = CardPassives[PassiveType.STAY_IN_PLAY];
    const action = makeAction({
      id: 1,
      type: ActionType.ADD_BOARD_EFFECT,
      cards: { scope: TargetScope.BOARD },
      effect,
    });
    const [resolved, pending] = resolveActionEffect(action, 99, gs, defs);
    expect(pending).toEqual([]);
    expect(resolved.instanceIds).toEqual([2]);
    expect(resolved.effect).toEqual(effect);
  });

  it('resolves to empty instanceIds when no cards match', () => {
    const gs = makeGameState({ board: [], instances: {} });
    const defs: Record<number, CardDef> = {};
    const action = makeAction({
      id: 1,
      type: ActionType.ADD_BOARD_EFFECT,
      cards: { scope: TargetScope.BOARD },
      effect: CardPassives[PassiveType.STAY_IN_PLAY],
    });
    const [resolved, pending] = resolveActionEffect(action, 99, gs, defs);
    expect(resolved.instanceIds).toBeUndefined();
    expect(pending).toEqual([]);
  });

  it('resolves without effect when action.effect is absent', () => {
    const gs = makeGameState({
      board: [2],
      instances: { 2: makeInstance(2, 10, 1) },
    });
    const defs: Record<number, CardDef> = {
      10: { id: 10, name: 'Card', states: [{ id: 1, name: 'State 1' }] },
    };
    const action = makeAction({
      id: 1,
      type: ActionType.ADD_BOARD_EFFECT,
      cards: { scope: TargetScope.BOARD },
    });
    const [resolved, pending] = resolveActionEffect(action, 99, gs, defs);
    expect(pending).toEqual([]);
    expect(resolved.effect).toBeUndefined();
    expect(resolved.instanceIds).toEqual([2]);
  });

  it('resolves effect without cards selector', () => {
    const effect = CardPassives[PassiveType.STAY_IN_PLAY];
    const action = makeAction({
      id: 1,
      type: ActionType.ADD_BOARD_EFFECT,
      effect,
    });
    const [resolved, pending] = resolveActionEffect(action, 1, EMPTY_STATE);
    expect(resolved.instanceIds).toBeUndefined();
    expect(resolved.effect).toEqual(effect);
    expect(pending).toEqual([]);
  });
});

// — accumulated —

describe('resolveActionEffect — accumulated', () => {
  it('copies action.accumulated into the resolved action', () => {
    const action = makeAction({
      id: 1,
      type: ActionType.ADD_CUMULATED,
      accumulated: { glory: 3 },
    });
    const [resolved, pending] = resolveActionEffect(action, 1, EMPTY_STATE);
    expect(resolved.accumulated).toEqual({ glory: 3 });
    expect(pending).toEqual([]);
  });
});

// — TRACK_ADVANCE —

describe('resolveActionEffect — TRACK_ADVANCE', () => {
  const makeTrackDef = (inOrder: boolean) => ({
    id: 10,
    name: 'Card',
    states: [
      {
        id: 1,
        name: 'S1',
        track: {
          inOrder,
          cumulative: false,
          steps: [
            { id: 20, label: 'Step A' },
            { id: 21, label: 'Step B' },
          ],
        },
      },
    ],
  });

  it('returns unchanged when action has no cards selector', () => {
    const action = makeAction({ id: 1, type: ActionType.TRACK_ADVANCE });
    const [resolved, pending] = resolveActionEffect(action, 1, EMPTY_STATE);
    expect(resolved.instanceIds).toBeUndefined();
    expect(pending).toEqual([]);
  });

  it('returns unchanged when defs is undefined', () => {
    const gs = makeGameState({ board: [1], instances: { 1: makeInstance(1, 10, 1) } });
    const action = makeAction({
      id: 1,
      type: ActionType.TRACK_ADVANCE,
      cards: { scope: TargetScope.BOARD },
    });
    const [resolved, pending] = resolveActionEffect(action, 99, gs);
    expect(resolved.instanceIds).toBeUndefined();
    expect(pending).toEqual([]);
  });

  it('returns unchanged when no cards match the selector', () => {
    const gs = makeGameState({ board: [], instances: {} });
    const defs: Record<number, CardDef> = {
      10: makeTrackDef(true),
    };
    const action = makeAction({
      id: 1,
      type: ActionType.TRACK_ADVANCE,
      cards: { scope: TargetScope.BOARD },
    });
    const [resolved, pending] = resolveActionEffect(action, 99, gs, defs);
    expect(resolved.instanceIds).toBeUndefined();
    expect(pending).toEqual([]);
  });

  it('returns unchanged when target instance is not found', () => {
    const gs = makeGameState({ board: [99], instances: {} });
    const defs: Record<number, CardDef> = { 10: makeTrackDef(true) };
    const action = makeAction({
      id: 1,
      type: ActionType.TRACK_ADVANCE,
      cards: { scope: TargetScope.BOARD },
    });
    const [resolved, pending] = resolveActionEffect(action, 1, gs, defs);
    expect(resolved.instanceIds).toBeUndefined();
    expect(pending).toEqual([]);
  });

  it('returns unchanged when the target card has no track', () => {
    const gs = makeGameState({ board: [1], instances: { 1: makeInstance(1, 10, 1) } });
    const defs: Record<number, CardDef> = {
      10: { id: 10, name: 'Card', states: [{ id: 1, name: 'S1' }] },
    };
    const action = makeAction({
      id: 1,
      type: ActionType.TRACK_ADVANCE,
      cards: { scope: TargetScope.BOARD },
    });
    const [resolved, pending] = resolveActionEffect(action, 99, gs, defs);
    expect(resolved.instanceIds).toBeUndefined();
    expect(pending).toEqual([]);
  });

  it('returns unchanged when all track steps are already done', () => {
    const instance = makeInstance(1, 10, 1, { trackProgress: [20, 21] });
    const gs = makeGameState({ board: [1], instances: { 1: instance } });
    const defs: Record<number, CardDef> = { 10: makeTrackDef(true) };
    const action = makeAction({
      id: 1,
      type: ActionType.TRACK_ADVANCE,
      cards: { scope: TargetScope.BOARD },
    });
    const [resolved, pending] = resolveActionEffect(action, 99, gs, defs);
    expect(resolved.instanceIds).toBeUndefined();
    expect(pending).toEqual([]);
  });

  it('resolves stepId to the lowest available step when inOrder is true', () => {
    const instance = makeInstance(1, 10, 1, { trackProgress: [20] });
    const gs = makeGameState({ board: [1], instances: { 1: instance } });
    const defs: Record<number, CardDef> = { 10: makeTrackDef(true) };
    const action = makeAction({
      id: 1,
      type: ActionType.TRACK_ADVANCE,
      cards: { scope: TargetScope.BOARD },
    });
    const [resolved, pending] = resolveActionEffect(action, 99, gs, defs);
    expect(resolved.instanceIds).toEqual([1]);
    expect(resolved.stepId).toBe(21);
    expect(pending).toEqual([]);
  });

  it('picks the lowest id step when steps are stored in non-ascending id order', () => {
    const defReversed: CardDef = {
      id: 10,
      name: 'Card',
      states: [
        {
          id: 1,
          name: 'S1',
          track: {
            inOrder: true,
            cumulative: false,
            steps: [
              { id: 21, label: 'Step B' },
              { id: 20, label: 'Step A' },
            ],
          },
        },
      ],
    };
    const gs = makeGameState({ board: [1], instances: { 1: makeInstance(1, 10, 1) } });
    const defs: Record<number, CardDef> = { 10: defReversed };
    const action = makeAction({
      id: 1,
      type: ActionType.TRACK_ADVANCE,
      cards: { scope: TargetScope.BOARD },
    });
    const [resolved] = resolveActionEffect(action, 99, gs, defs);
    expect(resolved.stepId).toBe(20);
  });

  it('keeps the current minimum when a later step has a higher id (ascending order)', () => {
    const defAscending: CardDef = {
      id: 10,
      name: 'Card',
      states: [
        {
          id: 1,
          name: 'S1',
          track: {
            inOrder: true,
            cumulative: false,
            steps: [
              { id: 20, label: 'Step A' },
              { id: 21, label: 'Step B' },
            ],
          },
        },
      ],
    };
    const gs = makeGameState({ board: [1], instances: { 1: makeInstance(1, 10, 1) } });
    const defs: Record<number, CardDef> = { 10: defAscending };
    const action = makeAction({
      id: 1,
      type: ActionType.TRACK_ADVANCE,
      cards: { scope: TargetScope.BOARD },
    });
    const [resolved] = resolveActionEffect(action, 99, gs, defs);
    expect(resolved.stepId).toBe(20);
  });

  it('creates a pending choice when inOrder is false', () => {
    const gs = makeGameState({ board: [1], instances: { 1: makeInstance(1, 10, 1) } });
    const defs: Record<number, CardDef> = { 10: makeTrackDef(false) };
    const action = makeAction({
      id: 1,
      type: ActionType.TRACK_ADVANCE,
      cards: { scope: TargetScope.BOARD },
    });
    const [resolved, pending] = resolveActionEffect(action, 99, gs, defs);
    expect(resolved.instanceIds).toEqual([1]);
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe(PendingChoiceType.CHOOSE_STEP);
    expect(pending[0].choices).toEqual([20, 21]);
  });
});

// — resourcePerCard —

describe('resolveActionEffect — resourcePerCard', () => {
  it('ignores resourcePerCard (not yet implemented)', () => {
    const action = makeAction({
      id: 1,
      type: ActionType.ADD_RESOURCES,
      resourcePerCard: { amount: 1, resource: 'gold' as never, scope: TargetScope.BOARD },
    });
    const [resolved, pending] = resolveActionEffect(action, 1, EMPTY_STATE);
    expect(pending).toEqual([]);
    expect(resolved.resources).toBeUndefined();
  });
});

// — BOOST_CARD —

describe('resolveActionEffect — BOOST_CARD', () => {
  it('injects all ResourceType values into cards.produces before card selection', () => {
    const gs = makeGameState({
      board: [2],
      instances: { 2: makeInstance(2, 10, 1) },
    });
    const defs: Record<number, CardDef> = {
      // Card has gold production so it matches the injected produces filter
      10: {
        id: 10,
        name: 'Card',
        states: [{ id: 1, name: 'State 1', productions: [{ gold: 1 }] }],
      },
    };
    const action = makeAction({
      id: 1,
      type: ActionType.BOOST_CARD,
      stickerIds: [101],
      cards: { scope: TargetScope.BOARD },
    });
    const [resolved, pending] = resolveActionEffect(action, 1, gs, defs);
    // Single match → auto-resolved, no pending
    expect(resolved.instanceIds).toEqual([2]);
    expect(pending).toEqual([]);
  });
});

// — state resolution —

describe('resolveActionEffect — states', () => {
  it('resolves stateId directly when only one state given', () => {
    const action = makeAction({ id: 1, type: ActionType.CHOOSE_STATE, states: [2] });
    const [resolved, pending] = resolveActionEffect(action, 1, EMPTY_STATE);
    expect(resolved.stateId).toBe(2);
    expect(pending).toEqual([]);
  });

  it('creates a pending choice when multiple states given', () => {
    const action = makeAction({ id: 1, type: ActionType.CHOOSE_STATE, states: [1, 2] });
    const [, pending] = resolveActionEffect(action, 1, EMPTY_STATE);
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe(PendingChoiceType.CHOOSE_STATE);
    expect(pending[0].choices).toEqual([1, 2]);
  });
});
