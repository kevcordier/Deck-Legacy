import { makeState } from '../fixtures';
import { EndGameStrategy } from '@engine/application/cardAction/EndGameStrategy';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it } from 'vitest';

describe('EndGameStrategy', () => {
  it('sets phase to GAME_OVER', () => {
    const strategy = new EndGameStrategy();
    const gs = makeState({ phase: Phase.PLAYING });
    const result = strategy.apply(gs);
    expect(result.phase).toBe(Phase.GAME_OVER);
  });
});
