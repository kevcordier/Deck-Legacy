import {
  isFlowCommandAllowed,
  sanitizeChoice,
  sanitizeCost,
} from '@engine/application/session/playerInput';
import { EMPTY_STATE } from '@engine/domain/emptyState';
import { ActionEffectType, PendingChoiceType, Phase } from '@engine/domain/enums';
import type { GameState, PendingChoice, ResolvedActionEffect } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

function pending(overrides: Partial<PendingChoice>): PendingChoice {
  return {
    id: '3-1',
    kind: ActionEffectType.DISCARD_CARD,
    type: PendingChoiceType.CHOOSE_CARD,
    sourceInstanceId: 3,
    choices: [1, 2, 4],
    pickMin: 1,
    pickMax: 2,
    isMandatory: true,
    ...overrides,
  };
}

const forged = {
  id: 'x',
  type: ActionEffectType.ADD_GLORY,
  sourceInstanceId: 99,
  value: 50,
} as ResolvedActionEffect;

const state = (overrides: Partial<GameState>): GameState => ({ ...EMPTY_STATE, ...overrides });

describe('isFlowCommandAllowed', () => {
  it('only allows the turn flow commands the UI offers in each phase', () => {
    const roundEnd = state({ phase: Phase.ROUND_END });

    expect(isFlowCommandAllowed({ type: 'startRound' }, roundEnd, false)).toBe(true);
    expect(
      isFlowCommandAllowed({ type: 'startRound' }, state({ phase: Phase.PLAYING }), false),
    ).toBe(false);
    expect(isFlowCommandAllowed({ type: 'endRound' }, roundEnd, false)).toBe(false);
    expect(isFlowCommandAllowed({ type: 'startRound' }, roundEnd, true)).toBe(false);
    expect(isFlowCommandAllowed({ type: 'endRound' }, roundEnd, true)).toBe(true);
    expect(
      isFlowCommandAllowed(
        { type: 'endRound' },
        state({ phase: Phase.TURN_END, drawPile: [1] }),
        false,
      ),
    ).toBe(false);
    expect(
      isFlowCommandAllowed({ type: 'startTurn' }, state({ phase: Phase.PLAYING }), false),
    ).toBe(false);
    expect(isFlowCommandAllowed({ type: 'endTurn' }, state({ phase: Phase.TURN_END }), false)).toBe(
      false,
    );
    expect(isFlowCommandAllowed({ type: 'selectExpansion', name: 'x' }, roundEnd, false)).toBe(
      false,
    );
    expect(isFlowCommandAllowed({ type: 'skipChoice' }, roundEnd, false)).toBe(true);
  });
});

describe('sanitizeChoice', () => {
  it('keeps only the selection, rebuilt from the pending choice', () => {
    const choice = { ...forged, instanceIds: [1, 2] };

    expect(sanitizeChoice(choice, PendingChoiceType.CHOOSE_CARD, pending({}))).toEqual({
      id: '3-1',
      type: ActionEffectType.DISCARD_CARD,
      sourceInstanceId: 3,
      instanceIds: [1, 2],
    });
  });

  it('refuses cards that are not offered, repeated or above the maximum', () => {
    const choose = (instanceIds: number[], overrides: Partial<PendingChoice> = {}) =>
      sanitizeChoice({ ...forged, instanceIds }, PendingChoiceType.CHOOSE_CARD, pending(overrides));

    expect(choose([7])).toBeNull();
    expect(choose([1, 1])).toBeNull();
    expect(choose([1, 2, 4])).toBeNull();
    expect(choose([])).toBeNull();
    expect(choose([], { pickMin: 0 })).not.toBeNull();
    // A card listed twice counts for two (COUNT_AS_2).
    expect(choose([1], { choices: [1, 1, 2], pickMin: 2 })).not.toBeNull();
  });

  it('refuses a choice of another type, or a cost', () => {
    const choice = { ...forged, instanceIds: [1] };

    expect(sanitizeChoice(choice, PendingChoiceType.CHOOSE_STEP, pending({}))).toBeNull();
    expect(sanitizeChoice(choice, PendingChoiceType.CHOOSE_CARD, undefined)).toBeNull();
    expect(
      sanitizeChoice(
        choice,
        PendingChoiceType.CHOOSE_CARD,
        pending({ kind: ActionEffectType.COST }),
      ),
    ).toBeNull();
  });

  it('checks resources, states, stickers, steps and effects against the offered options', () => {
    const effect = { id: 2, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } };
    const resource = pending({
      type: PendingChoiceType.CHOOSE_RESOURCE,
      choices: [{ gold: 1 }, { wood: 2 }],
    });
    const stateChoice = pending({ type: PendingChoiceType.CHOOSE_STATE, choices: [2, 3] });
    const sticker = pending({ type: PendingChoiceType.CHOOSE_STICKER, choices: [5], pickMax: 1 });
    const step = pending({ type: PendingChoiceType.CHOOSE_STEP, choices: [1, 2], pickMax: 1 });
    const effects = pending({ type: PendingChoiceType.CHOOSE_ACTION_EFFECT, choices: [effect] });

    expect(
      sanitizeChoice({ ...forged, resources: { wood: 2 } }, resource.type, resource),
    ).not.toBeNull();
    expect(
      sanitizeChoice({ ...forged, resources: { gold: 9 } }, resource.type, resource),
    ).toBeNull();
    expect(sanitizeChoice({ ...forged, stateId: 3 }, stateChoice.type, stateChoice)).not.toBeNull();
    expect(sanitizeChoice({ ...forged, stateId: 9 }, stateChoice.type, stateChoice)).toBeNull();
    expect(sanitizeChoice({ ...forged, stickerIds: [5] }, sticker.type, sticker)).not.toBeNull();
    expect(sanitizeChoice({ ...forged, stepIds: [1, 2] }, step.type, step)).toBeNull();
    expect(
      sanitizeChoice({ ...forged, newActionEffects: [{ ...effect }] }, effects.type, effects),
    ).not.toBeNull();
    expect(
      sanitizeChoice(
        { ...forged, newActionEffects: [{ ...effect, resources: { gold: 50 } }] },
        effects.type,
        effects,
      ),
    ).toBeNull();
  });
});

describe('sanitizeCost', () => {
  const resourceCost = pending({
    kind: ActionEffectType.COST,
    type: PendingChoiceType.CHOOSE_RESOURCE,
    choices: [{ gold: 2 }, { wood: 3 }],
  });
  const discardCost = pending({ id: '3-discard', kind: ActionEffectType.COST, pickMax: 1 });
  const destroyCost = pending({ id: '3-destroy', kind: ActionEffectType.COST, pickMax: 1 });

  it('accepts an offered resource option only', () => {
    const pay = (resources: Record<string, number>) =>
      sanitizeCost({ resources, discardedCardIds: [], destroyedCardIds: [] }, resourceCost);

    expect(pay({ wood: 3 })).toEqual({
      resources: { wood: 3 },
      discardedCardIds: [],
      destroyedCardIds: [],
    });
    expect(pay({})).toBeNull();
    expect(pay({ gold: 1 })).toBeNull();
  });

  it('accepts offered cards to discard or destroy, as the choice id says', () => {
    expect(
      sanitizeCost({ resources: {}, discardedCardIds: [2], destroyedCardIds: [] }, discardCost),
    ).not.toBeNull();
    expect(
      sanitizeCost({ resources: {}, discardedCardIds: [], destroyedCardIds: [2] }, discardCost),
    ).toBeNull();
    expect(
      sanitizeCost({ resources: {}, discardedCardIds: [], destroyedCardIds: [2] }, destroyCost),
    ).toEqual({
      resources: {},
      discardedCardIds: [],
      destroyedCardIds: [2],
    });
    expect(
      sanitizeCost(
        { resources: { gold: 1 }, discardedCardIds: [2], destroyedCardIds: [] },
        discardCost,
      ),
    ).toBeNull();
    expect(
      sanitizeCost({ resources: {}, discardedCardIds: [], destroyedCardIds: [] }, discardCost),
    ).toBeNull();
  });

  it('refuses a payment when no cost is pending', () => {
    const resolved = { resources: {}, discardedCardIds: [1], destroyedCardIds: [] };

    expect(sanitizeCost(resolved, pending({}))).toBeNull();
    expect(
      sanitizeCost(resolved, { ...discardCost, type: PendingChoiceType.CHOOSE_STATE }),
    ).toBeNull();
  });
});
