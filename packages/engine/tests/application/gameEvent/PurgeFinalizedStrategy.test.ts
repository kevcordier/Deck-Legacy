import { makeInstance, makeState } from '../fixtures';
import { PurgeFinalizedStrategy } from '@engine/application/gameEvent/PurgeFinalizedStrategy';
import { GameEventType, PassiveType, Phase } from '@engine/domain/enums';
import type { PurgeFinalizedEvent } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

describe('PurgeFinalizedStrategy', () => {
  it('adds passives to boardEffects for discovered onStart permanents', () => {
    const defs = {
      1: {
        id: 1,
        name: 'Permanent card',
        states: [
          {
            id: 1,
            name: 'Base',
            permanent: true,
            passives: [
              {
                id: 'perm-parameter',
                type: PassiveType.SET_GAME_PARAMETER,
                parameters: { discoverPerRound: 1 },
              },
            ],
          },
        ],
      },
    };

    const strategy = new PurgeFinalizedStrategy(defs);
    const instance = makeInstance({ id: 10, cardId: 1, stateId: 1 });
    const gameState = makeState({
      discoveryPile: [10],
      instances: { 10: instance },
      boardEffects: {},
      phase: Phase.PURGE,
    });

    const result = strategy.apply(gameState, {
      id: 'e1',
      type: GameEventType.PURGE_FINALIZED,
      timestamp: 0,
      purgedIds: [],
      glory: 0,
      onStartDiscoverIds: [10],
    } as PurgeFinalizedEvent);

    expect(result.permanents).toContain(10);
    expect(result.lastAddedCards).toEqual([10]);
    expect(result.boardEffects[10]).toEqual([
      {
        id: 'perm-parameter',
        type: PassiveType.SET_GAME_PARAMETER,
        parameters: { discoverPerRound: 1 },
      },
    ]);
    expect(result.phase).toBe(Phase.ROUND_END);
  });

  it('skips onStart ids that are not in discovery and keeps existing discard duplicates out', () => {
    const defs = {
      2: {
        id: 2,
        name: 'Non permanent',
        states: [{ id: 1, name: 'Base', permanent: false }],
      },
    };

    const strategy = new PurgeFinalizedStrategy(defs);
    const instance = makeInstance({ id: 20, cardId: 2, stateId: 1 });
    const gameState = makeState({
      discoveryPile: [20],
      discardPile: [20],
      instances: { 20: instance },
      phase: Phase.PURGE,
    });

    const result = strategy.apply(gameState, {
      id: 'e2',
      type: GameEventType.PURGE_FINALIZED,
      timestamp: 0,
      purgedIds: [],
      glory: 0,
      onStartDiscoverIds: [999, 20],
    } as PurgeFinalizedEvent);

    expect(result.lastAddedCards).toEqual([20]);
    expect(result.discardPile.filter(id => id === 20)).toHaveLength(1);
  });

  it('skips discovered onStart id when instance cannot be found', () => {
    const strategy = new PurgeFinalizedStrategy({});
    const gameState = makeState({
      discoveryPile: [30],
      instances: {},
      phase: Phase.PURGE,
    });

    const result = strategy.apply(gameState, {
      id: 'e3',
      type: GameEventType.PURGE_FINALIZED,
      timestamp: 0,
      purgedIds: [],
      glory: 0,
      onStartDiscoverIds: [30],
    } as PurgeFinalizedEvent);

    expect(result.lastAddedCards).toEqual([]);
    expect(result.discoveryPile).toEqual([]);
    expect(result.permanents).toEqual([]);
  });

  it('does not duplicate permanents when discovered onStart permanent is already present', () => {
    const defs = {
      1: {
        id: 1,
        name: 'Permanent card',
        states: [
          {
            id: 1,
            name: 'Base',
            permanent: true,
            passives: [{ id: 'perm', type: PassiveType.STAY_IN_PLAY }],
          },
        ],
      },
    };

    const strategy = new PurgeFinalizedStrategy(defs);
    const instance = makeInstance({ id: 10, cardId: 1, stateId: 1 });
    const gameState = makeState({
      discoveryPile: [10],
      permanents: [10],
      instances: { 10: instance },
      boardEffects: {},
      phase: Phase.PURGE,
    });

    const result = strategy.apply(gameState, {
      id: 'e4',
      type: GameEventType.PURGE_FINALIZED,
      timestamp: 0,
      purgedIds: [],
      glory: 0,
      onStartDiscoverIds: [10],
    } as PurgeFinalizedEvent);

    expect(result.permanents.filter(id => id === 10)).toHaveLength(1);
    expect(result.boardEffects[10]).toEqual([{ id: 'perm', type: PassiveType.STAY_IN_PLAY }]);
  });
});
