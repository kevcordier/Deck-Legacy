import { makeInstance, makeState } from './fixtures';
import { GameAggregate } from '@engine/domain/aggregates/GameAggregate';
import { PlaceCardInPileStrategy } from '@engine/domain/cardAction/PlaceCardInDrawPileStrategy';
import { getProductionChoicesForAction } from '@engine/domain/cards/getProductionChoicesForAction';
import { cardSelector } from '@engine/domain/cards/selection/cardSelector';
import { cardShouldStayInPlay } from '@engine/domain/cards/selection/cardShouldStayInPlay';
import { countValuePerElement } from '@engine/domain/cards/selection/countValuePerElement';
import { resolveActionEffect } from '@engine/domain/effects/resolveActionEffect';
import {
  ActionEffectType,
  CardTag,
  PassiveType,
  Phase,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import type { CardAction, CardDef, GameState } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const BLESSING = 38;

const defs: Record<number, CardDef> = {
  1: { id: 1, name: 'Land', states: [{ id: 1, name: 'Land', productions: [{ gold: 1 }] }] },
  2: {
    id: 2,
    name: 'Person',
    states: [
      { id: 1, name: 'Person', tags: [CardTag.PERSON], upgrade: [{ cost: {}, upgradeTo: 2 }] },
      { id: 2, name: 'Person 2', tags: [CardTag.PERSON] },
    ],
  },
  3: {
    id: 3,
    name: 'Sage',
    states: [{ id: 1, name: 'Sage', productions: [{ science: 2 }] }],
  },
  4: { id: 4, name: 'Shrine', states: [{ id: 1, name: 'Shrine', tags: [CardTag.PERMANENT] }] },
};

function stateWith(overrides: Partial<GameState>): GameState {
  return makeState({
    instances: {
      1: makeInstance({ id: 1, cardId: 1 }),
      2: makeInstance({ id: 2, cardId: 2 }),
      3: makeInstance({ id: 3, cardId: 3 }),
      4: makeInstance({ id: 4, cardId: 4 }),
    },
    phase: Phase.PLAYING,
    round: 1,
    turn: 1,
    ...overrides,
  });
}

describe('CHOOSE_EFFECT options with a condition', () => {
  it('offers only the options whose condition holds', () => {
    const state = stateWith({ resources: { gold: 1 } });
    const [, pending] = resolveActionEffect(
      {
        id: 1,
        type: ActionEffectType.CHOOSE_EFFECT,
        effects: [
          { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } },
          {
            id: 2,
            type: ActionEffectType.ADD_RESOURCES,
            resources: { wood: 1 },
            condition: { type: 'resource', resourceType: ResourceType.GOLD, min: 2 },
          },
        ],
      },
      1,
      state,
      defs,
      {},
    );
    expect((pending[0].choices as { id: number }[]).map(option => option.id)).toEqual([1]);
  });
});

describe('PLACE_CARD_IN_PILE on the board', () => {
  it('puts the cards in play first, out of the deck', () => {
    const result = new PlaceCardInPileStrategy().apply(
      stateWith({ drawPile: [1, 2], board: [3] }),
      {
        id: 'x',
        type: ActionEffectType.PLACE_CARD_IN_PILE,
        sourceInstanceId: 3,
        instanceIds: [2],
        deck: 'board',
        position: 'top',
      },
    );
    expect(result.board).toEqual([2, 3]);
    expect(result.drawPile).toEqual([1]);
  });
});

describe('blessed cards', () => {
  it('match a tag through the blessing sticker (orStickerIds)', () => {
    const state = stateWith({ board: [1, 2] });
    state.instances[1].stickers[1] = [BLESSING];
    const blessed = cardSelector(
      { scope: [TargetScope.BOARD], tags: [CardTag.BLESSED], orStickerIds: [BLESSING] },
      -1,
      state,
      defs,
      {},
    );
    expect(blessed).toEqual([1]);
  });

  it('get one of the ADD_PRODUCTION_CHOICE bonuses on each production', () => {
    const state = stateWith({
      board: [1],
      boardEffects: {
        9: [
          {
            id: 'p',
            type: PassiveType.ADD_PRODUCTION_CHOICE,
            cards: { ids: [1] },
            choices: [{ gold: 1 }, { science: 1 }],
          },
        ],
      },
    });
    expect(getProductionChoicesForAction({ gold: 1 }, state, defs, state.instances[1], {})).toEqual(
      [{ gold: 2 }, { gold: 1, science: 1 }],
    );
  });

  it('cannot stay in play under PREVENT_STAY_IN_PLAY, but a permanent still does', () => {
    const state = stateWith({
      board: [1],
      permanents: [4],
      boardEffects: {
        9: [{ id: 'p', type: PassiveType.PREVENT_STAY_IN_PLAY, cards: { ids: [1, 4] } }],
      },
    });
    state.instances[1].stickers[1] = [7];
    expect(cardShouldStayInPlay(1, state, defs)).toBe(false);
    expect(cardShouldStayInPlay(4, state, defs)).toBe(true);
  });
});

describe('UPGRADE_KEEPS_TURN', () => {
  it('upgrades a selected card without ending the turn', () => {
    const state = stateWith({
      board: [2],
      drawPile: [1],
      boardEffects: {
        9: [{ id: 'p', type: PassiveType.UPGRADE_KEEPS_TURN, cards: { tags: [CardTag.PERSON] } }],
      },
    });
    const agg = new GameAggregate('game', state, defs, {});
    agg.upgradeCard(2, 2, {});
    const events = agg.getEvents();
    expect(events.at(-1)).toMatchObject({ keepsTurn: true, endTurnTrigger: {} });
    expect(agg.getGameState().phase).toBe(Phase.PLAYING);
    expect(agg.getGameState().instances[2].stateId).toBe(2);
  });

  it('still ends the turn for the other cards', () => {
    const state = stateWith({ board: [2], drawPile: [1] });
    const agg = new GameAggregate('game', state, defs, {});
    agg.upgradeCard(2, 2, {});
    expect(agg.getEvents().at(-1)).not.toHaveProperty('keepsTurn');
  });
});

describe("'any' cost with amountPer", () => {
  it('applies the effects once per `amountPer` units paid', () => {
    const action: CardAction = {
      id: 'theology',
      cost: { resources: [{ science: 'any' }] },
      amountPer: 3,
      actionEffects: [
        {
          id: 1,
          type: ActionEffectType.ADD_CUMULATED,
          cards: { scope: [TargetScope.SELF] },
          value: 1,
        },
      ],
    };
    const agg = new GameAggregate(
      'game',
      stateWith({ board: [3], resources: { science: 7 } }),
      defs,
      {},
    );
    const gs = agg.cardAction(action, 3, undefined, 7);
    expect(gs.resources.science ?? 0).toBe(0);
    expect(gs.instances[3].cumulated).toBe(2);
  });
});

describe('valuePerElement productionTotal with cards', () => {
  it('sums the production of that resource on the selected cards', () => {
    const state = stateWith({ board: [1, 3] });
    expect(
      countValuePerElement(
        { amount: 1, cards: { scope: [TargetScope.BOARD] }, productionTotal: ResourceType.SCIENCE },
        state,
        -1,
        defs,
        {},
      ),
    ).toBe(2);
  });
});
