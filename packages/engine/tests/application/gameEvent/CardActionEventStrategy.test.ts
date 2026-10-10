import { makeState } from '../fixtures';
import { CardActionEventStrategy } from '@engine/application/gameEvent/CardActionEventStrategy';
import { GameEventType } from '@engine/domain/enums';
import type { CardActionEvent } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

describe('CardActionEventStrategy', () => {
  const strategy = new CardActionEventStrategy({}, {});

  it('merges gameStateChanges into game state', () => {
    const gs = makeState({ resources: { gold: 1 } });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.CARD_ACTION,
      timestamp: 0,
      gameStateChanges: { resources: { gold: 5, wood: 2 } },
      sourceInstanceId: 1,
      actionId: 'a1',
    } as CardActionEvent);
    expect(result.resources).toEqual({ gold: 5, wood: 2 });
  });

  it('does not mutate original state', () => {
    const gs = makeState({ resources: { gold: 1 } });
    strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.CARD_ACTION,
      timestamp: 0,
      gameStateChanges: { resources: { gold: 99 } },
      sourceInstanceId: 1,
      actionId: 'a1',
    } as CardActionEvent);
    expect(gs.resources.gold).toBe(1);
  });

  it('merges instance changes when gameStateChanges contains instances', () => {
    const gs = makeState({
      instances: {
        1: {
          id: 1,
          cardId: 1,
          stateId: 1,
          stickers: {},
          trackProgress: [],
          cumulated: 0,
          usedActionIds: [],
          glories: [],
          removedResourcesByState: {},
        },
      },
    });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.CARD_ACTION,
      timestamp: 0,
      gameStateChanges: { instances: { 1: { stateId: 2 } } as never },
      sourceInstanceId: 1,
      actionId: 'a1',
      endsTurn: false,
      triggers: {},
    } as CardActionEvent);
    expect(result.instances[1].stateId).toBe(2);
  });

  it('applies end-turn flow with empty triggers fallback', () => {
    const gs = makeState({
      board: [],
      triggerPile: {},
    });

    const result = strategy.apply(gs, {
      id: 'e2',
      type: GameEventType.CARD_ACTION,
      timestamp: 0,
      gameStateChanges: {},
      sourceInstanceId: 1,
      actionId: 'a2',
      endTurn: true,
      triggers: {},
    } as CardActionEvent);

    expect(result.phase).toBeDefined();
    expect(result.triggerPile).toEqual({});
  });

  it('applies end-round flow and keeps explicit triggers', () => {
    const gs = makeState({
      phase: 'playing' as never,
      triggerPile: {},
    });

    const result = strategy.apply(gs, {
      id: 'e3',
      type: GameEventType.CARD_ACTION,
      timestamp: 0,
      gameStateChanges: {},
      sourceInstanceId: 1,
      actionId: 'a3',
      endRound: true,
      triggers: {
        tid: {
          effectDef: { id: 'r', actionEffects: [] },
          sourceInstanceId: 99,
        },
      },
    } as CardActionEvent);

    expect(result.triggerPile.tid).toBeDefined();
    expect(result.phase).toBe('playing');
  });

  it('applies end-round flow with empty triggers fallback', () => {
    const gs = makeState({ board: [1], triggerPile: {} });

    const result = strategy.apply(gs, {
      id: 'e4',
      type: GameEventType.CARD_ACTION,
      timestamp: 0,
      gameStateChanges: {},
      sourceInstanceId: 1,
      actionId: 'a4',
      endRound: true,
      triggers: {},
    } as CardActionEvent);

    expect(result.phase).toBe('roundEnd');
  });
});
