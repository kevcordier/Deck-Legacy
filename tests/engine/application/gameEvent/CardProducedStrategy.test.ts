import { makeDefs, makeInstance, makeState, makeStickerDefs } from '../fixtures';
import { CardProducedStrategy } from '@engine/application/gameEvent/CardProducedStrategy';
import { GameEventType } from '@engine/domain/enums';
import type { CardProducedEvent } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

describe('CardProducedStrategy', () => {
  const strategy = new CardProducedStrategy(makeDefs(), makeStickerDefs());

  it('adds productions to resources', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], resources: { gold: 1 }, instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.CARD_PRODUCED,
      timestamp: 0,
      cardInstanceId: 1,
      productions: { gold: 3, wood: 1 },
    } as CardProducedEvent);
    expect(result.resources.gold).toBe(4);
    expect(result.resources.wood).toBe(1);
  });

  it('discards the producing card', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'e1',
      type: GameEventType.CARD_PRODUCED,
      timestamp: 0,
      cardInstanceId: 1,
      productions: {},
    } as CardProducedEvent);
    expect(result.board).not.toContain(1);
    expect(result.discardPile).toContain(1);
  });
});
