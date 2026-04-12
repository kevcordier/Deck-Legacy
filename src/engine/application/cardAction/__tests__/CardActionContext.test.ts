import { CardActionContext } from '@engine/application/cardAction/CardActionContext';
import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { ActionType } from '@engine/domain/enums';
import type { GameState, ResolvedAction } from '@engine/domain/types';
import { describe, expect, it, vi } from 'vitest';

const makeGameState = (overrides: Partial<GameState> = {}): GameState => ({
  instances: {},
  drawPile: [],
  discardPile: [],
  board: [],
  destroyedPile: [],
  permanents: [],
  blockingCards: {},
  resources: {},
  stickerStock: {},
  discoveryPile: [],
  triggerPile: {},
  lastAddedIds: [],
  round: 0,
  turn: 0,
  ...overrides,
});

const makeResolvedAction = (overrides: Partial<ResolvedAction> = {}): ResolvedAction => ({
  id: '1-1',
  type: ActionType.ADD_RESOURCES,
  sourceInstanceId: 1,
  ...overrides,
});

describe('CardActionContext', () => {
  it('throws when no strategy is set', () => {
    const context = new CardActionContext();
    const gs = makeGameState();
    expect(() => context.applyEffect(gs, makeResolvedAction())).toThrow(
      'CardActionStrategy not set in CardActionContext',
    );
  });

  it('delegates applyEffect to the set strategy', () => {
    const context = new CardActionContext();
    const gs = makeGameState();
    const modifiedGs = makeGameState({ resources: { gold: 5 } });
    const mockStrategy: CardActionStrategy = {
      applyEffect: vi.fn().mockReturnValue(modifiedGs),
    };

    context.setStrategy(mockStrategy);
    const result = context.applyEffect(gs, makeResolvedAction());

    expect(mockStrategy.applyEffect).toHaveBeenCalledWith(gs, makeResolvedAction());
    expect(result).toBe(modifiedGs);
  });

  it('uses the last set strategy when setStrategy is called multiple times', () => {
    const context = new CardActionContext();
    const gs = makeGameState();
    const firstGs = makeGameState({ resources: { gold: 1 } });
    const secondGs = makeGameState({ resources: { gold: 2 } });

    const firstStrategy: CardActionStrategy = {
      applyEffect: vi.fn().mockReturnValue(firstGs),
    };
    const secondStrategy: CardActionStrategy = {
      applyEffect: vi.fn().mockReturnValue(secondGs),
    };

    context.setStrategy(firstStrategy);
    context.setStrategy(secondStrategy);
    const result = context.applyEffect(gs, makeResolvedAction());

    expect(firstStrategy.applyEffect).not.toHaveBeenCalled();
    expect(secondStrategy.applyEffect).toHaveBeenCalled();
    expect(result).toBe(secondGs);
  });
});
