import { makeInstance, makeState } from '../fixtures';
import { CardActionAggregate } from '@engine/application/aggregates/CardActionAggregate';
import { ActionEffectType } from '@engine/domain/enums';
import type { CardAction, CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

describe('CardActionAggregate repeat', () => {
  it('duplicates effect when repeat is a number', () => {
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
    };
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });

    const action: CardAction = {
      id: 'repeat',
      actionEffects: [
        {
          id: 0,
          type: ActionEffectType.ADD_RESOURCES,
          resources: { gold: 1 },
          repeat: 2,
        },
      ],
    };

    const agg = new CardActionAggregate(defs, {}, gs, inst, action);
    agg.resolveAction();

    expect(agg.getGameState().resources.gold).toBe(2);
  });

  it('duplicates effect from instance cumulated when repeat is true', () => {
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
    };
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1, cumulated: 3 });
    const gs = makeState({ board: [1], instances: { 1: inst } });

    const action: CardAction = {
      id: 'repeat-cumulated',
      actionEffects: [
        {
          id: 0,
          type: ActionEffectType.ADD_RESOURCES,
          resources: { gold: 1 },
          repeat: 3,
        },
      ],
    };

    const agg = new CardActionAggregate(defs, {}, gs, inst, action);
    agg.resolveAction();

    expect(agg.getGameState().resources.gold).toBe(3);
  });

  it('does not duplicate effect when repeat is true and cumulated is undefined', () => {
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
    };
    const inst = makeInstance({
      id: 1,
      cardId: 1,
      stateId: 1,
      cumulated: undefined as unknown as number,
    });
    const gs = makeState({ board: [1], instances: { 1: inst } });

    const action: CardAction = {
      id: 'repeat-zero',
      actionEffects: [
        {
          id: 0,
          type: ActionEffectType.ADD_RESOURCES,
          resources: { gold: 1 },
          repeat: 'accumulation',
        },
      ],
    };

    const agg = new CardActionAggregate(defs, {}, gs, inst, action);
    agg.resolveAction();

    expect(agg.getGameState().resources.gold).toBeUndefined();
  });

  it('keeps already selected resources in next CHOOSE_RESOURCE pending choice', () => {
    const defs: Record<number, CardDef> = {
      1: { id: 1, name: 'C', states: [{ id: 1, name: 'S' }] },
    };
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const gs = makeState({ board: [1], instances: { 1: inst } });

    const action: CardAction = {
      id: 'repeat-resource-choice',
      actionEffects: [
        {
          id: 0,
          type: ActionEffectType.ADD_RESOURCES,
          resources: {
            choice: [{ gold: 1 }, { wood: 1 }],
          },
          repeat: 2,
        },
      ],
    };

    const agg = new CardActionAggregate(defs, {}, gs, inst, action);
    agg.resolveAction();

    expect(agg.getPendingChoices()).toHaveLength(1);
    expect(agg.getPendingChoices()[0].selectedChoices).toBeUndefined();

    agg.resolvePlayerChoice({
      id: agg.getPendingChoices()[0].id,
      type: agg.getPendingChoices()[0].kind,
      sourceInstanceId: agg.getPendingChoices()[0].sourceInstanceId,
      resources: { gold: 1 },
    });

    expect(agg.getPendingChoices()).toHaveLength(1);
    expect(agg.getPendingChoices()[0].selectedChoices).toEqual([{ gold: 1 }]);
  });
});
