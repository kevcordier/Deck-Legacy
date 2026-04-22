import { makeGameState, makeInstance } from '../testHelpers';
import { GameStartedStrategy } from '@engine/application/gameEvent/GameStartedStrategy';
import { GameEventType } from '@engine/domain/enums';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it } from 'vitest';

const makeEvent = (
  overrides: Partial<{
    cardInstances: ReturnType<typeof makeInstance>[];
    initialDeck: number[];
    stickerStock: Record<string, number>;
    discoveryPile: number[];
  }> = {},
) => ({
  id: 'evt-1',
  type: GameEventType.GAME_STARTED,
  timestamp: 0,
  cardInstances: [],
  initialDeck: [],
  stickerStock: {},
  discoveryPile: [],
  ...overrides,
});

describe('GameStartedStrategy', () => {
  const strategy = new GameStartedStrategy();

  it('populates instances from cardInstances', () => {
    const instances = [makeInstance(1, 10, 1), makeInstance(2, 11, 1)];
    const result = strategy.apply(makeGameState(), makeEvent({ cardInstances: instances }));
    expect(result.instances[1]).toEqual(instances[0]);
    expect(result.instances[2]).toEqual(instances[1]);
  });

  it('sets drawPile from initialDeck', () => {
    const result = strategy.apply(makeGameState(), makeEvent({ initialDeck: [1, 2, 3] }));
    expect(result.drawPile).toEqual([1, 2, 3]);
  });

  it('sets stickerStock from the event', () => {
    const result = strategy.apply(makeGameState(), makeEvent({ stickerStock: { 5: 3, 7: 1 } }));
    expect(result.stickerStock).toEqual({ 5: 3, 7: 1 });
  });

  it('sets discoveryPile from the event', () => {
    const result = strategy.apply(makeGameState(), makeEvent({ discoveryPile: [10, 20] }));
    expect(result.discoveryPile).toEqual([10, 20]);
  });

  it('sets round and turn to 0', () => {
    const result = strategy.apply(makeGameState({ round: 5, turn: 3 }), makeEvent());
    expect(result.round).toBe(0);
    expect(result.turn).toBe(0);
  });

  it('sets phase to PREGAME', () => {
    const result = strategy.apply(makeGameState(), makeEvent());
    expect(result.phase).toBe(Phase.PREGAME);
  });
});
