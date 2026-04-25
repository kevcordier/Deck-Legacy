import { makeState } from '../fixtures';
import { CardActionEventStrategy } from '@engine/application/gameEvent/CardActionEventStrategy';
import { GameEventType } from '@engine/domain/enums';
import type { CardActionEvent } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

describe('CardActionEventStrategy', () => {
  const strategy = new CardActionEventStrategy();

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
});
