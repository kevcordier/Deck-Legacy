import { makeInstance, makeState } from './fixtures';
import { GameAggregate } from '@engine/application/aggregates/GameAggregate';
import { canAffordCost, getEffectiveActionCost } from '@engine/application/cardHelpers';
import { fixResources, hasAnyAmountCost } from '@engine/application/resources';
import { ActionEffectType, Phase, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardAction, CardDef, GameState } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const depositAction: CardAction = {
  id: 'deposit',
  unlimited: true,
  cost: { resources: [{ [ResourceType.GOODS]: 'any' }] },
  actionEffects: [
    { id: 1, type: ActionEffectType.ADD_CUMULATED, cards: { scope: [TargetScope.SELF] }, value: 1 },
  ],
};

const depositDef: CardDef = {
  id: 1,
  name: 'Deposit',
  states: [{ id: 1, name: 'S', permanent: true, actions: [depositAction] }],
};

function makeAggregate(goods: number) {
  const state: GameState = makeState({
    permanents: [1],
    instances: { 1: makeInstance({ id: 1, cardId: 1 }) },
    resources: { [ResourceType.GOODS]: goods },
    phase: Phase.PLAYING,
    round: 1,
    turn: 1,
  });
  return new GameAggregate(crypto.randomUUID(), state, { 1: depositDef }, {}, []);
}

describe("'any' amount resource cost", () => {
  it('replaces the any amount and detects it', () => {
    expect(fixResources({ goods: 'any', wood: 2 }, 3)).toEqual({ goods: 3, wood: 2 });
    expect(fixResources({ goods: 'any' })).toEqual({ goods: 1 });
    expect(hasAnyAmountCost(depositAction.cost)).toBe(true);
    expect(hasAnyAmountCost({ resources: [{ goods: 1 }] })).toBe(false);
    expect(hasAnyAmountCost(undefined)).toBe(false);
    expect(getEffectiveActionCost(depositAction.cost, makeInstance(), 4).resources).toEqual([
      { goods: 4 },
    ]);
  });

  it('needs at least one unit to be affordable', () => {
    const state = makeState({ instances: { 1: makeInstance() }, resources: { goods: 0 } });
    expect(canAffordCost(depositAction.cost, 1, state, { 1: depositDef }, {})).toBe(false);
    state.resources.goods = 1;
    expect(canAffordCost(depositAction.cost, 1, state, { 1: depositDef }, {})).toBe(true);
  });

  it('pays the chosen amount and applies the effects once per unit', () => {
    const gs = makeAggregate(5).cardAction(depositAction, 1, undefined, 3);
    expect(gs.resources.goods).toBe(2);
    expect(gs.instances[1].cumulated).toBe(3);
  });

  it('pays one unit when no amount is given', () => {
    const gs = makeAggregate(5).cardAction(depositAction, 1);
    expect(gs.resources.goods).toBe(4);
    expect(gs.instances[1].cumulated).toBe(1);
  });

  it('does nothing for an amount below one', () => {
    const gs = makeAggregate(5).cardAction(depositAction, 1, undefined, 0);
    expect(gs.resources.goods).toBe(5);
    expect(gs.instances[1].cumulated).toBe(0);
  });

  it('refuses an amount above the stock', () => {
    expect(() => makeAggregate(2).cardAction(depositAction, 1, undefined, 3)).toThrow();
  });
});
