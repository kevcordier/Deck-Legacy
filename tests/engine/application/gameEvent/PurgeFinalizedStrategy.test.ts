import { makeInstance, makeState } from '../fixtures';
import { PurgeFinalizedStrategy } from '@engine/application/gameEvent/PurgeFinalizedStrategy';
import { GameEventType, PassiveType } from '@engine/domain/enums';
import type { PurgeFinalizedEvent } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';
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
});
