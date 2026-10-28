import { makeInstance, makeState } from './fixtures';
import { advanceTrackOf } from '@engine/domain/effects/advanceTrackOf';
import { resolveActionEffect } from '@engine/domain/effects/resolveActionEffect';
import { ActionEffectType, PendingChoiceType, TargetScope } from '@engine/domain/enums';
import { CardChoiceStrategy } from '@engine/domain/playerChoice/CardChoiceStrategy';
import { StepChoiceStrategy } from '@engine/domain/playerChoice/StepChoiceStrategy';
import type { CardDef, PendingChoice, ResolvedActionEffect } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

// "Mark 1 other permanent card, gaining any effects" (Mass Export): a source card without a
// track, an ordered track and a track marked in any order whose step costs 5 gold.
const gain = (gold: number) => [
  { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold } },
];
const defs: Record<number, CardDef> = {
  1: { id: 1, name: 'Source', states: [{ id: 1, name: 'S' }] },
  2: {
    id: 2,
    name: 'Ordered',
    states: [
      {
        id: 1,
        name: 'S',
        track: { inOrder: true, steps: [{ id: 1, effects: gain(1) }, { id: 2 }] },
      },
    ],
  },
  3: {
    id: 3,
    name: 'Any order',
    states: [
      {
        id: 1,
        name: 'S',
        track: {
          inOrder: false,
          steps: [{ id: 1, cost: { resources: [{ gold: 5 }] }, effects: gain(3) }],
        },
      },
    ],
  },
};

const state = (progress: Record<number, number[]> = {}) =>
  makeState({
    permanents: [1, 2, 3],
    instances: Object.fromEntries(
      [1, 2, 3].map(id => [
        id,
        makeInstance({ id, cardId: id, trackProgress: progress[id] ?? [] }),
      ]),
    ),
  });

const markOther = {
  id: 1,
  type: ActionEffectType.TRACK_ADVANCE,
  payingCost: false,
  cards: { scope: [TargetScope.PERMANENTS, TargetScope.WITH_TRACK], pickNumber: 1 },
};

const resolved: ResolvedActionEffect = {
  id: '1-1',
  type: ActionEffectType.TRACK_ADVANCE,
  sourceInstanceId: 1,
  payingCost: false,
};

const template = {
  id: '1-1',
  kind: ActionEffectType.TRACK_ADVANCE,
  sourceInstanceId: 1,
  isMandatory: true,
};

describe('TRACK_ADVANCE on another card', () => {
  it('asks which card to mark when the effect picks among several', () => {
    const [, pending] = resolveActionEffect(markOther, 1, state(), defs, {});
    expect(pending).toEqual([
      expect.objectContaining({ type: PendingChoiceType.CHOOSE_CARD, choices: [2, 3] }),
    ]);
  });

  it('marks the only card left without asking', () => {
    const [result, pending] = resolveActionEffect(markOther, 1, state({ 2: [1, 2] }), defs, {});
    expect(pending[0]).toMatchObject({ type: PendingChoiceType.CHOOSE_STEP, targetInstanceId: 3 });
    expect(result.instanceIds).toEqual([3]);
  });

  it('asks even for one card when none may be picked, and marks nothing before', () => {
    const markAny = {
      ...markOther,
      cards: { ...markOther.cards, pickNumber: undefined, pickMin: 0, pickMax: 99 },
    };
    const [result, pending] = resolveActionEffect(markAny, 1, state({ 2: [1, 2] }), defs, {});
    expect(pending[0]).toMatchObject({
      type: PendingChoiceType.CHOOSE_CARD,
      choices: [3],
      pickMin: 0,
    });
    expect(result.instanceIds).toBeUndefined();
  });

  it('keeps marking the first match when the effect does not pick (older cards)', () => {
    const { pickNumber: _pick, ...cards } = markOther.cards;
    const [result, pending] = resolveActionEffect({ ...markOther, cards }, 1, state(), defs, {});
    expect(pending).toEqual([]);
    expect(result).toMatchObject({ instanceIds: [2], stepIds: [1] });
  });
});

describe('advanceTrackOf', () => {
  it('marks the next step of an ordered track and adds its effects', () => {
    const [result, pending] = advanceTrackOf(resolved, 2, {}, template, state(), defs, {});
    expect(pending).toEqual([]);
    expect(result).toMatchObject({ instanceIds: [2], stepIds: [1] });
    // The step's effects resolve for the marked card.
    expect(result.newActionEffects).toEqual([
      expect.objectContaining({ sourceStepId: 1, sourceInstanceId: 2 }),
    ]);
  });

  it('offers a step whose cost is out of reach when it is not paid', () => {
    const [, pending] = advanceTrackOf(resolved, 3, {}, template, state(), defs, {});
    expect(pending[0]).toMatchObject({
      type: PendingChoiceType.CHOOSE_STEP,
      targetInstanceId: 3,
      choices: [1],
    });
  });

  it('leaves out a step the player cannot pay when it is paid', () => {
    const { payingCost: _paid, ...paid } = resolved;
    const [, pending] = advanceTrackOf(paid, 3, {}, template, state(), defs, {});
    expect(pending[0].choices).toEqual([]);
  });

  it('does nothing on a card without a track or with every step marked', () => {
    expect(advanceTrackOf(resolved, 1, {}, template, state(), defs, {})).toEqual([resolved, []]);
    expect(advanceTrackOf(resolved, 2, {}, template, state({ 2: [1, 2] }), defs, {})).toEqual([
      resolved,
      [],
    ]);
  });
});

describe('choosing the card and the step', () => {
  const cardChoice: PendingChoice = {
    ...template,
    type: PendingChoiceType.CHOOSE_CARD,
    choices: [2, 3],
    pickMin: 1,
    pickMax: 1,
  };

  it('marks the chosen card, then asks for its step when it is marked in any order', () => {
    const strategy = new CardChoiceStrategy(defs, {});
    const choice = { ...resolved, instanceIds: [3] };
    const [result, pending] = strategy.apply(choice, resolved, state(), [cardChoice]);
    expect(result.instanceIds).toEqual([3]);
    expect(pending).toEqual([
      expect.objectContaining({ type: PendingChoiceType.CHOOSE_STEP, targetInstanceId: 3 }),
    ]);
  });

  it('marks every other chosen card with an effect of its own', () => {
    const strategy = new CardChoiceStrategy(defs, {});
    const choice = { ...resolved, instanceIds: [2, 3] };
    const [result] = strategy.apply(choice, resolved, state(), [{ ...cardChoice, effectId: 4 }]);
    expect(result).toMatchObject({ instanceIds: [2], stepIds: [1] });
    expect(result.newActionEffects).toContainEqual({
      id: 4,
      type: ActionEffectType.TRACK_ADVANCE,
      payingCost: false,
      cards: { ids: [3] },
    });
  });

  it('keeps the effects already queued when a step is chosen', () => {
    const strategy = new StepChoiceStrategy(defs);
    const queued = { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { ids: [2] } };
    const [result] = strategy.apply(
      { ...resolved, stepIds: [1] },
      { ...resolved, instanceIds: [3], newActionEffects: [queued] },
      state(),
      [],
    );
    expect(result.newActionEffects?.[0]).toEqual(queued);
    expect(result.newActionEffects).toHaveLength(2);
  });

  it("gains the effects of the chosen step on the marked card's track", () => {
    const strategy = new StepChoiceStrategy(defs);
    const [result] = strategy.apply(
      { ...resolved, stepIds: [1] },
      { ...resolved, instanceIds: [3] },
      state(),
      [],
    );
    expect(result.newActionEffects).toEqual([
      expect.objectContaining({ resources: { gold: 3 }, sourceStepId: 1, sourceInstanceId: 3 }),
    ]);
  });
});
