import { makeDefs, makeState, makeStickerDefs } from '../fixtures';
import { CardActionEventStrategy } from '@engine/application/gameEvent/CardActionEventStrategy';
import { GameEventType } from '@engine/domain/enums';
import type { CardActionEvent } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it } from 'vitest';

describe('CardActionEventStrategy', () => {
  const strategy = new CardActionEventStrategy(makeDefs(), makeStickerDefs());

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

  it('merges instance changes when gameStateChanges contains instances', () => {
    const gs = makeState({
      instances: {
        1: {
          id: 1,
          cardId: 1,
          stateId: 1,
          stickers: {},
          trackProgress: [],
          cumulated: 0,
          usedActionIds: [],
          glories: [],
          removedResourcesByState: {},
        },
      },
    });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.CARD_ACTION,
      timestamp: 0,
      gameStateChanges: { instances: { 1: { stateId: 2 } } as never },
      sourceInstanceId: 1,
      actionId: 'a1',
      endsTurn: false,
    } as CardActionEvent);
    expect(result.instances[1].stateId).toBe(2);
  });

  it('applies TurnEndedStrategy when endsTurn is true', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.CARD_ACTION,
      timestamp: 0,
      gameStateChanges: {},
      sourceInstanceId: 1,
      actionId: 'a1',
      endsTurn: true,
    } as CardActionEvent);
    expect(result.phase).toBe(Phase.TURN_END);
  });
});
