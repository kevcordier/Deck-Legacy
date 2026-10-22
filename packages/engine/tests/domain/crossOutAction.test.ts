import { makeInstance, makeState } from './fixtures';
import { GameAggregate } from '@engine/domain/aggregates/GameAggregate';
import { getStateActions } from '@engine/domain/cards/selection/getStateActions';
import { ActionEffectType, PendingChoiceType, Phase, Trigger } from '@engine/domain/enums';
import type { CardAction, CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const effect = (id: string, extra: Partial<CardAction> = {}): CardAction => ({
  id,
  actionEffects: [{ id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } }],
  ...extra,
});

const target = (actions: CardAction[]): CardDef => ({
  id: 2,
  name: 'Target',
  states: [{ id: 1, name: 'Target', actions }],
});

const archer: CardDef = { id: 1, name: 'Archer', states: [{ id: 1, name: 'Archer' }] };

const crossOut: CardAction = {
  id: 'cross',
  unlimited: true,
  actionEffects: [{ id: 1, type: ActionEffectType.CROSS_OUT_ACTION, cards: { ids: [20] } }],
};

function play(targetDef: CardDef) {
  const state = makeState({
    phase: Phase.PLAYING,
    board: [10],
    drawPile: [20],
    instances: {
      10: makeInstance({ id: 10, cardId: 1, stateId: 1 }),
      20: makeInstance({ id: 20, cardId: 2, stateId: 1 }),
    },
  });
  const defs = { 1: archer, 2: targetDef };
  const agg = new GameAggregate(crypto.randomUUID(), state, defs, {}, []);
  agg.cardAction(crossOut, 10);
  const actionsOf = () =>
    getStateActions(agg.getGameState().instances[20], defs, {}).map(action => action.id);
  return { agg, actionsOf };
}

describe('CROSS_OUT_ACTION', () => {
  it('lets the player choose which activated effect to cross out', () => {
    const { agg, actionsOf } = play(
      target([
        effect('a'),
        effect('b'),
        effect('time', { endsTurn: true }),
        effect('trigger', { trigger: Trigger.END_OF_TURN }),
      ]),
    );
    const [choice] = agg.getCurrentCardAction()?.getPendingChoices() ?? [];
    expect(choice.type).toBe(PendingChoiceType.CHOOSE_ACTION_EFFECT);
    expect(choice.choices).toHaveLength(2);

    agg.resolveCardActionChoice(
      {
        id: choice.id,
        type: choice.kind,
        sourceInstanceId: choice.sourceInstanceId,
        newActionEffects: [choice.choices[1] as never],
      },
      choice.type,
    );

    expect(actionsOf()).toEqual(['a', 'time', 'trigger']);
  });

  it('crosses out the only activated effect directly', () => {
    const { agg, actionsOf } = play(target([effect('a'), effect('time', { endsTurn: true })]));
    expect(agg.getCurrentCardAction()?.getPendingChoices() ?? []).toEqual([]);
    expect(actionsOf()).toEqual(['time']);
  });
});
