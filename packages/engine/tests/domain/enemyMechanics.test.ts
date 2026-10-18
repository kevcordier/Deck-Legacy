import { makeInstance, makeState } from './fixtures';
import { CardActionAggregate } from '@engine/domain/aggregates/CardActionAggregate';
import { GameAggregate } from '@engine/domain/aggregates/GameAggregate';
import { AddResourceStrategy } from '@engine/domain/cardAction/AddResourceStrategy';
import { AddStickerStrategy } from '@engine/domain/cardAction/AddStickerStrategy';
import { RemoveResourceOnCardStrategy } from '@engine/domain/cardAction/RemoveResourceOnCardStrategy';
import {
  canAffordCost,
  evaluateCondition,
  getEffectiveUpgradeCost,
  getInstancesTriggerEffects,
  getProductionChoicesForAction,
  getSpendableResources,
  keepGainableResources,
} from '@engine/domain/cardHelpers';
import { cardSelector } from '@engine/domain/cardSelector';
import { resolveCost } from '@engine/domain/costResolver';
import { countValuePerElement, resolveActionEffect } from '@engine/domain/effectResolver';
import {
  ActionEffectType,
  CardTag,
  GameEventType,
  PassiveType,
  Phase,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import { CostResolutionError } from '@engine/domain/errors/CostResolutionError';
import { ExpansionSelectedStrategy } from '@engine/domain/gameEvent/ExpansionSelectedStrategy';
import type {
  CardAction,
  CardDef,
  ExpansionSelectedEvent,
  GameState,
  Passive,
} from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';
import { describe, expect, it } from 'vitest';

const onlyWeapons: Passive = {
  id: 'gain',
  type: PassiveType.RESTRICT_GAIN,
  resources: { weapon: 1 },
};
const weaponsForUpgrades: Passive = {
  id: 'spend',
  type: PassiveType.RESTRICT_SPEND,
  resources: { weapon: 1 },
};

// ─── Action conditions ────────────────────────────────────────────────────────

describe('expansionActive condition', () => {
  const condition = { type: 'expansionActive', name: 'Woods' } as const;

  it('is true while the expansion is played', () => {
    const gs = makeState({ activeExpansion: 'Woods' });
    expect(evaluateCondition(condition, gs, 1, {}, {})).toBe(true);
  });

  it('is false once its score is saved or for another expansion', () => {
    const done = makeState({ activeExpansion: 'Woods', campaignScores: { Woods: 10 } });
    expect(evaluateCondition(condition, done, 1, {}, {})).toBe(false);
    expect(evaluateCondition(condition, makeState({ activeExpansion: 'Other' }), 1, {}, {})).toBe(
      false,
    );
  });
});

describe('triggered action condition', () => {
  const defs: Record<number, CardDef> = {
    1: {
      id: 1,
      name: 'Prisoner',
      states: [
        {
          id: 1,
          name: 'Prisoner',
          actions: [
            {
              id: '1-1-1',
              trigger: Trigger.ON_PLAY,
              condition: {
                type: 'cardCount',
                cards: { scope: [TargetScope.BOARD], tags: [CardTag.ENEMY] },
                min: 2,
              },
              actionEffects: [],
            },
          ],
        },
      ],
    },
    2: { id: 2, name: 'Bandit', states: [{ id: 1, name: 'Bandit', tags: [CardTag.ENEMY] }] },
  };

  const triggersWith = (board: number[]) => {
    const gs = makeState({
      board,
      instances: {
        1: makeInstance({ id: 1, cardId: 1 }),
        2: makeInstance({ id: 2, cardId: 2 }),
        3: makeInstance({ id: 3, cardId: 2 }),
      },
    });
    return getInstancesTriggerEffects([gs.instances[1]], defs, {}, Trigger.ON_PLAY, gs);
  };

  it('fires only when the condition holds', () => {
    expect(triggersWith([1, 2])).toHaveLength(0);
    expect(triggersWith([1, 2, 3])).toHaveLength(1);
  });
});

// ─── Defeat ───────────────────────────────────────────────────────────────────

describe('defeat actions', () => {
  const defs: Record<number, CardDef> = {
    1: { id: 1, name: 'Enemy', states: [{ id: 1, name: 'Enemy', negative: true }] },
    2: {
      id: 2,
      name: 'Forest',
      states: [
        {
          id: 1,
          name: 'Forest',
          actions: [{ id: '2-1-1', trigger: Trigger.ON_DEFEAT, actionEffects: [] }],
        },
      ],
    },
  };

  const run = (action: CardAction) => {
    const gs = makeState({
      board: [1, 2],
      instances: {
        1: makeInstance({ id: 1, cardId: 1 }),
        2: makeInstance({ id: 2, cardId: 2 }),
      },
    });
    const agg = new CardActionAggregate(defs, {}, gs, gs.instances[1], action);
    agg.resolveAction();
    return Object.values(agg.getGameState().triggerPile);
  };

  it('queues the ON_DEFEAT triggers of the cards in play', () => {
    const triggers = run({ id: '1-1-1', defeat: true, actionEffects: [] });
    expect(triggers.map(t => t.sourceInstanceId)).toEqual([2]);
  });

  it('queues nothing for other actions', () => {
    expect(run({ id: '1-1-1', actionEffects: [] })).toHaveLength(0);
  });
});

// ─── In-order track ───────────────────────────────────────────────────────────

describe('in-order track advance', () => {
  const defs: Record<number, CardDef> = {
    1: {
      id: 1,
      name: 'Lady',
      states: [
        {
          id: 1,
          name: 'Lady',
          track: {
            inOrder: true,
            steps: [
              { id: 1 },
              { id: 2, effects: [{ id: 1, type: ActionEffectType.ADD_GLORY, value: -1 }] },
              { id: 3 },
            ],
          },
        },
      ],
    },
    2: { id: 2, name: 'Bandit', states: [{ id: 1, name: 'Bandit', tags: [CardTag.ENEMY] }] },
  };

  const resolve = (board: number[], trackProgress: number[] = []) =>
    resolveActionEffect(
      {
        id: 1,
        type: ActionEffectType.TRACK_ADVANCE,
        cards: { scope: [TargetScope.SELF] },
        valuePerElement: {
          amount: 1,
          cards: { scope: [TargetScope.BOARD], tags: [CardTag.ENEMY] },
        },
      },
      1,
      makeState({
        board,
        instances: {
          1: makeInstance({ id: 1, cardId: 1, trackProgress }),
          2: makeInstance({ id: 2, cardId: 2 }),
          3: makeInstance({ id: 3, cardId: 2 }),
        },
      }),
      defs,
      {},
    )[0];

  it('marks one step per counted element, in order, with their effects', () => {
    const resolved = resolve([1, 2, 3]);
    expect(resolved.stepIds).toEqual([1, 2]);
    expect(resolved.newActionEffects).toEqual([
      { id: 1, type: ActionEffectType.ADD_GLORY, value: -1, sourceStepId: 2 },
    ]);
  });

  it('marks nothing when nothing is counted and stops at the last step', () => {
    expect(resolve([1]).stepIds).toEqual([]);
    expect(resolve([1, 2, 3], [1, 2]).stepIds).toEqual([3]);
  });
});

// ─── Resource restrictions ────────────────────────────────────────────────────

describe('RESTRICT_GAIN', () => {
  const restricted = makeState({ boardEffects: { 9: [onlyWeapons] } });

  it('keeps only the allowed resources', () => {
    expect(keepGainableResources({ gold: 2, weapon: 1 }, restricted)).toEqual({ weapon: 1 });
    expect(keepGainableResources({ gold: 2 }, makeState())).toEqual({ gold: 2 });
  });

  it('applies to production choices and gained resources', () => {
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'Field', states: [{ id: 1, name: 'Field' }] },
    };
    const gs: GameState = { ...restricted, instances: { 1: makeInstance() } };
    expect(
      getProductionChoicesForAction({ gold: 1, weapon: 2 }, gs, defs, gs.instances[1], {}),
    ).toEqual([{ weapon: 2 }]);

    const result = new AddResourceStrategy().apply(gs, {
      id: '1-1',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 1,
      resources: { gold: 1, weapon: 1 },
    });
    expect(result.resources).toEqual({ weapon: 1 });
  });
});

describe('RESTRICT_SPEND', () => {
  const gs = makeState({
    resources: { gold: 1, weapon: 3 },
    boardEffects: { 9: [weaponsForUpgrades] },
    instances: { 1: makeInstance() },
  });
  const defs: Record<number, CardDef> = { 1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] } };
  const weaponCost = { resources: [{ weapon: 3 }] };

  it('reserves the resources for upgrade costs', () => {
    expect(getSpendableResources(gs)).toEqual({ gold: 1 });
    expect(getSpendableResources(gs, true)).toEqual({ gold: 1, weapon: 3 });
  });

  it('refuses action costs but accepts upgrade costs', () => {
    expect(canAffordCost(weaponCost, 1, gs, defs, {})).toBe(false);
    expect(() => resolveCost(weaponCost, 1, gs, defs, {})).toThrow(CostResolutionError);

    const upgradeCost = getEffectiveUpgradeCost(weaponCost, gs, defs, {}, 1);
    expect(upgradeCost.forUpgrade).toBe(true);
    expect(canAffordCost(upgradeCost, 1, gs, defs, {})).toBe(true);
    expect(resolveCost(upgradeCost, 1, gs, defs, {})[0].resources).toEqual({ weapon: 3 });
  });
});

// ─── Purge ────────────────────────────────────────────────────────────────────

describe('purge with negative cards and ON_PURGE_SELECTION', () => {
  const addPrisoners = (id: string): CardAction => ({
    id,
    trigger: Trigger.ON_PURGE_SELECTION,
    optional: true,
    actionEffects: [
      {
        id: 1,
        type: ActionEffectType.ADD_TO_PURGE,
        cards: { scope: [TargetScope.DECK, TargetScope.SELF], name: 'Prisoner', pickMax: 2 },
      },
    ],
  });
  const defs: Record<number, CardDef> = {
    1: { id: 1, name: 'Field', states: [{ id: 1, name: 'Field' }] },
    2: {
      id: 2,
      name: 'Bandit',
      states: [{ id: 1, name: 'Prisoner', negative: true, actions: [addPrisoners('2-1-1')] }],
    },
    3: {
      id: 3,
      name: 'Other bandit',
      states: [{ id: 1, name: 'Prisoner', negative: true, actions: [addPrisoners('3-1-1')] }],
    },
  };

  const makeAggregate = () =>
    new GameAggregate(
      'game',
      makeState({
        phase: Phase.PURGE,
        drawPile: [1, 2, 3],
        instances: {
          1: makeInstance({ id: 1, cardId: 1 }),
          2: makeInstance({ id: 2, cardId: 2 }),
          3: makeInstance({ id: 3, cardId: 3 }),
        },
        purgeState: {
          batchSize: 1,
          permanentToPurge: 0,
          shuffledPool: [2, 1, 3],
          completedBatchStarts: [],
          selectedCardIds: [],
          selectedPermanentIds: [],
          onPurgeTriggered: false,
          onStartDiscoverIds: [],
        },
      }),
      defs,
      {},
    );

  it('never offers negative cards and skips their batches', () => {
    const agg = makeAggregate();
    expect(agg.getPurgeCandidates()).toEqual([1]);
    agg.selectPurgeCard(1);
    expect(agg.isPurgeSelectionComplete()).toBe(true);
  });

  it('fires one ON_PURGE_SELECTION trigger for identical copies', () => {
    const agg = makeAggregate();
    agg.selectPurgeCard(1);
    agg.finalizePurge();
    const triggers = Object.values(agg.getGameState().triggerPile);
    expect(triggers.map(t => t.sourceInstanceId)).toEqual([2]);
  });
});

describe('purge focus', () => {
  const defs: Record<number, CardDef> = {
    1: { id: 1, name: 'Field', states: [{ id: 1, name: 'Field', productions: [{ gold: 1 }] }] },
    2: { id: 2, name: 'Forest', states: [{ id: 1, name: 'Forest', productions: [{ wood: 1 }] }] },
  };
  // instances 1-3: fields, 4-6: forests
  const instances = Object.fromEntries(
    [1, 2, 3, 4, 5, 6].map(id => [id, makeInstance({ id, cardId: id <= 3 ? 1 : 2 })]),
  );

  const makeAggregate = (shuffledPool: number[], batchSize: number) =>
    new GameAggregate(
      'game',
      makeState({
        phase: Phase.PURGE,
        drawPile: [1, 2, 3, 4, 5, 6],
        instances,
        purgeState: {
          batchSize,
          permanentToPurge: 0,
          shuffledPool,
          completedBatchStarts: [],
          selectedCardIds: [],
          selectedPermanentIds: [],
          onPurgeTriggered: false,
          onStartDiscoverIds: [],
          focus: { resource: ResourceType.WOOD, count: 2 },
        },
      }),
      defs,
      {},
    );

  it('offers only the focused cards until enough of them are selected', () => {
    const agg = makeAggregate([1, 4, 2, 5, 3, 6], 2);
    expect(agg.getPurgeCandidates()).toEqual([4]);
    expect(agg.getPurgeBatch()).toEqual([1, 4]);
    agg.selectPurgeCard(4);
    expect(agg.getPurgeCandidates()).toEqual([5]);
    agg.selectPurgeCard(5);
    expect(agg.getPurgeCandidates()).toEqual([3, 6]);
  });

  it('offers every card when the batch has no focused card', () => {
    const agg = makeAggregate([1, 2, 4, 5], 2);
    expect(agg.getPurgeCandidates()).toEqual([1, 2]);
  });
});

// ─── Ridding the Woods, cards 11-29 ───────────────────────────────────────────

describe('accumulation condition', () => {
  it('compares the accumulation of the card', () => {
    const gs = makeState({ instances: { 1: makeInstance({ cumulated: 2 }) } });
    expect(evaluateCondition({ type: 'accumulation', min: 2 }, gs, 1, {}, {})).toBe(true);
    expect(evaluateCondition({ type: 'accumulation', max: 1 }, gs, 1, {}, {})).toBe(false);
    expect(evaluateCondition({ type: 'accumulation', max: 0 }, makeState(), 9, {}, {})).toBe(true);
  });
});

describe('ownProduction count', () => {
  it('counts the production of the card itself', () => {
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'Wagon', states: [{ id: 1, name: 'Wagon', productions: [{ gold: 9 }] }] },
    };
    const gs = makeState({
      instances: {
        1: makeInstance({
          removedResourcesByState: { 1: { production: [ResourceType.GOLD, ResourceType.GOLD] } },
        }),
      },
    });
    expect(countValuePerElement({ amount: 5, ownProduction: true }, gs, 1, defs, {})).toBe(7);
  });
});

describe('STAYING scope', () => {
  it('selects the cards in play that stay in play', () => {
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'Plain', states: [{ id: 1, name: 'Plain' }] },
      2: {
        id: 2,
        name: 'Staying',
        states: [{ id: 1, name: 'Staying', passives: [CardPassives[PassiveType.STAY_IN_PLAY]] }],
      },
    };
    const gs = makeState({
      board: [1, 2],
      instances: { 1: makeInstance({ id: 1 }), 2: makeInstance({ id: 2, cardId: 2 }) },
    });
    expect(
      cardSelector({ scope: [TargetScope.BOARD, TargetScope.STAYING] }, 9, gs, defs, {}),
    ).toEqual([2]);
  });
});

describe('effects on several cards', () => {
  it('adds a sticker to each chosen card', () => {
    const gs = makeState({
      stickerStock: { 6: 3 },
      instances: { 1: makeInstance({ id: 1 }), 2: makeInstance({ id: 2 }) },
    });
    const result = new AddStickerStrategy().apply(gs, {
      id: '9-1',
      type: ActionEffectType.ADD_STICKER,
      sourceInstanceId: 9,
      instanceIds: [1, 2],
      stickerIds: [6],
    });
    expect(result.instances[1].stickers[1]).toEqual([6]);
    expect(result.instances[2].stickers[1]).toEqual([6]);
    expect(result.stickerStock[6]).toBe(1);
  });

  it('crosses out a production value times', () => {
    const gs = makeState({ instances: { 1: makeInstance() } });
    const result = new RemoveResourceOnCardStrategy().apply(gs, {
      id: '1-1',
      type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
      sourceInstanceId: 1,
      instanceIds: [1],
      resources: { gold: 1 },
      resourceScopes: ['production'],
      value: 2,
    });
    expect(result.instances[1].removedResourcesByState?.[1]?.production).toEqual(['gold', 'gold']);
  });
});

describe('condition on a regular action', () => {
  const defs: Record<number, CardDef> = {
    1: { id: 1, name: 'Trap', states: [{ id: 1, name: 'Trap' }] },
    2: { id: 2, name: 'Lady', states: [{ id: 1, name: 'Lady', tags: [CardTag.LADY] }] },
  };
  const action: CardAction = {
    id: '1-1-1',
    condition: {
      type: 'cardCount',
      cards: { scope: [TargetScope.BOARD], tags: [CardTag.LADY] },
      min: 1,
    },
    actionEffects: [{ id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { weapon: 2 } }],
  };
  const run = (board: number[]) => {
    const gs = makeState({
      board,
      instances: { 1: makeInstance({ id: 1 }), 2: makeInstance({ id: 2, cardId: 2 }) },
    });
    const agg = new CardActionAggregate(defs, {}, gs, gs.instances[1], action);
    agg.resolveAction();
    return agg;
  };

  it('is cancelled when the condition fails', () => {
    expect(run([1]).isCancelled()).toBe(true);
    expect(run([1, 2]).getGameState().resources).toEqual({ weapon: 2 });
  });
});

describe('REQUIRES_IN_PLAY', () => {
  it('discards the card once no enemy is left in play', () => {
    const defs: Record<number, CardDef> = {
      1: {
        id: 1,
        name: 'Guard',
        states: [
          {
            id: 1,
            name: 'Guard',
            passives: [
              {
                id: 'g',
                type: PassiveType.REQUIRES_IN_PLAY,
                cards: { scope: [TargetScope.BOARD], tags: [CardTag.ENEMY] },
              },
            ],
          },
        ],
      },
      2: { id: 2, name: 'Bandit', states: [{ id: 1, name: 'Bandit', tags: [CardTag.ENEMY] }] },
    };
    const gs = makeState({
      board: [1, 2],
      boardEffects: { 1: defs[1].states[0].passives ?? [] },
      instances: { 1: makeInstance({ id: 1 }), 2: makeInstance({ id: 2, cardId: 2 }) },
    });
    const discardEnemy: CardAction = {
      id: '2-1-1',
      actionEffects: [],
    };
    const agg = new CardActionAggregate(defs, {}, gs, gs.instances[2], discardEnemy);
    agg.resolveAction();
    expect(agg.getGameState().discardPile).toEqual([2, 1]);
  });
});

describe('expansion discovery order', () => {
  it('puts the expansion cards before the remaining base cards', () => {
    const strategy = new ExpansionSelectedStrategy({
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
    });
    const event = {
      id: 'e',
      type: GameEventType.EXPANSION_SELECTED,
      timestamp: 0,
      expansionName: 'exp',
      deckEntries: [{ id: 5, cardId: 1 }],
      purgeBatchSize: 1,
      purgePermanentCount: 0,
      purgePool: [],
      onStartDiscoverIds: [],
    } as ExpansionSelectedEvent;
    const state = makeState({ discoveryPile: [3] });

    expect(
      strategy.apply(state, { ...event, expansionDiscoveryFirst: true } as ExpansionSelectedEvent)
        .discoveryPile,
    ).toEqual([5, 3]);
    // Events saved before this flag keep the old order
    expect(strategy.apply(state, event).discoveryPile).toEqual([3, 5]);
  });
});
