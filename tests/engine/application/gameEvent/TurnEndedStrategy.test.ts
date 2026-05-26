import { makeState, makeStickerDefs } from '../fixtures';
import { TurnEndedStrategy } from '@engine/application/gameEvent/TurnEndedStrategy';
import { GameEventType, Phase } from '@engine/domain/enums';
import type { TurnEndedEvent } from '@engine/domain/types/GameEvent';
import { describe, expect, it } from 'vitest';

describe('TurnEndedStrategy', () => {
  it('sets phase to POSTTURN', () => {
    const strategy = new TurnEndedStrategy({}, makeStickerDefs());
    const gs = makeState();
    const event: TurnEndedEvent = {
      id: 'e1',
      timestamp: 0,
      endTurnTrigger: {},
      type: GameEventType.TURN_ENDED,
    };
    const result = strategy.apply(gs, event);
    expect(result.phase).toBe(Phase.TURN_END);
  });

  it('keeps board effects for permanents even when source card is not on board', () => {
    const strategy = new TurnEndedStrategy({}, makeStickerDefs());
    const gs = makeState({
      permanents: [99],
      board: [],
      boardEffects: {
        99: [{ id: 'g', type: 'BLOCK' as never }],
        100: [{ id: 'l', type: 'BLOCK' as never }],
      },
    });
    const event: TurnEndedEvent = {
      id: 'e2',
      timestamp: 0,
      endTurnTrigger: {},
      type: GameEventType.TURN_ENDED,
    };
    const result = strategy.apply(gs, event);

    expect(result.boardEffects[99]).toBeDefined();
    expect(result.boardEffects[100]).toBeUndefined();
  });

  it('stays in PLAYING phase if triggers remain in triggerPile', () => {
    const strategy = new TurnEndedStrategy({}, makeStickerDefs());
    const gs = makeState({
      triggerPile: {
        'remaining-trigger': {
          effectDef: { id: 'x', actionEffects: [] },
          sourceInstanceId: 1,
        },
      },
      board: [],
      phase: Phase.PLAYING,
    });
    const event: TurnEndedEvent = {
      id: 'e3',
      timestamp: 0,
      endTurnTrigger: {},
      type: GameEventType.TURN_ENDED,
    };
    const result = strategy.apply(gs, event);

    expect(result.phase).toBe(Phase.PLAYING);
    expect(result.triggerPile['remaining-trigger']).toBeDefined();
  });
});
