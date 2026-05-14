import { makeState, makeStickerDefs } from '../fixtures';
import { TurnEndedStrategy } from '@engine/application/gameEvent/TurnEndedStrategy';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it } from 'vitest';

describe('TurnEndedStrategy', () => {
  it('sets phase to POSTTURN', () => {
    const strategy = new TurnEndedStrategy({}, makeStickerDefs());
    const gs = makeState();
    const result = strategy.apply(gs);
    expect(result.phase).toBe(Phase.TURN_END);
  });

  it('keeps global board effects even when source card is not on board', () => {
    const strategy = new TurnEndedStrategy({}, makeStickerDefs());
    const gs = makeState({
      board: [],
      boardEffects: {
        99: [{ id: 'g', type: 'BLOCK' as never, global: true }],
        100: [{ id: 'l', type: 'BLOCK' as never }],
      },
    });

    const result = strategy.apply(gs);

    expect(result.boardEffects[99]).toBeDefined();
    expect(result.boardEffects[100]).toBeUndefined();
  });
});
