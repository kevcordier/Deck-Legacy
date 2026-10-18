import { makeInstance, makeState } from '../fixtures';
import { GameAggregate } from '@engine/domain/aggregates/GameAggregate';
import { DefeatCardStrategy } from '@engine/domain/cardAction/DefeatCardStrategy';
import { resolveActionEffect } from '@engine/domain/effects/resolveActionEffect';
import { ActionEffectType, CardTag, Phase, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef, GameState } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const BANDIT = 1;
const KNIGHT = 2;
const OGRE = 3;
const WATCHER = 4;

const defs: Record<number, CardDef> = {
  // Defeat destroys the card itself (in its cost), then rewards.
  [BANDIT]: {
    id: BANDIT,
    name: 'Bandit',
    states: [
      {
        id: 1,
        name: 'Bandit',
        tags: [CardTag.ENEMY],
        negative: true,
        actions: [
          {
            id: '1-1-1',
            defeat: true,
            cost: { resources: [{ weapon: 2 }], destroy: { scope: [TargetScope.SELF] } },
            actionEffects: [
              { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 2 } },
            ],
          },
        ],
      },
    ],
  },
  // Defeat upgrades the card.
  [KNIGHT]: {
    id: KNIGHT,
    name: 'Dark Knight',
    states: [
      {
        id: 1,
        name: 'Dark Knight',
        tags: [CardTag.ENEMY],
        negative: true,
        actions: [
          {
            id: '2-1-1',
            defeat: true,
            cost: { resources: [{ weapon: 3 }] },
            actionEffects: [
              { id: 1, type: ActionEffectType.UPGRADE_CARD, cards: { scope: [TargetScope.SELF] } },
            ],
          },
        ],
        upgrade: [{ cost: {}, upgradeTo: 2 }],
      },
      { id: 2, name: 'Knight', tags: [CardTag.PERSON] },
    ],
  },
  // An enemy without a defeat action.
  [OGRE]: {
    id: OGRE,
    name: 'Ogre',
    states: [{ id: 1, name: 'Ogre', tags: [CardTag.ENEMY], negative: true }],
  },
  [WATCHER]: {
    id: WATCHER,
    name: 'Watcher',
    states: [
      {
        id: 1,
        name: 'Watcher',
        tags: [CardTag.PERMANENT],
        actions: [
          {
            id: '4-1-1',
            trigger: Trigger.ON_DEFEAT,
            actionEffects: [
              { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { wood: 1 } },
            ],
          },
        ],
      },
    ],
  },
};

function makeGame(overrides: Partial<GameState> = {}): GameState {
  return makeState({
    phase: Phase.PLAYING,
    instances: {
      [BANDIT]: makeInstance({ id: BANDIT, cardId: BANDIT }),
      [KNIGHT]: makeInstance({ id: KNIGHT, cardId: KNIGHT }),
      [OGRE]: makeInstance({ id: OGRE, cardId: OGRE }),
      [WATCHER]: makeInstance({ id: WATCHER, cardId: WATCHER }),
    },
    discardPile: [BANDIT, KNIGHT, OGRE],
    permanents: [WATCHER],
    ...overrides,
  });
}

const strategy = new DefeatCardStrategy(defs);
const defeat = (gs: GameState, ids: number[]) =>
  strategy.apply(gs, {
    id: 'x',
    type: ActionEffectType.DEFEAT_CARD,
    sourceInstanceId: 99,
    instanceIds: ids,
  });

describe('DefeatCardStrategy', () => {
  it("queues the enemy's defeat action as a mandatory trigger, free but still self-destroying", () => {
    const [entry] = Object.values(defeat(makeGame(), [BANDIT]).triggerPile);
    expect(entry.sourceInstanceId).toBe(BANDIT);
    expect(entry.effectDef.id).toBe('1-1-1');
    expect(entry.effectDef.defeat).toBe(true);
    expect(entry.effectDef.optional).toBeUndefined();
    expect(entry.effectDef.cost).toBeUndefined();
    expect(entry.effectDef.actionEffects.map(e => e.type)).toEqual([
      ActionEffectType.DESTROY_CARD,
      ActionEffectType.ADD_RESOURCES,
    ]);
  });

  it('drops the whole cost of a defeat that does not destroy the enemy', () => {
    const [entry] = Object.values(defeat(makeGame(), [KNIGHT]).triggerPile);
    expect(entry.effectDef.cost).toBeUndefined();
  });

  it('ignores a card without a defeat action', () => {
    expect(defeat(makeGame(), [OGRE, 42]).triggerPile).toEqual({});
  });

  it('only offers enemies that have a defeat action', () => {
    const [, choices] = resolveActionEffect(
      {
        id: 1,
        type: ActionEffectType.DEFEAT_CARD,
        cards: { tags: [CardTag.ENEMY], scope: [TargetScope.DISCARD] },
      },
      99,
      makeGame(),
      defs,
      {},
    );
    expect([...choices[0].choices].sort((a, b) => Number(a) - Number(b))).toEqual([BANDIT, KNIGHT]);
  });

  it('resolves the queued defeat for free, destroys a self-destroying enemy and fires ON_DEFEAT once', () => {
    const agg = new GameAggregate('game', defeat(makeGame(), [BANDIT]), defs, {});
    const [triggerId, entry] = Object.entries(agg.getGameState().triggerPile)[0];

    const state = agg.cardAction(entry.effectDef, entry.sourceInstanceId, triggerId);

    expect(state.destroyedPile).toContain(BANDIT);
    expect(state.discardPile).not.toContain(BANDIT);
    expect(state.resources.gold).toBe(2);
    expect(Object.values(state.triggerPile).map(t => t.effectDef.id)).toEqual(['4-1-1']);
  });

  it('applies a defeat that upgrades the enemy where it lies', () => {
    const agg = new GameAggregate('game', defeat(makeGame(), [KNIGHT]), defs, {});
    const [triggerId, entry] = Object.entries(agg.getGameState().triggerPile)[0];

    const state = agg.cardAction(entry.effectDef, entry.sourceInstanceId, triggerId);

    expect(state.instances[KNIGHT].stateId).toBe(2);
    expect(state.destroyedPile).not.toContain(KNIGHT);
  });
});
