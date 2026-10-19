import { makeDefs, makeInstance, makeState, makeStickerDefs } from './fixtures';
import { AddResourceStrategy } from '@engine/domain/cardAction/AddResourceStrategy';
import { CardActionContext } from '@engine/domain/cardAction/CardActionContext';
import { ActionEffectType, GameEventType } from '@engine/domain/enums';
import { CardProducedStrategy } from '@engine/domain/gameEvent/CardProducedStrategy';
import { TurnStartedStrategy } from '@engine/domain/gameEvent/TurnStartedStrategy';
import type { CardProducedEvent, TurnStartedEvent } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

describe('Too Much Mead: lose the next resources gained this turn', () => {
  it('counts the units to lose', () => {
    const context = new CardActionContext(makeDefs(), makeStickerDefs());
    const gs = context.apply(makeState(), {
      id: 'x',
      type: ActionEffectType.LOSE_NEXT_RESOURCES,
      sourceInstanceId: 1,
      value: 3,
    });
    expect(gs.resourcesToLose).toBe(3);
  });

  it('loses the units from the next gains, then gains again', () => {
    const add = new AddResourceStrategy();
    const gain = (gs: ReturnType<typeof makeState>, gold: number, goods = 0) =>
      add.apply(gs, {
        id: 'x',
        type: ActionEffectType.ADD_RESOURCES,
        sourceInstanceId: 1,
        resources: { gold, goods },
      });

    const first = gain(makeState({ resourcesToLose: 3, resources: { wood: 1 } }), 2);
    expect(first.resources).toEqual({ wood: 1, gold: 0, goods: 0 });
    expect(first.resourcesToLose).toBe(1);

    const second = gain(first, 1, 2);
    expect(second.resources).toEqual({ wood: 1, gold: 0, goods: 2 });
    expect(second.resourcesToLose).toBe(0);

    expect(gain(second, 2).resources.gold).toBe(2);
  });

  it('also takes the units from productions', () => {
    const inst = makeInstance({ id: 1 });
    const result = new CardProducedStrategy(makeDefs(), makeStickerDefs()).apply(
      makeState({ board: [1], instances: { 1: inst }, resourcesToLose: 1 }),
      {
        id: 'e',
        type: GameEventType.CARD_PRODUCED,
        timestamp: 0,
        cardInstanceId: 1,
        productions: { gold: 2 },
      } as CardProducedEvent,
    );
    expect(result.resources.gold).toBe(1);
    expect(result.resourcesToLose).toBe(0);
  });

  it('forgets the remaining losses at the next turn', () => {
    const result = new TurnStartedStrategy(makeDefs(), makeStickerDefs()).apply(
      makeState({ resourcesToLose: 2 }),
      {
        id: 'e',
        type: GameEventType.TURN_STARTED,
        timestamp: 0,
        turn: 2,
        turnCards: [],
      } as TurnStartedEvent,
    );
    expect(result.resourcesToLose).toBeUndefined();
  });
});
