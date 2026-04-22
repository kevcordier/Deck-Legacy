import { makeGameState } from '../testHelpers';
import { TurnEndedStrategy } from '@engine/application/gameEvent/TurnEndedStrategy';
import { ActionType, GameEventType } from '@engine/domain/enums';
import type { CardAction } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it } from 'vitest';

const makeCardAction = (): CardAction => ({
  id: 'action-1',
  actionEffects: [{ id: 1, type: ActionType.ADD_RESOURCES }],
});

const makeEvent = (
  overrides: Partial<{
    onTurnEndedEvents: { effectDef: CardAction; sourceInstanceId: number }[];
  }> = {},
) => ({
  id: 'evt-1',
  type: GameEventType.TURN_ENDED,
  timestamp: 0,
  onTurnEndedEvents: [],
  ...overrides,
});

describe('TurnEndedStrategy', () => {
  const strategy = new TurnEndedStrategy();

  it('sets phase to END_TURN', () => {
    const result = strategy.apply(makeGameState(), makeEvent());
    expect(result.phase).toBe(Phase.END_TURN);
  });

  it('populates triggerPile from onTurnEndedEvents', () => {
    const effectDef = makeCardAction();
    const result = strategy.apply(
      makeGameState(),
      makeEvent({ onTurnEndedEvents: [{ effectDef, sourceInstanceId: 3 }] }),
    );
    const entries = Object.values(result.triggerPile);
    expect(entries).toHaveLength(1);
    expect(entries[0].effectDef).toEqual(effectDef);
    expect(entries[0].sourceInstanceId).toBe(3);
  });

  it('creates empty triggerPile when no onTurnEndedEvents', () => {
    const gs = makeGameState({
      triggerPile: { 'old-key': { effectDef: makeCardAction(), sourceInstanceId: 99 } },
    });
    const result = strategy.apply(gs, makeEvent({ onTurnEndedEvents: [] }));
    expect(result.triggerPile).toEqual({});
  });

  it('populates triggerPile with multiple events', () => {
    const result = strategy.apply(
      makeGameState(),
      makeEvent({
        onTurnEndedEvents: [
          { effectDef: makeCardAction(), sourceInstanceId: 1 },
          { effectDef: makeCardAction(), sourceInstanceId: 2 },
        ],
      }),
    );
    expect(Object.keys(result.triggerPile)).toHaveLength(2);
  });

  it('does not alter resources', () => {
    const gs = makeGameState({ resources: { gold: 4 } });
    const result = strategy.apply(gs, makeEvent());
    expect(result.resources).toEqual({ gold: 4 });
  });
});
