import { makeDefs, makeInstance, makeState, makeStickerDefs } from '../fixtures';
import { CardActionContext } from '@engine/application/cardAction/CardActionContext';
import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import type { GameState, ResolvedActionEffect } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

describe('CardActionContext', () => {
  it('dispatches ADD_RESOURCES to AddResourceStrategy', () => {
    const ctx = new CardActionContext(makeDefs(), makeStickerDefs());
    const gs = makeState({ resources: { gold: 0 } });
    const result = ctx.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 1,
      resources: { gold: 5 },
    });
    expect(result.resources.gold).toBe(5);
  });

  it('uses setStrategy when provided', () => {
    const ctx = new CardActionContext(makeDefs(), makeStickerDefs());
    const newGs = makeState({ resources: { wood: 99 } });
    const mockStrategy: CardActionStrategy = {
      apply: (_gs: GameState, _payload: ResolvedActionEffect) => newGs,
    };
    ctx.setStrategy(mockStrategy);
    const result = ctx.apply(makeState(), {
      id: 'x',
      type: ActionEffectType.DISCARD_CARD,
      sourceInstanceId: 1,
    });
    expect(result.resources.wood).toBe(99);
  });

  it('dispatches DISCARD_CARD', () => {
    const ctx = new CardActionContext(makeDefs(), makeStickerDefs());
    const gs = makeState({ board: [1] });
    const result = ctx.apply(gs, {
      id: 'x',
      type: ActionEffectType.DISCARD_CARD,
      sourceInstanceId: 99,
      instanceIds: [1],
    });
    expect(result.discardPile).toContain(1);
  });

  it('dispatches DESTROY_CARD', () => {
    const ctx = new CardActionContext(makeDefs(), makeStickerDefs());
    const gs = makeState({ board: [1] });
    const result = ctx.apply(gs, {
      id: 'x',
      type: ActionEffectType.DESTROY_CARD,
      sourceInstanceId: 99,
      instanceIds: [1],
    });
    expect(result.destroyedPile).toContain(1);
  });

  it('dispatches CHOOSE_STATE', () => {
    const ctx = new CardActionContext(makeDefs(), makeStickerDefs());
    const inst = makeInstance({ id: 1, stateId: 1 });
    const gs = makeState({ instances: { 1: inst } });
    const result = ctx.apply(gs, {
      id: 'x',
      type: ActionEffectType.CHOOSE_STATE,
      sourceInstanceId: 1,
      instanceIds: [1],
      stateId: 2,
    });
    expect(result.instances[1].stateId).toBe(2);
  });

  it('dispatches SHUFFLE_DECK on discard pile', () => {
    const ctx = new CardActionContext(makeDefs(), makeStickerDefs());
    const gs = makeState({ discardPile: [1, 2, 3] });
    const result = ctx.apply(gs, {
      id: 'x',
      type: ActionEffectType.SHUFFLE_DECK,
      sourceInstanceId: 1,
      deck: 'discard',
    });

    expect(result.discardPile).toHaveLength(3);
    expect([...result.discardPile].sort((a, b) => a - b)).toEqual([1, 2, 3]);
  });

  it('dispatches SET_LAST_ROUND', () => {
    const ctx = new CardActionContext(makeDefs(), makeStickerDefs());
    const gs = makeState({ isLastRound: false });
    const result = ctx.apply(gs, {
      id: 'x',
      type: ActionEffectType.SET_LAST_ROUND,
      sourceInstanceId: 1,
    });

    expect(result.isLastRound).toBe(true);
  });

  it('throws when no strategy is found for the action type', () => {
    const ctx = new CardActionContext(makeDefs(), makeStickerDefs());
    const gs = makeState();
    expect(() =>
      ctx.apply(gs, {
        id: 'x',
        type: 'UNKNOWN_TYPE' as never,
        sourceInstanceId: 1,
      }),
    ).toThrow('CardActionStrategy not set in CardActionContext');
  });
});
