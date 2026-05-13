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
    expect(() => agg.resolveAction()).toThrow('errors.cost.notEnoughResources');
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

  it('skips limitedTime action already fully used', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, usedActionIds: ['one-time'] });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    const action: CardAction = { id: 'one-time', actionEffects: [], limitedTime: 1 };
    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, inst, action);
    agg.resolveAction();
    expect(agg.getGameState().resources.gold).toBeUndefined();
  });

  it('records limitedTime action in usedActionIds after use', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, usedActionIds: [] });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    const action: CardAction = { id: 'one-time', actionEffects: [], limitedTime: 1 };
    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, inst, action);
    agg.resolveAction();
    expect(agg.getGameState().instances[1].usedActionIds).toContain('one-time');
  });

  it('allows action until limitedTime count is reached', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, usedActionIds: ['limited'] });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    const action: CardAction = {
      id: 'limited',
      actionEffects: [{ id: 0, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } }],
      limitedTime: 2,
    };

    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, inst, action);
    agg.resolveAction();

    expect(agg.getGameState().resources.gold).toBe(1);
    expect(
      agg.getGameState().instances[1].usedActionIds.filter(id => id === 'limited'),
    ).toHaveLength(2);
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
    expect(() => agg.resolveAction()).toThrow('errors.cost.notEnoughCardsToDestroy');
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

  it('pays inOrder track step cost before applying step effects', () => {
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
                cost: { resources: [{ gold: 2 }] },
                effects: [{ id: 0, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 5 } }],
              },
            ],
          },
        },
      ],
    };

    const inst = makeInstance({ id: 1, cardId: 4, stateId: 1 });
    const gs = makeState({
      board: [1],
      resources: { gold: 2 },
      instances: { 1: inst },
    });
    const action: CardAction = {
      id: 'ta',
      actionEffects: [
        { id: 0, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
      ],
    };

    const agg = new CardActionAggregate({ 4: trackDef }, {}, gs, inst, action);
    agg.resolveAction();

    expect(agg.getGameState().resources.gold).toBe(5);
    expect(agg.getGameState().instances[1].trackProgress).toContain(1);
  });

  it('returns early when track advance cost cannot be afforded', () => {
    const trackDef: CardDef = {
      id: 4,
      name: 'Tracked',
      states: [
        {
          id: 1,
          name: 'S',
          track: {
            inOrder: true,
            steps: [{ id: 1, cost: { resources: [{ gold: 1 }] } }],
          },
        },
      ],
    };
    const inst = makeInstance({ id: 1, cardId: 4, stateId: 1 });
    const gs = makeState({ board: [1], resources: {}, instances: { 1: inst } });
    const action: CardAction = {
      id: 'ta',
      actionEffects: [
        { id: 0, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
      ],
    };

    const agg = new CardActionAggregate({ 4: trackDef }, {}, gs, inst, action);
    agg.resolveAction();

    expect(agg.getGameState().instances[1].trackProgress).toEqual([]);
    expect(agg.getGameState().discardPile).toEqual([]);
  });

  it('continues when TRACK_ADVANCE resolves without any target', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], discoveryPile: [], instances: { 1: inst } });
    const action: CardAction = {
      id: 'skip-track',
      actionEffects: [
        { id: 0, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.DISCOVERY] } },
        { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 2 } },
      ],
    };

    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, inst, action);
    agg.resolveAction();

    expect(agg.getGameState().resources.gold).toBe(2);
  });

  it('continues when TRACK_ADVANCE targets a card without track', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    const action: CardAction = {
      id: 'continue-no-track',
      actionEffects: [
        { id: 0, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
        { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } },
      ],
    };

    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, inst, action);
    agg.resolveAction();

    expect(agg.getGameState().resources.gold).toBe(1);
  });

  it('continues when UPGRADE_CARD resolves without target', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], discoveryPile: [], instances: { 1: inst } });
    const action: CardAction = {
      id: 'skip-upgrade',
      actionEffects: [
        {
          id: 0,
          type: ActionEffectType.UPGRADE_CARD,
          payingCost: true,
          cards: { scope: [TargetScope.DISCOVERY] },
        },
        { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { wood: 2 } },
      ],
    };

    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, inst, action);
    agg.resolveAction();

    expect(agg.getGameState().resources.wood).toBe(2);
  });

  it('pays upgrade cost immediately when there is no pending cost choice', () => {
    const upgradableDef: CardDef = {
      id: 5,
      name: 'Upg',
      states: [
        { id: 1, name: 'S1', upgrade: [{ cost: { resources: [{ gold: 1 }] }, upgradeTo: 2 }] },
        { id: 2, name: 'S2' },
      ],
    };
    const inst = makeInstance({ id: 1, cardId: 5, stateId: 1 });
    const gs = makeState({ board: [1], resources: { gold: 2 }, instances: { 1: inst } });
    const action: CardAction = {
      id: 'upg-now',
      actionEffects: [
        {
          id: 0,
          type: ActionEffectType.UPGRADE_CARD,
          payingCost: true,
          cards: { scope: [TargetScope.SELF] },
        },
      ],
    };

    const agg = new CardActionAggregate({ 5: upgradableDef }, {}, gs, inst, action);
    agg.resolveAction();

    expect(agg.getPendingChoices()).toHaveLength(0);
    expect(agg.getGameState().instances[1].stateId).toBe(2);
    expect(agg.getGameState().resources.gold).toBe(1);
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
      pickMin: 1,
      pickMax: 1,
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

  it('enforces upgrade cost when target is chosen via pending choice', () => {
    const sourceDef: CardDef = {
      id: 1,
      name: 'PriestLike',
      states: [{ id: 1, name: 'S' }],
    };
    const upgradeableDef: CardDef = {
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
    const targetInstA = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const targetInstB = makeInstance({ id: 3, cardId: 2, stateId: 1 });
    const gs = makeState({
      board: [1, 2, 3],
      resources: {},
      instances: { 1: sourceInst, 2: targetInstA, 3: targetInstB },
    });

    const action: CardAction = {
      id: 'paying-upgrade-choice',
      actionEffects: [
        {
          id: 1,
          type: ActionEffectType.UPGRADE_CARD,
          payingCost: true,
          cards: { scope: [TargetScope.BOARD], pickNumber: 1 },
        },
      ],
    };

    const agg = new CardActionAggregate(
      { 1: sourceDef, 2: upgradeableDef },
      {},
      gs,
      sourceInst,
      action,
    );

    agg.resolveAction();
    expect(agg.getPendingChoices()).toHaveLength(1);

    expect(() =>
      agg.resolvePlayerChoice({
        id: '1-1',
        type: ActionEffectType.UPGRADE_CARD,
        sourceInstanceId: 1,
        instanceIds: [2],
      }),
    ).toThrow('errors.cost.notEnoughResources');

    expect(agg.getGameState().instances[2].stateId).toBe(1);
  });

  it('waits for track step cost resolution after choice', () => {
    const trackDef: CardDef = {
      id: 4,
      name: 'Tracked',
      states: [
        {
          id: 1,
          name: 'S',
          track: {
            inOrder: true,
            steps: [{ id: 1, cost: { resources: [{ gold: 1 }, { wood: 1 }] } }],
          },
        },
      ],
    };
    const sourceInst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const trackedInst = makeInstance({ id: 2, cardId: 4, stateId: 1 });
    const gs = makeState({
      board: [1, 2],
      resources: { gold: 2, wood: 2 },
      instances: { 1: sourceInst, 2: trackedInst },
    });

    const resolved: ResolvedActionEffect = {
      id: '0',
      type: ActionEffectType.TRACK_ADVANCE,
      sourceInstanceId: 1,
      instanceIds: [2],
      stepIds: [1],
    };
    mockStrategyApply(resolved, []);

    const agg = new CardActionAggregate(
      { 1: plainDef, 4: trackDef },
      {},
      gs,
      sourceInst,
      makeChooseEffectAction(),
    );
    agg.resolveAction();
    agg.resolvePlayerChoice({ id: 'x', type: ActionEffectType.CHOOSE_EFFECT, sourceInstanceId: 1 });

    expect(agg.getPendingChoices()).toHaveLength(1);
    expect(agg.getPendingChoices()[0].type).toBe(PendingChoiceType.CHOOSE_RESOURCE);
  });

  it('waits for upgrade cost resolution after choice', () => {
    const upgradableDef: CardDef = {
      id: 5,
      name: 'Upg',
      states: [
        {
          id: 1,
          name: 'S1',
          upgrade: [{ cost: { resources: [{ gold: 1 }, { wood: 1 }] }, upgradeTo: 2 }],
        },
        { id: 2, name: 'S2' },
      ],
    };
    const sourceInst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const targetInst = makeInstance({ id: 2, cardId: 5, stateId: 1 });
    const gs = makeState({
      board: [1, 2],
      resources: { gold: 2, wood: 2 },
      instances: { 1: sourceInst, 2: targetInst },
    });

    const resolved: ResolvedActionEffect = {
      id: '0',
      type: ActionEffectType.UPGRADE_CARD,
      sourceInstanceId: 1,
      instanceIds: [2],
      payingCost: true,
    };
    mockStrategyApply(resolved, []);

    const agg = new CardActionAggregate(
      { 1: plainDef, 5: upgradableDef },
      {},
      gs,
      sourceInst,
      makeChooseEffectAction(),
    );
    agg.resolveAction();
    agg.resolvePlayerChoice({ id: 'x', type: ActionEffectType.CHOOSE_EFFECT, sourceInstanceId: 1 });

    expect(agg.getPendingChoices()).toHaveLength(1);
    expect(agg.getPendingChoices()[0].type).toBe(PendingChoiceType.CHOOSE_RESOURCE);
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

  it('resolves all choices sequentially when discard cost has multiple conditions', () => {
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const inst4 = makeInstance({ id: 4, cardId: 1, stateId: 1 });
    const gs = makeState({
      board: [1, 2, 3, 4],
      instances: { 1: inst1, 2: inst2, 3: inst3, 4: inst4 },
    });
    const action: CardAction = {
      id: 'a1',
      actionEffects: [{ id: 0, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } }],
      cost: {
        discard: [
          { scope: [TargetScope.BOARD], pickNumber: 2 },
          { scope: [TargetScope.BOARD], pickNumber: 1 },
        ],
      },
    };
    const agg = new CardActionAggregate({ 1: plainDef }, {}, gs, inst1, action);
    agg.resolveAction();

    // Two discard conditions → two pending choices
    expect(agg.getPendingChoices()).toHaveLength(2);

    // Resolve first discard choice (2 cards)
    agg.resolveCostChoice({ resources: {}, discardedCardIds: [2, 3], destroyedCardIds: [] });
    expect(agg.getPendingChoices()).toHaveLength(1);
    expect(agg.getGameState().board).toContain(4); // not yet discarded

    // Resolve second discard choice (1 card)
    agg.resolveCostChoice({ resources: {}, discardedCardIds: [4], destroyedCardIds: [] });
    expect(agg.getPendingChoices()).toHaveLength(0);

    // All 3 cost cards discarded
    expect(agg.getGameState().discardPile).toContain(2);
    expect(agg.getGameState().discardPile).toContain(3);
    expect(agg.getGameState().discardPile).toContain(4);
    // Effect applied
    expect(agg.getGameState().resources.gold).toBe(1);
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

// ─── resolveCostChoice – pendingUpgradeCost ───────────────────────────────────

describe('CardActionAggregate.resolveCostChoice – pendingUpgradeCost', () => {
  it('creates pending choice when UPGRADE_CARD payingCost has multiple resource options', () => {
    const upgradableDef: CardDef = {
      id: 5,
      name: 'Upg',
      states: [
        {
          id: 1,
          name: 'S1',
          upgrade: [{ cost: { resources: [{ gold: 1 }, { wood: 1 }] }, upgradeTo: 2 }],
        },
        { id: 2, name: 'S2' },
      ],
    };
    const inst = makeInstance({ id: 1, cardId: 5, stateId: 1 });
    const gs = makeState({ board: [1], resources: { gold: 2, wood: 2 }, instances: { 1: inst } });
    const action: CardAction = {
      id: 'upg',
      actionEffects: [
        {
          id: 0,
          type: ActionEffectType.UPGRADE_CARD,
          payingCost: true,
          cards: { scope: [TargetScope.SELF] },
        },
      ],
    };
    const agg = new CardActionAggregate({ 5: upgradableDef }, {}, gs, inst, action);
    agg.resolveAction();
    expect(agg.getPendingChoices()).toHaveLength(1);
  });

  it('resolves pending upgrade cost and applies upgrade via resolveCostChoice', () => {
    const upgradableDef: CardDef = {
      id: 5,
      name: 'Upg',
      states: [
        {
          id: 1,
          name: 'S1',
          upgrade: [{ cost: { resources: [{ gold: 1 }, { wood: 1 }] }, upgradeTo: 2 }],
        },
        { id: 2, name: 'S2' },
      ],
    };
    const inst = makeInstance({ id: 1, cardId: 5, stateId: 1 });
    const gs = makeState({ board: [1], resources: { gold: 2, wood: 2 }, instances: { 1: inst } });
    const action: CardAction = {
      id: 'upg',
      actionEffects: [
        {
          id: 0,
          type: ActionEffectType.UPGRADE_CARD,
          payingCost: true,
          cards: { scope: [TargetScope.SELF] },
        },
      ],
    };
    const agg = new CardActionAggregate({ 5: upgradableDef }, {}, gs, inst, action);
    agg.resolveAction();
    agg.resolveCostChoice({ resources: { gold: 1 }, discardedCardIds: [], destroyedCardIds: [] });
    expect(agg.getPendingChoices()).toHaveLength(0);
    expect(agg.getGameState().instances[1].stateId).toBe(2);
    expect(agg.getGameState().resources.gold).toBe(1);
  });

  it('keeps pendingUpgradeCost when there are remaining cost choices', () => {
    const upgradableDef: CardDef = {
      id: 5,
      name: 'Upg',
      states: [
        {
          id: 1,
          name: 'S1',
          upgrade: [
            {
              cost: {
                discard: [
                  { scope: [TargetScope.BOARD], pickNumber: 1 },
                  { scope: [TargetScope.BOARD], pickNumber: 1 },
                ],
              },
              upgradeTo: 2,
            },
          ],
        },
        { id: 2, name: 'S2' },
      ],
    };

    const inst1 = makeInstance({ id: 1, cardId: 5, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1, 2, 3], instances: { 1: inst1, 2: inst2, 3: inst3 } });
    const action: CardAction = {
      id: 'upg-multi',
      actionEffects: [
        {
          id: 0,
          type: ActionEffectType.UPGRADE_CARD,
          payingCost: true,
          cards: { scope: [TargetScope.SELF] },
        },
      ],
    };

    const agg = new CardActionAggregate({ 1: plainDef, 5: upgradableDef }, {}, gs, inst1, action);
    agg.resolveAction();
    expect(agg.getPendingChoices()).toHaveLength(2);

    agg.resolveCostChoice({ resources: {}, discardedCardIds: [2], destroyedCardIds: [] });

    expect(agg.getPendingChoices()).toHaveLength(1);
    expect(agg.getGameState().instances[1].stateId).toBe(1);
  });
});

// ─── resolveCostChoice – pendingTrackCost ─────────────────────────────────────

describe('CardActionAggregate.resolveCostChoice – pendingTrackCost', () => {
  it('creates pending choice when inOrder track step cost has multiple resource options', () => {
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
                cost: { resources: [{ gold: 1 }, { wood: 1 }] },
                effects: [{ id: 0, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 5 } }],
              },
            ],
          },
        },
      ],
    };
    const inst = makeInstance({ id: 1, cardId: 4, stateId: 1 });
    const gs = makeState({ board: [1], resources: { gold: 2, wood: 2 }, instances: { 1: inst } });
    const action: CardAction = {
      id: 'ta',
      actionEffects: [
        { id: 0, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
      ],
    };
    const agg = new CardActionAggregate({ 4: trackDef }, {}, gs, inst, action);
    agg.resolveAction();
    expect(agg.getPendingChoices()).toHaveLength(1);
  });

  it('resolves pending track step cost and applies step effects via resolveCostChoice', () => {
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
                cost: { resources: [{ gold: 1 }, { wood: 1 }] },
                effects: [{ id: 0, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 5 } }],
              },
            ],
          },
        },
      ],
    };
    const inst = makeInstance({ id: 1, cardId: 4, stateId: 1 });
    const gs = makeState({ board: [1], resources: { gold: 2, wood: 2 }, instances: { 1: inst } });
    const action: CardAction = {
      id: 'ta',
      actionEffects: [
        { id: 0, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
      ],
    };
    const agg = new CardActionAggregate({ 4: trackDef }, {}, gs, inst, action);
    agg.resolveAction();
    agg.resolveCostChoice({ resources: { gold: 1 }, discardedCardIds: [], destroyedCardIds: [] });
    expect(agg.getPendingChoices()).toHaveLength(0);
    expect(agg.getGameState().instances[1].trackProgress).toContain(1);
    // 2 gold (initial) - 1 gold (cost) + 5 gold (step effect) = 6
    expect(agg.getGameState().resources.gold).toBe(6);
  });

  it('keeps pendingTrackCost when there are remaining cost choices', () => {
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
                cost: {
                  discard: [
                    { scope: [TargetScope.BOARD], pickNumber: 1 },
                    { scope: [TargetScope.BOARD], pickNumber: 1 },
                  ],
                },
                effects: [{ id: 0, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 5 } }],
              },
            ],
          },
        },
      ],
    };

    const inst1 = makeInstance({ id: 1, cardId: 4, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1, 2, 3], instances: { 1: inst1, 2: inst2, 3: inst3 } });
    const action: CardAction = {
      id: 'ta-multi',
      actionEffects: [
        { id: 0, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
      ],
    };

    const agg = new CardActionAggregate({ 1: plainDef, 4: trackDef }, {}, gs, inst1, action);
    agg.resolveAction();
    expect(agg.getPendingChoices()).toHaveLength(2);

    agg.resolveCostChoice({ resources: {}, discardedCardIds: [2], destroyedCardIds: [] });

    expect(agg.getPendingChoices()).toHaveLength(1);
    expect(agg.getGameState().instances[1].trackProgress).toEqual([]);
  });
});
