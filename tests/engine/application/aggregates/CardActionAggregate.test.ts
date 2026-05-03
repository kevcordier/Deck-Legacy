import { makeInstance, makeState } from '../fixtures';
import { CardActionAggregate } from '@engine/application/aggregates/CardActionAggregate';
import { ChooseActionEffectStrategy } from '@engine/application/playerChoice/ChooseActionEffectStrategy';
import { ActionEffectType, PendingChoiceType, TargetScope } from '@engine/domain/enums';
import type {
  CardAction,
  CardDef,
  PendingChoice,
  ResolvedActionEffect,
} from '@engine/domain/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── minimal card definitions ─────────────────────────────────────────────────

const plainDef: CardDef = { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] };
const permanentDef: CardDef = { id: 2, name: 'P', states: [{ id: 1, name: 'S', permanent: true }] };
const parchmentDef: CardDef = {
  id: 3,
  name: 'Q',
  parchmentCard: true,
  states: [{ id: 1, name: 'S' }],
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeAddGoldAction(id = 'a1'): CardAction {
  return {
    id,
    actionEffects: [{ id: 0, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } }],
  };
}

/**
 * A CHOOSE_EFFECT action that creates a CHOOSE_ACTION_EFFECT pending choice.
 * Requires only 1 card on the board — the simplest way to reach a pending state.
 */
function makeChooseEffectAction(): CardAction {
  return {
    id: 'choose',
    actionEffects: [
      {
        id: 0,
        type: ActionEffectType.CHOOSE_EFFECT,
        effects: [
          { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } },
          { id: 2, type: ActionEffectType.ADD_RESOURCES, resources: { wood: 1 } },
        ],
      },
    ],
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

/**
 * Spies on ChooseActionEffectStrategy.prototype.apply to return the given resolved
 * action and pending choices. The real constructor is preserved — only the method
 * is intercepted, avoiding constructor-mock pitfalls.
 */
function mockStrategyApply(
  resolvedAction: ResolvedActionEffect,
  pendingChoices: PendingChoice[] = [],
) {
  vi.spyOn(ChooseActionEffectStrategy.prototype, 'apply').mockReturnValue([
    resolvedAction,
    pendingChoices,
  ]);
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

  it('throws when card cannot afford resources', () => {
    const action: CardAction = {
      id: 'a1',
      actionEffects: [{ id: 0, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } }],
      cost: { resources: [{ gold: 5 }] },
    };
    const agg = makeAggregate({ action, resources: {} });
    expect(() => agg.resolveAction()).toThrow('Not enough resources to pay this cost.');
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
      cost: { discard: [{ scope: [TargetScope.BOARD], pickNumber: 1 }] },
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

  it('throws when cost cannot be paid', () => {
    const action: CardAction = {
      id: 'a1',
      actionEffects: [],
      cost: { destroy: { scope: [TargetScope.BOARD], pickNumber: 2 } },
    };
    const gs = makeState({
      board: [1],
      instances: { 1: makeInstance({ id: 1, cardId: 1, stateId: 1 }) },
    });
    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, gs.instances[1], action);
    expect(() => agg.resolveAction()).toThrow(
      'Not enough cards available to pay this destroy cost.',
    );
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

  it('pays upgrade cost when UPGRADE_CARD has payingCost set', () => {
    const sourceDef: CardDef = {
      id: 1,
      name: 'PriestLike',
      states: [{ id: 1, name: 'S' }],
    };
    const targetDef: CardDef = {
      id: 2,
      name: 'Upgradeable',
      states: [
        {
          id: 1,
          name: 'Base',
          upgrade: [{ cost: { resources: [{ gold: 2 }] }, upgradeTo: 2 }],
        },
        { id: 2, name: 'Upgraded' },
      ],
    };

    const sourceInst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const targetInst = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const gs = makeState({
      board: [1, 2],
      resources: { gold: 2 },
      instances: { 1: sourceInst, 2: targetInst },
    });

    const action: CardAction = {
      id: 'paying-upgrade',
      actionEffects: [
        {
          id: 1,
          type: ActionEffectType.UPGRADE_CARD,
          payingCost: true,
          cards: { ids: [2] },
          states: [2],
        },
      ],
    };

    const agg = new CardActionAggregate({ 1: sourceDef, 2: targetDef }, {}, gs, sourceInst, action);
    agg.resolveAction();

    expect(agg.getGameState().instances[2].stateId).toBe(2);
    expect(agg.getGameState().resources.gold ?? 0).toBe(0);
  });
});

// ─── resolvePlayerChoice ──────────────────────────────────────────────────────

describe('CardActionAggregate.resolvePlayerChoice', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('is a no-op when no pending choices', () => {
    const agg = makeAggregate();
    agg.resolveAction();
    const gsBefore = agg.getGameState();
    agg.resolvePlayerChoice({ id: 'x', type: ActionEffectType.ADD_RESOURCES, sourceInstanceId: 1 });
    expect(agg.getGameState()).toBe(gsBefore);
  });

  it('resolves pending choice and continues', () => {
    // Mock the strategy to return a resolved ADD_RESOURCES effect with no more choices.
    const resolved: ResolvedActionEffect = {
      id: '0',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 1,
      resources: { gold: 5 },
    };
    mockStrategyApply(resolved, []);

    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, inst, makeChooseEffectAction());
    agg.resolveAction();
    expect(agg.getPendingChoices()).toHaveLength(1);

    agg.resolvePlayerChoice({
      id: 'x',
      type: ActionEffectType.CHOOSE_EFFECT,
      sourceInstanceId: 1,
    });
    expect(agg.getPendingChoices()).toHaveLength(0);
    expect(agg.getGameState().resources.gold).toBe(5);
  });

  it('returns without finalizing when more choices remain after resolvePlayerChoice', () => {
    // Mock the strategy to return a still-pending result (another CHOOSE_RESOURCE choice).
    const anotherPending: PendingChoice = {
      id: 'next',
      kind: ActionEffectType.ADD_RESOURCES,
      type: PendingChoiceType.CHOOSE_RESOURCE,
      sourceInstanceId: 1,
      choices: [{ gold: 1 }, { wood: 1 }],
      pickCount: 1,
      isMandatory: true,
    };
    const resolved: ResolvedActionEffect = {
      id: '0',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 1,
    };
    mockStrategyApply(resolved, [anotherPending]);

    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, inst, makeChooseEffectAction());
    agg.resolveAction();
    expect(agg.getPendingChoices()).toHaveLength(1);

    agg.resolvePlayerChoice({
      id: 'x',
      type: ActionEffectType.CHOOSE_EFFECT,
      sourceInstanceId: 1,
    });
    // Strategy returned another pending choice — action is NOT finalized yet.
    expect(agg.getPendingChoices()).toHaveLength(1);
    expect(agg.getGameState().resources.gold).toBeUndefined();
  });

  it('splices newActionEffects and skips apply for CHOOSE_EFFECT type', () => {
    // Mock the strategy to return a CHOOSE_EFFECT resolvedAction with newActionEffects.
    // The aggregate must skip apply() for CHOOSE_EFFECT but still splice the newActionEffects.
    const resolved: ResolvedActionEffect = {
      id: '0',
      type: ActionEffectType.CHOOSE_EFFECT,
      sourceInstanceId: 1,
      newActionEffects: [{ id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 5 } }],
    };
    mockStrategyApply(resolved, []);

    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, inst, makeChooseEffectAction());
    agg.resolveAction();
    expect(agg.getPendingChoices()).toHaveLength(1);

    agg.resolvePlayerChoice({
      id: 'x',
      type: ActionEffectType.CHOOSE_EFFECT,
      sourceInstanceId: 1,
    });
    expect(agg.getPendingChoices()).toHaveLength(0);
    // newActionEffects were spliced in and applied (ADD_RESOURCES gold: 5).
    expect(agg.getGameState().resources.gold).toBe(5);
  });
});

// ─── resolveCostChoice ────────────────────────────────────────────────────────

describe('CardActionAggregate.resolveCostChoice', () => {
  it('applies cost choice and continues with effects', () => {
    // A resource cost with multiple options creates a CHOOSE_RESOURCE cost pending choice.
    // Only 1 card needed on board — the cost is resource-based, not card-based.
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [1],
      resources: { gold: 5, wood: 1 },
      instances: { 1: inst },
    });
    const action: CardAction = {
      id: 'a1',
      actionEffects: [{ id: 0, type: ActionEffectType.ADD_RESOURCES, resources: { wood: 1 } }],
      cost: { resources: [{ gold: 1 }, { wood: 1 }] },
    };
    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, inst, action);
    agg.resolveAction();
    expect(agg.getPendingChoices()).toHaveLength(1);

    agg.resolveCostChoice({ resources: { gold: 1 }, discardedCardIds: [], destroyedCardIds: [] });
    expect(agg.getPendingChoices()).toHaveLength(0);
    expect(agg.getGameState().resources.gold).toBe(4);
    expect(agg.getGameState().resources.wood).toBe(2);
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
