import { makeDefs, makeInstance, makeState } from './fixtures';
import { sanitizeChoice } from '@engine/application/session/input/sanitizeChoice';
import { sanitizeCost } from '@engine/application/session/input/sanitizeCost';
import { CrossOutActionStrategy } from '@engine/domain/cardAction/CrossOutActionStrategy';
import { RemoveResourceOnCardStrategy } from '@engine/domain/cardAction/RemoveResourceOnCardStrategy';
import { UnblockCardStrategy } from '@engine/domain/cardAction/UnblockCardStrategy';
import { canAffordTrackAdvanceCost } from '@engine/domain/cards/canAffordTrackAdvanceCost';
import { getEffectiveUpgradeCost } from '@engine/domain/cards/getEffectiveUpgradeCost';
import { getUsableActionEffects } from '@engine/domain/cards/getUsableActionEffects';
import { cardShouldStayInPlay } from '@engine/domain/cards/selection/cardShouldStayInPlay';
import { matchHaving } from '@engine/domain/cards/selection/matchHaving';
import { withGainReplacement } from '@engine/domain/effects/withGainReplacement';
import {
  ActionEffectType,
  PassiveType,
  PendingChoiceType,
  TargetScope,
} from '@engine/domain/enums';
import { OrderChoiceStrategy } from '@engine/domain/playerChoice/OrderChoiceStrategy';
import { checkpointSeq } from '@engine/domain/state/checkpointSeq';
import type { CardAction, PendingChoice, ResolvedActionEffect } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const payload = (overrides: Partial<ResolvedActionEffect>): ResolvedActionEffect => ({
  id: 'x',
  type: ActionEffectType.ADD_RESOURCES,
  sourceInstanceId: 1,
  ...overrides,
});

describe('effects on a missing card', () => {
  it('leave the state unchanged', () => {
    const state = makeState();

    expect(
      new CrossOutActionStrategy().apply(
        state,
        payload({ crossedOutAction: { instanceId: 9, actionId: '1-1-1' } }),
      ),
    ).toBe(state);
    expect(new UnblockCardStrategy().apply(state, payload({ instanceIds: [2] }))).toBe(state);
    expect(getUsableActionEffects(9, state, makeDefs(), {})).toEqual([]);
  });

  it('gives no sticker when the card that should get it is gone', () => {
    const state = makeState({
      instances: { 1: makeInstance() },
      stickerStock: { 1: 1 },
    });
    const after = new RemoveResourceOnCardStrategy({ 1: { id: 1, production: 'gold' } }).apply(
      state,
      payload({
        type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
        instanceIds: [1],
        resources: { gold: 1 },
        stickerHere: true,
        stickerTargetId: 9,
      }),
    );

    expect(after.stickerStock).toEqual({ 1: 1 });
  });

  it('match no having criteria', () => {
    const ctx = {
      gameState: makeState(),
      defs: makeDefs(),
      stickerDefs: {},
      selector: { having: { minGlory: 1 } },
    };

    expect(matchHaving(9, 1, ctx)).toBe(false);
  });
});

describe('canAffordTrackAdvanceCost on a track in any order', () => {
  const defs = makeDefs({
    states: [
      {
        id: 1,
        name: 'S',
        track: {
          inOrder: false,
          steps: [{ id: 1, cost: { resources: [{ gold: 1 }] } }, { id: 2 }],
        },
      },
    ],
  });
  const action: CardAction = {
    id: '1-1-1',
    actionEffects: [{ id: 1, type: ActionEffectType.TRACK_ADVANCE }],
  };

  it('needs one unmarked step the player can pay', () => {
    const instance = makeInstance({ trackProgress: [2] });

    expect(
      canAffordTrackAdvanceCost(
        action,
        instance,
        makeState({ instances: { 1: instance } }),
        defs,
        {},
      ),
    ).toBe(false);
    const rich = makeState({ instances: { 1: instance }, resources: { gold: 1 } });
    expect(canAffordTrackAdvanceCost(action, instance, rich, defs, {})).toBe(true);
  });
});

describe('passives without their resources', () => {
  it('change neither upgrade costs nor gains', () => {
    const state = makeState({
      instances: { 1: makeInstance(), 2: makeInstance({ id: 2 }) },
      board: [1, 2],
      boardEffects: {
        1: [
          { id: 'p', type: PassiveType.ADJUST_UPDATE_COST },
          { id: 'p', type: PassiveType.STAY_IN_PLAY },
          { id: 'p', type: PassiveType.REPLACE_GAIN },
        ],
      },
    });
    const gain = { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } };

    expect(
      getEffectiveUpgradeCost({ resources: [{ gold: 2 }] }, state, makeDefs(), {}, 2).resources,
    ).toEqual([{ gold: 2 }]);
    expect(withGainReplacement(gain, state)).toBe(gain);
  });
});

describe('cardShouldStayInPlay', () => {
  const defs = makeDefs();
  const card = (id: number) => makeInstance({ id });

  it('keeps the source of a STAY_IN_PLAY passive without cards', () => {
    const state = makeState({
      instances: { 1: card(1) },
      board: [1],
      boardEffects: { 1: [{ id: 'p', type: PassiveType.STAY_IN_PLAY }] },
    });

    expect(cardShouldStayInPlay(1, state, defs)).toBe(true);
  });

  it('keeps a card held by a permanent', () => {
    const state = makeState({
      instances: { 1: card(1), 2: card(2) },
      board: [1],
      permanents: [2],
      boardEffects: { 2: [{ id: 'p', type: PassiveType.BLOCK, cards: { ids: [1] } }] },
    });

    expect(cardShouldStayInPlay(1, state, defs)).toBe(true);
  });

  it('keeps the cards a STAY_IN_PLAY passive names, and the ones they block', () => {
    // Card 3 is not on the board, so out of the selector's scope, but the passive names it.
    const state = makeState({
      instances: { 1: card(1), 2: card(2), 3: card(3) },
      board: [1, 2],
      boardEffects: {
        1: [
          {
            id: 'p',
            type: PassiveType.STAY_IN_PLAY,
            cards: { scope: [TargetScope.BOARD], ids: [3] },
          },
        ],
        3: [{ id: 'p', type: PassiveType.BLOCK, cards: { ids: [2] } }],
      },
    });

    expect(cardShouldStayInPlay(3, state, defs)).toBe(true);
    expect(cardShouldStayInPlay(2, state, defs)).toBe(true);
  });
});

describe('player input', () => {
  const pending = (type: PendingChoiceType, kind: ActionEffectType): PendingChoice => ({
    id: '1-cost',
    kind,
    type,
    sourceInstanceId: 1,
    choices: [],
    pickMin: 0,
    pickMax: 0,
    isMandatory: true,
  });

  it('pays a split cost only with resolvePayCost', () => {
    const split = pending(PendingChoiceType.SPLIT_RESOURCES, ActionEffectType.COST);

    expect(
      sanitizeChoice(payload({ resources: { gold: 2 } }), PendingChoiceType.SPLIT_RESOURCES, {
        ...split,
        kind: ActionEffectType.ADD_RESOURCES,
      }),
    ).toBeNull();
    expect(
      sanitizeCost({ resources: { gold: 5 }, discardedCardIds: [], destroyedCardIds: [] }, split),
    ).toBeNull();
  });
});

describe('OrderChoiceStrategy', () => {
  it('keeps the order and the destroyed card the player gave', () => {
    const order = payload({ type: ActionEffectType.ORDER_CARDS });
    const pending = { id: 'p' } as PendingChoice;

    expect(new OrderChoiceStrategy().apply(order, order, makeState(), [pending])).toEqual([
      { ...order, instanceIds: [], destroyedIds: [] },
      [],
    ]);
  });
});

describe('checkpointSeq', () => {
  it('has no checkpoint before the first turn', () => {
    expect(checkpointSeq([])).toBe(0);
  });
});
