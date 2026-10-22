import { makeInstance, makeState } from './fixtures';
import { hasUsesLeft } from '@engine/domain/cards/hasUsesLeft';
import { turnUseKey } from '@engine/domain/cards/turnUseKey';
import type { CardAction } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

describe('hasUsesLeft', () => {
  const instance = makeInstance({ id: 5, cardId: 1, stateId: 1, usedActionIds: ['a'] });

  it('allows an action without limit', () => {
    expect(hasUsesLeft({ id: 'a', actionEffects: [] }, instance, makeState())).toBe(true);
  });

  it('counts the uses of the whole game for limitedTime', () => {
    const action: CardAction = { id: 'a', actionEffects: [], limitedTime: 1 };
    expect(hasUsesLeft(action, instance, makeState())).toBe(false);
  });

  it('counts the uses of this turn for perTurn', () => {
    const action: CardAction = { id: 'b', actionEffects: [], perTurn: 1 };
    expect(hasUsesLeft(action, instance, makeState())).toBe(true);
    const used = makeState({ turnUsedActions: [turnUseKey(5, 'b')] });
    expect(hasUsesLeft(action, instance, used)).toBe(false);
  });
});
