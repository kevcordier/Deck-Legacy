import { makeState } from '../fixtures';
import { EndGameStrategy } from '@engine/application/cardAction/EndGameStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it } from 'vitest';

describe('EndGameStrategy', () => {
  it('sets phase to GAME_OVER', () => {
    const strategy = new EndGameStrategy();
    const gs = makeState({ phase: Phase.PLAYING });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.END_GAME,
      sourceInstanceId: 1,
    });
    expect(result.phase).toBe(Phase.GAME_OVER);
  });
});
