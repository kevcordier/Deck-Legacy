import { makeInstance, makeState, makeStickerDefs } from '../fixtures';
import * as cardHelpers from '@engine/application/cardHelpers';
import { GameEventContext } from '@engine/application/gameEvent/GameEventContext';
import { GameEventType } from '@engine/domain/enums';
import type {
  AdvanceEvent,
  CardActionEvent,
  CardProducedEvent,
  GameStartedEvent,
  RoundStartedEvent,
  SkipTriggerEvent,
  TurnEndedEvent,
  TurnStartedEvent,
  UpgradeCardEvent,
} from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it, vi } from 'vitest';

const defs = {
  1: {
    id: 1,
    name: 'C',
    states: [
      { id: 1, name: 'S' },
      { id: 2, name: 'S2' },
    ],
  },
};

describe('GameEventContext', () => {
  it('throws for unknown event types', () => {
    const ctx = new GameEventContext(defs, makeStickerDefs());
    expect(() => ctx.apply(makeState(), { id: 'x', type: 'UNKNOWN_EVENT', timestamp: 0 })).toThrow(
      'Unknown event type: UNKNOWN_EVENT',
    );
  });

  it('dispatches GAME_STARTED', () => {
    const ctx = new GameEventContext(defs, makeStickerDefs());
    const result = ctx.apply(makeState(), {
      id: 'e1',
      type: GameEventType.GAME_STARTED,
      timestamp: 0,
      deck: [{ id: 1, cardId: 1 }],
      initialDeck: [1],
      stickerStock: {},
      discoveryPile: [],
    } as GameStartedEvent);
    expect(result.instances[1]).toBeDefined();
  });

  it('dispatches GAME_ENDED', () => {
    const ctx = new GameEventContext(defs, makeStickerDefs());
    const result = ctx.apply(makeState(), {
      id: 'e1',
      type: GameEventType.GAME_ENDED,
      timestamp: 0,
    });
    expect(result.phase).toBe(Phase.GAME_OVER);
  });

  it('dispatches ROUND_STARTED', () => {
    const ctx = new GameEventContext(defs, makeStickerDefs());
    const result = ctx.apply(makeState(), {
      id: 'e1',
      type: GameEventType.ROUND_STARTED,
      timestamp: 0,
      round: 1,
      newCards: [],
      newDrawPile: [],
    } as RoundStartedEvent);
    expect(result.round).toBe(1);
    expect(result.phase).toBe(Phase.ROUND_START);
  });

  it('dispatches TURN_STARTED', () => {
    const ctx = new GameEventContext(defs, makeStickerDefs());
    const result = ctx.apply(makeState(), {
      id: 'e1',
      type: GameEventType.TURN_STARTED,
      timestamp: 0,
      turn: 1,
      turnCards: [],
    } as TurnStartedEvent);
    expect(result.phase).toBe(Phase.PLAYING);
  });

  it('dispatches CARD_PRODUCED', () => {
    const ctx = new GameEventContext(defs, makeStickerDefs());
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    const result = ctx.apply(gs, {
      id: 'e1',
      type: GameEventType.CARD_PRODUCED,
      timestamp: 0,
      cardInstanceId: 1,
      productions: { gold: 2 },
    } as CardProducedEvent);
    expect(result.resources.gold).toBe(2);
  });

  it('dispatches ADVANCE', () => {
    const ctx = new GameEventContext(defs, makeStickerDefs());
    const result = ctx.apply(makeState(), {
      id: 'e1',
      type: GameEventType.ADVANCE,
      timestamp: 0,
      turnCards: [],
    } as AdvanceEvent);
    expect(result).toBeDefined();
  });

  it('dispatches UPGRADE_CARD', () => {
    const ctx = new GameEventContext(defs, makeStickerDefs());
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    vi.spyOn(cardHelpers, 'getActiveState').mockReturnValue({ id: 2, name: 'S', permanent: false });
    const result = ctx.apply(gs, {
      id: 'e1',
      type: GameEventType.UPGRADE_CARD,
      timestamp: 0,
      cardInstanceId: 1,
      stateId: 2,
      cost: {},
      endTurnTrigger: {},
    } as UpgradeCardEvent);
    expect(result.instances[1].stateId).toBe(2);
  });

  it('dispatches CARD_ACTION', () => {
    const ctx = new GameEventContext(defs, makeStickerDefs());
    const gs = makeState({ resources: { gold: 1 } });
    const result = ctx.apply(gs, {
      id: 'e1',
      type: GameEventType.CARD_ACTION,
      timestamp: 0,
      gameStateChanges: { resources: { gold: 10 } },
      sourceInstanceId: 1,
      actionId: 'a1',
    } as CardActionEvent);
    expect(result.resources.gold).toBe(10);
  });

  it('dispatches SKIP_TRIGGER', () => {
    const ctx = new GameEventContext(defs, makeStickerDefs());
    const gs = makeState({
      triggerPile: { tid: { effectDef: { id: 'x', actionEffects: [] }, sourceInstanceId: 1 } },
    });
    const result = ctx.apply(gs, {
      id: 'e1',
      type: GameEventType.SKIP_TRIGGER,
      timestamp: 0,
      triggerId: 'tid',
    } as SkipTriggerEvent);
    expect(result.triggerPile['tid']).toBeUndefined();
  });

  it('dispatches TURN_ENDED', () => {
    const ctx = new GameEventContext(defs, makeStickerDefs());
    const result = ctx.apply(makeState(), {
      id: 'e1',
      type: GameEventType.TURN_ENDED,
      timestamp: 0,
      endTurnTrigger: {},
    } as TurnEndedEvent);
    expect(result.phase).toBe(Phase.TURN_END);
  });
});
