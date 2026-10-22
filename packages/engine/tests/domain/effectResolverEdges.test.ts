import { makeInstance, makeState } from './fixtures';
import { resolveActionEffect } from '@engine/domain/effects/resolveActionEffect';
import { ActionEffectType, PendingChoiceType, TargetScope } from '@engine/domain/enums';
import type { ActionEffect, CardDef } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

/** Card 1: produces gold or wood, has a free and a stone action, upgrades to 2 or 3. */
const defs: Record<number, CardDef> = {
  1: {
    id: 1,
    name: 'Source',
    states: [
      {
        id: 1,
        name: 'Source',
        productions: [{ gold: 1 }, { wood: 1 }],
        actions: [
          { id: 'free', actionEffects: [] },
          { id: 'paid', cost: { resources: [{ stone: 1 }] }, actionEffects: [] },
        ],
        upgrade: [
          { upgradeTo: 2, cost: {} },
          { upgradeTo: 3, cost: {} },
        ],
      },
      { id: 2, name: 'Second' },
      { id: 3, name: 'Third' },
    ],
  },
  2: { id: 2, name: 'Plain', states: [{ id: 1, name: 'Plain' }] },
};

const state = makeState({
  // Card selectors leave the source out: the others in play are 2 and 6.
  board: [1, 2, 6],
  discoverablePile: [3, 4, 5],
  // Both actions of card 1 can be used.
  resources: { stone: 1 },
  instances: {
    1: makeInstance({ id: 1, cardId: 1 }),
    2: makeInstance({ id: 2, cardId: 2 }),
    3: makeInstance({ id: 3, cardId: 2 }),
    4: makeInstance({ id: 4, cardId: 2 }),
    5: makeInstance({ id: 5, cardId: 2 }),
    6: makeInstance({ id: 6, cardId: 2 }),
  },
});

const resolve = (effect: Omit<ActionEffect, 'id'>, options = {}) =>
  resolveActionEffect({ id: 1, ...effect }, 1, state, defs, {}, options);

describe('resolveActionEffect edge cases', () => {
  it('carries what a foundation unlocks', () => {
    const unlock = { stickers: { 10: 5 } };

    expect(resolve({ type: ActionEffectType.UNLOCK, unlock })[0].unlock).toEqual(unlock);
  });

  it('orders as many cards as counted elements', () => {
    const [, pending] = resolve({
      type: ActionEffectType.ORDER_CARDS,
      valuePerElement: { amount: 1, cards: { scope: [TargetScope.BOARD] }, includeSelf: true },
    });

    expect(pending[0].choices).toEqual([3, 4, 5]);
  });

  it('writes no name without counted cards', () => {
    const [resolved] = resolve({
      type: ActionEffectType.ADD_GLORY,
      writeNames: true,
      valuePerElement: { amount: 1, markedSteps: true },
    });

    expect(resolved.names).toEqual([]);
  });

  it('gains the only resource option at once', () => {
    const [resolved, pending] = resolve({
      type: ActionEffectType.ADD_RESOURCES,
      resources: { choice: [{ gold: 1 }] },
    });

    expect(resolved.resources).toEqual({ gold: 1 });
    expect(pending).toEqual([]);
  });

  it('has no sticker of the last selected card when none was selected', () => {
    const [resolved] = resolve({
      type: ActionEffectType.ADD_STICKER,
      cards: { scope: [TargetScope.SELF] },
      stickers: { producedByLastSelected: true },
    });

    expect(resolved.stickerIds).toEqual([]);
  });
});

describe.each([ActionEffectType.CROSS_OUT_ACTION, ActionEffectType.USE_CARD_ACTION])('%s', type => {
  it('does nothing without cards', () => {
    expect(resolve({ type })).toEqual([expect.objectContaining({ type }), []]);
  });

  it('asks for the card first when several match', () => {
    const [, pending] = resolve({ type, cards: { scope: [TargetScope.BOARD] } });

    expect(pending[0]).toMatchObject({ type: PendingChoiceType.CHOOSE_CARD, choices: [2, 6] });
  });

  it('asks for the action of the only matching card', () => {
    const [, pending] = resolve({ type, cards: { scope: [TargetScope.SELF] } });

    expect(pending[0].type).toBe(PendingChoiceType.CHOOSE_ACTION_EFFECT);
  });
});

describe('UPGRADE_CARD states', () => {
  it('keeps a single listed state', () => {
    const [resolved, pending] = resolve({
      type: ActionEffectType.UPGRADE_CARD,
      cards: { scope: [TargetScope.SELF] },
      states: { ids: [2] },
    });

    expect(resolved.stateId).toBe(2);
    expect(pending).toEqual([]);
  });

  it('asks once for one of several listed states', () => {
    const [, pending] = resolve({
      type: ActionEffectType.UPGRADE_CARD,
      cards: { scope: [TargetScope.SELF] },
      states: { ids: [2, 3] },
    });

    expect(pending.filter(choice => choice.type === PendingChoiceType.CHOOSE_STATE)).toHaveLength(
      1,
    );
  });
});

describe('REMOVE_RESOURCE_ON_CARD', () => {
  const remove = (effect: Partial<ActionEffect>) =>
    resolve({ type: ActionEffectType.REMOVE_RESOURCE_ON_CARD, ...effect });

  it('keeps the card choice when no resource is named', () => {
    const [, pending] = remove({
      cards: { scope: [TargetScope.BOARD], pickNumber: 1 },
      resources: {},
    });

    expect(pending[0].choices).toEqual([2, 6]);
  });

  it('has no target when no card has the resource', () => {
    const [resolved, pending] = remove({
      cards: { scope: [TargetScope.BOARD], pickNumber: 1 },
      resources: { iron: 1 },
    });

    expect(resolved.unresolvable).toBe(true);
    expect(pending).toEqual([]);
  });

  it('still asks which resource of the known card to cross out', () => {
    const [, pending] = remove({
      cards: { scope: [TargetScope.SELF] },
      resources: { choice: [{ gold: 1 }, { wood: 1 }, { iron: 1 }] },
      resourceScopes: ['production'],
    });

    expect(pending[0].choices).toEqual([{ gold: 1 }, { wood: 1 }]);
  });

  it('reads the resources of the action costs', () => {
    const [resolved] = remove({
      cards: { scope: [TargetScope.SELF] },
      resources: { choice: [{ gold: 1 }, { stone: 1 }] },
      resourceScopes: ['actionCost'],
    });

    expect(resolved.resources).toEqual({ stone: 1 });
  });
});
