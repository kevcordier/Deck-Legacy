import { makeInstance, makeState } from '../fixtures';
import { CardActionAggregate } from '@engine/application/aggregates/CardActionAggregate';
import { ActionEffectType, TargetScope } from '@engine/domain/enums';
import type { CardAction, CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const plainDef: CardDef = { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] };
const permanentDef: CardDef = { id: 2, name: 'P', permanent: true, states: [{ id: 1, name: 'S' }] };
const parchmentDef: CardDef = {
  id: 3,
  name: 'Q',
  parchmentCard: true,
  states: [{ id: 1, name: 'S' }],
};

function makeAddGoldAction(id = 'a1'): CardAction {
  return {
    id,
    actionEffects: [{ id: 0, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } }],
  };
}

function makeAggregate(overrides?: {
  cardId?: number;
  defs?: Record<number, CardDef>;
  action?: CardAction;
  triggerId?: string;
  resources?: Record<string, number>;
  boardCards?: number[];
}) {
  const cardId = overrides?.cardId ?? 1;
  const defs = overrides?.defs ?? { 1: plainDef };
  const action = overrides?.action ?? makeAddGoldAction();
  const inst = makeInstance({ id: 1, cardId, stateId: 1 });
  const gs = makeState({
    board: overrides?.boardCards ?? [1],
    resources: overrides?.resources ?? {},
    instances: { 1: inst },
  });
  return new CardActionAggregate(defs, {}, gs, inst, action, overrides?.triggerId);
}

// ─── resolveAction ────────────────────────────────────────────────────────────

describe('CardActionAggregate.resolveAction', () => {
  it('applies effect and discards non-permanent card', () => {
    const agg = makeAggregate();
    agg.resolveAction();
    const gs = agg.getGameState();
    expect(gs.resources.gold).toBe(1);
    expect(gs.discardPile).toContain(1);
  });

  it('does not discard permanent cards', () => {
    const agg = makeAggregate({ cardId: 2, defs: { 2: permanentDef } });
    agg.resolveAction();
    const gs = agg.getGameState();
    expect(gs.discardPile).not.toContain(1);
  });

  it('skips when card cannot afford resources', () => {
    const action: CardAction = {
      id: 'a1',
      actionEffects: [{ id: 0, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } }],
      cost: { resources: [{ gold: 5 }] },
    };
    const agg = makeAggregate({ action, resources: {} });
    agg.resolveAction();
    expect(agg.getGameState().resources.gold).toBeUndefined();
  });

  it('skips when card is blocked', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [1],
      instances: { 1: inst },
      boardEffects: { 2: [{ id: 'b', type: 'BLOCK' as never, cards: { ids: [1] } }] },
    });
    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, inst, makeAddGoldAction());
    agg.resolveAction();
    expect(agg.getGameState().resources.gold).toBeUndefined();
  });

  it('produces pending choices when cost requires card choice', () => {
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [1, 2, 3],
      instances: { 1: makeInstance({ id: 1, cardId: 1, stateId: 1 }), 2: inst2, 3: inst3 },
    });
    const action: CardAction = {
      id: 'a1',
      actionEffects: [],
      cost: { discard: { scope: [TargetScope.BOARD], number: 1 } },
    };
    const inst = gs.instances[1];
    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, inst, action);
    agg.resolveAction();
    expect(agg.getPendingChoices().length).toBeGreaterThan(0);
  });

  it('produces pending choices for effect requiring card selection', () => {
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [1, 2, 3],
      instances: {
        1: makeInstance({ id: 1, cardId: 1, stateId: 1 }),
        2: inst2,
        3: inst3,
      },
    });
    const action: CardAction = {
      id: 'a1',
      actionEffects: [
        {
          id: 0,
          type: ActionEffectType.DISCARD_CARD,
          cards: { scope: [TargetScope.BOARD] },
          pickNumber: 1,
        },
      ],
    };
    const inst = gs.instances[1];
    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, inst, action);
    agg.resolveAction();
    expect(agg.getPendingChoices().length).toBeGreaterThan(0);
  });

  it('removes triggerId from triggerPile after resolution', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [1],
      instances: { 1: inst },
      triggerPile: { tid: { effectDef: makeAddGoldAction(), sourceInstanceId: 1 } },
    });
    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, inst, makeAddGoldAction(), 'tid');
    agg.resolveAction();
    expect(agg.getGameState().triggerPile['tid']).toBeUndefined();
  });

  it('removes parchment card from discoveryPile after resolution', () => {
    const inst = makeInstance({ id: 1, cardId: 3, stateId: 1 });
    const gs = makeState({
      discoveryPile: [1],
      instances: { 1: inst },
    });
    const agg = new CardActionAggregate({ 3: parchmentDef }, {}, gs, inst, makeAddGoldAction());
    agg.resolveAction();
    expect(agg.getGameState().discoveryPile).not.toContain(1);
  });

  it('skips onTime action already used', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, usedActionIds: ['one-time'] });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    const action: CardAction = { id: 'one-time', actionEffects: [], onTime: true };
    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, inst, action);
    agg.resolveAction();
    expect(agg.getGameState().resources.gold).toBeUndefined();
  });

  it('records onTime action in usedActionIds after first use', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, usedActionIds: [] });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    const action: CardAction = { id: 'one-time', actionEffects: [], onTime: true };
    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, inst, action);
    agg.resolveAction();
    expect(agg.getGameState().instances[1].usedActionIds).toContain('one-time');
  });

  it('skips when canAffordCardCost fails (destroy)', () => {
    const action: CardAction = {
      id: 'a1',
      actionEffects: [],
      cost: { destroy: { scope: [TargetScope.BOARD], number: 2 } },
    };
    const gs = makeState({
      board: [1],
      instances: { 1: makeInstance({ id: 1, cardId: 1, stateId: 1 }) },
    });
    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, gs.instances[1], action);
    agg.resolveAction();
    expect(agg.getPendingChoices()).toHaveLength(0);
    expect(agg.getGameState().resources.gold).toBeUndefined();
  });

  it('splices step effects into the queue (newActionEffects from inOrder track)', () => {
    const trackDef: CardDef = {
      id: 4,
      name: 'Tracked',
      states: [
        {
          id: 1,
          name: 'S',
          track: {
            inOrder: true,
            steps: [
              {
                id: 1,
                effects: [{ id: 0, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 5 } }],
              },
            ],
          },
        },
      ],
    };
    const inst = makeInstance({ id: 1, cardId: 4, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    const action: CardAction = {
      id: 'ta',
      actionEffects: [
        { id: 0, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
      ],
    };
    const agg = new CardActionAggregate({ 4: trackDef }, {}, gs, inst, action);
    agg.resolveAction();
    expect(agg.getGameState().resources.gold).toBe(5);
  });
});

// ─── resolvePlayerChoice ──────────────────────────────────────────────────────

describe('CardActionAggregate.resolvePlayerChoice', () => {
  it('is a no-op when no pending choices', () => {
    const agg = makeAggregate();
    agg.resolveAction();
    const gsBefore = agg.getGameState();
    agg.resolvePlayerChoice({ id: 'x', type: ActionEffectType.ADD_RESOURCES, sourceInstanceId: 1 });
    expect(agg.getGameState()).toBe(gsBefore);
  });

  it('resolves pending effect choice and continues', () => {
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [1, 2, 3],
      instances: {
        1: makeInstance({ id: 1, cardId: 1, stateId: 1 }),
        2: inst2,
        3: inst3,
      },
    });
    const action: CardAction = {
      id: 'a1',
      actionEffects: [
        {
          id: 0,
          type: ActionEffectType.DISCARD_CARD,
          cards: { scope: [TargetScope.BOARD] },
          pickNumber: 1,
        },
      ],
    };
    const inst = gs.instances[1];
    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, inst, action);
    agg.resolveAction();
    expect(agg.getPendingChoices()).toHaveLength(1);

    agg.resolvePlayerChoice({
      id: 'x',
      type: ActionEffectType.DISCARD_CARD,
      sourceInstanceId: 1,
      instanceIds: [2],
    });
    expect(agg.getPendingChoices()).toHaveLength(0);
    expect(agg.getGameState().discardPile).toContain(2);
  });

  it('returns without finalizing when more choices remain after resolvePlayerChoice', () => {
    // Card with multiple production options triggers a follow-up CHOOSE_RESOURCE choice.
    // Board has 3 cards: source (id=1) is filtered out by cardSelector, leaving [2, 3].
    // pickNumber=1 with 2 candidates creates a CHOOSE_CARD pending choice.
    // Choosing the multi-production card (id=2) then triggers a CHOOSE_RESOURCE follow-up.
    const multiProdDef: CardDef = {
      id: 2,
      name: 'MultiProd',
      states: [{ id: 1, name: 'S', productions: [{ gold: 1 }, { wood: 1 }] }],
    };
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [1, 2, 3],
      instances: { 1: inst1, 2: inst2, 3: inst3 },
    });
    const action: CardAction = {
      id: 'a1',
      actionEffects: [
        {
          id: 0,
          type: ActionEffectType.ADD_RESOURCES,
          cards: { scope: [TargetScope.BOARD] },
          pickNumber: 1,
        },
      ],
    };
    const agg = new CardActionAggregate({ 1: plainDef, 2: multiProdDef }, {}, gs, inst1, action);
    agg.resolveAction();
    expect(agg.getPendingChoices()).toHaveLength(1);

    // Resolve the card choice — the chosen card has 2 productions, so a follow-up CHOOSE_RESOURCE is created
    agg.resolvePlayerChoice({
      id: 'x',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 1,
      instanceIds: [2],
    });
    // Should still have a pending choice (CHOOSE_RESOURCE), not yet finalized
    expect(agg.getPendingChoices()).toHaveLength(1);
    expect(agg.getGameState().resources.gold).toBeUndefined();
  });

  it('splices newActionEffects and skips apply for CHOOSE_EFFECT type', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    const action: CardAction = {
      id: 'a1',
      actionEffects: [
        {
          id: 0,
          type: ActionEffectType.CHOOSE_EFFECT,
          effects: [
            { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 5 } },
            { id: 2, type: ActionEffectType.ADD_RESOURCES, resources: { wood: 2 } },
          ],
        },
      ],
    };
    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, inst, action);
    agg.resolveAction();
    expect(agg.getPendingChoices()).toHaveLength(1);

    agg.resolvePlayerChoice({
      id: 'x',
      type: ActionEffectType.CHOOSE_EFFECT,
      sourceInstanceId: 1,
      newActionEffects: [{ id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 5 } }],
    });

    expect(agg.getPendingChoices()).toHaveLength(0);
    expect(agg.getGameState().resources.gold).toBe(5);
  });
});

// ─── resolveCostChoice / resolvePayCost ───────────────────────────────────────

describe('CardActionAggregate.resolveCostChoice', () => {
  it('applies cost and continues with effects', () => {
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [1, 2, 3],
      resources: { gold: 5 },
      instances: {
        1: makeInstance({ id: 1, cardId: 1, stateId: 1 }),
        2: inst2,
        3: inst3,
      },
    });
    const action: CardAction = {
      id: 'a1',
      actionEffects: [{ id: 0, type: ActionEffectType.ADD_RESOURCES, resources: { wood: 1 } }],
      cost: { resources: [{ gold: 1 }, { wood: 1 }] },
    };
    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, gs.instances[1], action);
    agg.resolveAction();
    expect(agg.getPendingChoices()).toHaveLength(1);
    agg.resolveCostChoice({ resources: { gold: 1 }, discardedCardIds: [], destroyedCardIds: [] });
    expect(agg.getPendingChoices()).toHaveLength(0);
    expect(agg.getGameState().resources.gold).toBe(4);
    expect(agg.getGameState().resources.wood).toBe(1);
  });
});

// ─── isEndTurn / getters ──────────────────────────────────────────────────────

describe('CardActionAggregate getters', () => {
  it('isEndTurn returns true when action.endsTurn is set', () => {
    const action: CardAction = { id: 'et', actionEffects: [], endsTurn: true };
    const inst = makeInstance({ id: 1 });
    const agg = new CardActionAggregate(
      { 1: plainDef },
      {},
      makeState({ board: [1], instances: { 1: inst } }),
      inst,
      action,
    );
    expect(agg.isEndTurn()).toBe(true);
  });

  it('isEndTurn returns false when endsTurn is not set', () => {
    const agg = makeAggregate();
    expect(agg.isEndTurn()).toBe(false);
  });

  it('getSourceInstanceId returns the instance id', () => {
    const agg = makeAggregate();
    expect(agg.getSourceInstanceId()).toBe(1);
  });

  it('getActionId returns the action id', () => {
    const agg = makeAggregate({ action: makeAddGoldAction('my-action') });
    expect(agg.getActionId()).toBe('my-action');
  });
});
