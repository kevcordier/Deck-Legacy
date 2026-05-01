import { makeInstance, makeState } from '../fixtures';
import { ChooseStateEventStrategy } from '@engine/application/gameEvent/ChooseStateEventStrategy';
import { GameEventType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('ChooseStateEventStrategy', () => {
  it('updates stateId of the target card instance', () => {
    const strategy = new ChooseStateEventStrategy();
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ instances: { 1: inst } });
    const event = {
      id: 'e1',
      type: GameEventType.CHOOSE_STATE,
      timestamp: 0,
      cardInstanceId: 1,
      stateId: 2,
    };
    const result = strategy.apply(gs, event as never);
    expect(result.instances[1].stateId).toBe(2);
  });
});
