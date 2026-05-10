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
});
