import { makeInstance, makeState } from './fixtures';
import { GameAggregate } from '@engine/domain/aggregates/GameAggregate';
import { CrossOutGloryStrategy } from '@engine/domain/cardAction/CrossOutGloryStrategy';
import { RemoveResourceOnCardStrategy } from '@engine/domain/cardAction/RemoveResourceOnCardStrategy';
import { SaveFromPurgeStrategy } from '@engine/domain/cardAction/SaveFromPurgeStrategy';
import { countValuePerElement } from '@engine/domain/cards/selection/countValuePerElement';
import { getEffectiveGlory } from '@engine/domain/cards/selection/getEffectiveGlory';
import { getPurgeGlory } from '@engine/domain/cards/selection/getPurgeGlory';
import { resolveActionEffect } from '@engine/domain/effects/resolveActionEffect';
import { ActionEffectType, CardTag, PassiveType, Phase, TargetScope } from '@engine/domain/enums';
import type { CardAction, CardDef, GameState, PurgeState, Sticker } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const stickers: Record<number, Sticker> = {
  1: { id: 1, production: 'gold' },
  2: { id: 2, production: 'wood' },
};

const defs: Record<number, CardDef> = {
  1: {
    id: 1,
    name: 'Farm',
    states: [{ id: 1, name: 'Farm', productions: [{ gold: 1 }], glory: { amount: 2 } }],
  },
  2: {
    id: 2,
    name: 'Fortress',
    states: [
      {
        id: 1,
        name: 'Fortress',
        tags: [CardTag.PERMANENT],
        glory: { amount: 5 },
        passives: [
          { id: 'min', type: PassiveType.PURGE_MIN_GLORY, amount: 5 },
          { id: 'adjust', type: PassiveType.ADJUST_PURGE, amount: 1 },
        ],
        track: { inOrder: true, steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
      },
    ],
  },
};

function stateWith(overrides: Partial<GameState> = {}): GameState {
  return makeState({
    instances: {
      1: makeInstance({ id: 1, cardId: 1 }),
      2: makeInstance({ id: 2, cardId: 2 }),
      3: makeInstance({ id: 3, cardId: 1 }),
    },
    ...overrides,
  });
}

describe('purge glory', () => {
  it('counts the cards kept with their glory, and a minimum when a PURGE_MIN_GLORY card is purged', () => {
    const state = stateWith();
    expect(getPurgeGlory([1], [3], state, defs, {})).toBe(4);
    expect(getPurgeGlory([1, 2], [], state, defs, {})).toBe(10);
  });

  it('keeps the glory of a card saved with keepGlory', () => {
    const purgeState = {
      selectedCardIds: [1, 3],
      selectedPermanentIds: [],
    } as unknown as PurgeState;
    const saved = new SaveFromPurgeStrategy().apply(stateWith({ purgeState }), {
      id: 'x',
      type: ActionEffectType.SAVE_FROM_PURGE,
      sourceInstanceId: 1,
      instanceIds: [1],
      keepGlory: true,
    });
    expect(saved.purgeState).toMatchObject({ selectedCardIds: [3], keptGloryIds: [1] });
  });

  it('is larger by ADJUST_PURGE of the permanents', () => {
    const state = stateWith({ phase: Phase.GAME_OVER, permanents: [2], drawPile: [1, 3] });
    const agg = new GameAggregate('game', state, defs, {}, []);
    agg.selectExpansion('Nobles', { purge: { permanent: 0, purge: 8 }, campaign: [] });
    expect(agg.getGameState().purgeState?.batchSize).toBe(9);
  });
});

describe('crossed out glory', () => {
  it('makes the current state worth nothing', () => {
    const state = new CrossOutGloryStrategy().apply(stateWith(), {
      id: 'x',
      type: ActionEffectType.CROSS_OUT_GLORY,
      sourceInstanceId: 2,
      instanceIds: [1, 99],
    });
    const instance = state.instances[1];
    expect(instance.crossedOutGloryStates).toEqual([1]);
    expect(getEffectiveGlory(defs[1].states[0], state, defs, instance, {})).toBe(0);
    const empty = stateWith();
    expect(
      new CrossOutGloryStrategy().apply(empty, {
        id: 'x',
        type: ActionEffectType.CROSS_OUT_GLORY,
        sourceInstanceId: 2,
      }),
    ).toBe(empty);
  });
});

describe('stickerHere', () => {
  const crossOut = (stickerStock: Record<number, number>) =>
    new RemoveResourceOnCardStrategy(stickers).apply(stateWith({ stickerStock }), {
      id: 'x',
      type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
      sourceInstanceId: 2,
      instanceIds: [1],
      resources: { gold: 1 },
      resourceScopes: ['production'],
      stickerHere: true,
    });

  it('gives the source the sticker of the resource crossed out, from the stock', () => {
    const state = crossOut({ 1: 1 });
    expect(state.instances[2].stickers[1]).toEqual([1]);
    expect(state.stickerStock[1]).toBe(0);
    expect(crossOut({}).instances[2].stickers[1]).toBeUndefined();
  });
});

describe('stickers of the last selected card', () => {
  it('offers the stickers of what it produces', () => {
    const [resolved] = resolveActionEffect(
      {
        id: 1,
        type: ActionEffectType.ADD_STICKER,
        cards: { scope: [TargetScope.SELF] },
        stickers: { producedByLastSelected: true, pickNumber: 1 },
      },
      2,
      stateWith({ stickerStock: { 1: 1, 2: 1 } }),
      defs,
      stickers,
      { lastSelectedIds: [1] },
    );
    expect(resolved.stickerIds).toEqual([1]);
  });
});

describe('values per element', () => {
  it('count the marked boxes and add `plus`', () => {
    const state = stateWith();
    state.instances[2].trackProgress = [1, 2];
    expect(countValuePerElement({ amount: 1, markedSteps: true }, state, 2, defs, {})).toBe(2);
    expect(
      countValuePerElement({ amount: 1, markedSteps: true, plus: 7 }, state, 2, defs, {}),
    ).toBe(9);
  });
});

describe('keepSelection', () => {
  it('leaves the last selected card for the next effects', () => {
    const action: CardAction = {
      id: 'house',
      unlimited: true,
      actionEffects: [
        {
          id: 1,
          type: ActionEffectType.ADD_CUMULATED,
          value: 0,
          cards: { ids: [1, 3], pickNumber: 1 },
        },
        {
          id: 2,
          type: ActionEffectType.ADD_CUMULATED,
          value: 1,
          cards: { scope: [TargetScope.SELF] },
          keepSelection: true,
        },
        {
          id: 3,
          type: ActionEffectType.DESTROY_CARD,
          cards: { scope: [TargetScope.LAST_SELECTED] },
        },
      ],
    };
    const agg = new GameAggregate('game', stateWith({ permanents: [2], board: [1, 3] }), defs, {});
    agg.cardAction(action, 2);
    const [choice] = agg.getCurrentCardAction()?.getPendingChoices() ?? [];
    agg.resolveCardActionChoice(
      {
        id: choice.id,
        type: choice.kind,
        sourceInstanceId: choice.sourceInstanceId,
        instanceIds: [3],
      },
      choice.type,
    );
    expect(agg.getGameState().destroyedPile).toEqual([3]);
    expect(agg.getGameState().instances[2].cumulated).toBe(1);
  });
});
