import { makeInstance, makeState } from './fixtures';
import { hasActionToSpendResources } from '@engine/domain/cards/hasActionToSpendResources';
import { ActionEffectType, Phase, Trigger } from '@engine/domain/enums';
import type { CardAction, CardDef, GameState } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const addCumulated = [{ id: 1, type: ActionEffectType.ADD_CUMULATED, value: 1 }];
const card = (actions: CardAction[]): Record<number, CardDef> => ({
  1: { id: 1, name: 'C', states: [{ id: 1, name: 'S', actions }] },
});
// Mass Export: "Place goods on this card", any amount, any time.
const deposit: CardAction = {
  id: '1-1-1',
  unlimited: true,
  cost: { resources: [{ goods: 'any' }] },
  actionEffects: addCumulated,
};

const game = (overrides: Partial<GameState>) =>
  makeState({
    permanents: [1],
    instances: { 1: makeInstance({ id: 1, cardId: 1 }) },
    ...overrides,
  });

describe('hasActionToSpendResources', () => {
  it('finds an unlimited action the player can pay after the round ended', () => {
    const gs = game({ phase: Phase.ROUND_END, resources: { goods: 5 } });
    expect(hasActionToSpendResources(gs, card([deposit]), {})).toBe(true);
  });

  it('finds nothing when the resources do not pay the cost', () => {
    const gs = game({ phase: Phase.ROUND_END, resources: { gold: 5 } });
    expect(hasActionToSpendResources(gs, card([deposit]), {})).toBe(false);
  });

  it('leaves out actions that cannot be used outside the turn', () => {
    const turnOnly = { ...deposit, unlimited: false };
    const resources = { goods: 5 };
    expect(
      hasActionToSpendResources(game({ phase: Phase.ROUND_END, resources }), card([turnOnly]), {}),
    ).toBe(false);
    expect(
      hasActionToSpendResources(game({ phase: Phase.PLAYING, resources }), card([turnOnly]), {}),
    ).toBe(true);
  });

  it('leaves out free actions and triggers: they spend no resources', () => {
    const free = { ...deposit, cost: undefined };
    const trigger = { ...deposit, trigger: Trigger.END_OF_ROUND };
    const gs = game({ phase: Phase.ROUND_END, resources: { goods: 5 } });
    expect(hasActionToSpendResources(gs, card([free, trigger]), {})).toBe(false);
  });

  it('leaves out an action whose condition does not hold', () => {
    const conditional = {
      ...deposit,
      condition: { type: 'resource' as const, resourceType: 'goods' as never, min: 10 },
    };
    const gs = game({ phase: Phase.ROUND_END, resources: { goods: 5 } });
    expect(hasActionToSpendResources(gs, card([conditional]), {})).toBe(false);
  });
});
