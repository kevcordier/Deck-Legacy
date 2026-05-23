import { makeState } from '../fixtures';
import { SetLastRoundStrategy } from '@engine/application/cardAction/SetLastRoundStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('SetLastRoundStrategy', () => {
  it('sets isLastRound to true', () => {
    const strategy = new SetLastRoundStrategy();
    const result = strategy.apply(makeState({ isLastRound: false }), {
      id: 'x',
      type: ActionEffectType.SET_LAST_ROUND,
      sourceInstanceId: 1,
    });

    expect(result.isLastRound).toBe(true);
  });
});
