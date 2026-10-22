import { loadGameCatalog } from '../src';
import { GameAggregate } from '@deck-legacy/engine/domain/aggregates/GameAggregate';
import { getCardProductionChoices } from '@deck-legacy/engine/domain/cards/getCardProductionChoices';
import { getStateActions } from '@deck-legacy/engine/domain/cards/selection/getStateActions';
import { Phase } from '@deck-legacy/engine/domain/enums';
import { createInstance } from '@deck-legacy/engine/domain/factory';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/state/emptyState';
import type { CardAction, GameState, PendingChoice } from '@deck-legacy/engine/domain/types';
import { describe, expect, it } from 'vitest';

const catalog = loadGameCatalog();

// Instance ids (expansions/foundations/deck.json): printed number + 191
const CATHEDRAL = 261;
const ARCHBISHOPS = 262;
const ARCHBISHOP = 263;
const SKEPTICISM = 256;
const SCHOOL = 267;
const THEOLOGY = 278;
// Base game cards, with ids of this test: Wild Grass (land, gold), Trader (person)
const LAND = 1;
const PERSONS = [5, 6, 7, 8];

const cardIds: Record<number, number> = {
  [CATHEDRAL]: 243,
  [ARCHBISHOPS]: 244,
  [ARCHBISHOP]: 245,
  [SKEPTICISM]: 238,
  [SCHOOL]: 249,
  [THEOLOGY]: 260,
  [LAND]: 1,
  ...Object.fromEntries(PERSONS.map(id => [id, 5])),
};

function makeGame(overrides: Partial<GameState>, states: Record<number, number> = {}) {
  const state: GameState = {
    ...(JSON.parse(JSON.stringify(EMPTY_STATE)) as GameState),
    seed: 'church',
    activeExpansion: 'The Black Plague',
    phase: Phase.PLAYING,
    round: 1,
    turn: 1,
    instances: Object.fromEntries(
      Object.entries(cardIds).map(([id, cardId]) => [
        id,
        createInstance(Number(id), cardId, states[Number(id)] ?? 1, catalog.cards),
      ]),
    ),
    ...overrides,
  };
  return new GameAggregate('game', state, catalog.cards, catalog.stickers);
}

function found<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error('Missing test data');
  return value;
}

const actionOf = (agg: GameAggregate, id: number, actionId: string): CardAction =>
  found(
    getStateActions(agg.getGameState().instances[id], catalog.cards, catalog.stickers).find(
      a => a.id === actionId,
    ),
  );

const pending = (agg: GameAggregate): PendingChoice =>
  found(agg.getCurrentCardAction()?.getPendingChoices()[0]);

/** Picks the option `optionId` of the pending effect choice. */
function chooseOption(agg: GameAggregate, optionId: number) {
  const choice = pending(agg);
  const option = found((choice.choices as { id: number }[]).find(effect => effect.id === optionId));
  agg.resolveCardActionChoice(
    {
      id: choice.id,
      type: choice.kind,
      sourceInstanceId: choice.sourceInstanceId,
      newActionEffects: [option as never],
    },
    choice.type,
  );
}

function pickCards(agg: GameAggregate, instanceIds: number[]) {
  const choice = pending(agg);
  agg.resolveCardActionChoice(
    { id: choice.id, type: choice.kind, sourceInstanceId: choice.sourceInstanceId, instanceIds },
    choice.type,
  );
}

const stateOf = (agg: GameAggregate, id: number) => agg.getGameState().instances[id].stateId;

describe('Archbishops', () => {
  it('are discovered by the Cathedral as one card, and one of the 6 is chosen at once', () => {
    const agg = makeGame(
      { board: [CATHEDRAL], discoverablePile: [ARCHBISHOPS, ARCHBISHOP] },
      { [CATHEDRAL]: 3 },
    );
    agg.cardAction(actionOf(agg, CATHEDRAL, '243-3-1'), CATHEDRAL);
    const [[triggerId, entry]] = Object.entries(agg.getGameState().triggerPile);
    agg.cardAction(entry.effectDef, ARCHBISHOPS, triggerId);

    expect(pending(agg).choices).toHaveLength(6);
    chooseOption(agg, 2); // Seraphinus

    expect(stateOf(agg, ARCHBISHOP)).toBe(2);
    expect(stateOf(agg, ARCHBISHOPS)).toBe(2);
    expect(agg.getGameState().permanents).toEqual(
      expect.arrayContaining([ARCHBISHOPS, ARCHBISHOP]),
    );
  });

  it('must choose a new Archbishop at the start of the round, keeping the marked tasks', () => {
    const agg = makeGame({ permanents: [ARCHBISHOP], drawPile: [LAND] }, { [ARCHBISHOP]: 2 });
    agg.getGameState().instances[ARCHBISHOP].trackProgress.push(11);
    agg.cardAction(actionOf(agg, ARCHBISHOP, '245-2-8'), ARCHBISHOP);
    expect((pending(agg).choices as { id: number }[]).map(option => option.id)).toEqual([
      1, 3, 4, 5, 6,
    ]);
    chooseOption(agg, 5); // Arbrosius
    expect(stateOf(agg, ARCHBISHOP)).toBe(5);
    expect(agg.getGameState().instances[ARCHBISHOP].trackProgress).toEqual([11]);
  });

  it('Benedictus blocks 3 persons before the round to mark a task, released at its end', () => {
    const agg = makeGame({ permanents: [ARCHBISHOP], drawPile: [...PERSONS, LAND] });
    agg.cardAction(actionOf(agg, ARCHBISHOP, '245-1-8'), ARCHBISHOP);
    chooseOption(agg, 3);
    chooseOption(agg, 7);
    pickCards(agg, [5, 6, 7]);
    const step = pending(agg);
    agg.resolveCardActionChoice(
      { id: step.id, type: step.kind, sourceInstanceId: step.sourceInstanceId, stepIds: [21] },
      step.type,
    );

    let state = agg.getGameState();
    expect(state.instances[ARCHBISHOP].trackProgress).toEqual([21]);
    expect(state.drawPile).toEqual([8, LAND]);

    agg.cardAction(actionOf(agg, ARCHBISHOP, '245-3-2'), ARCHBISHOP);
    state = agg.getGameState();
    expect(state.board).toEqual(expect.arrayContaining([5, 6, 7]));
    expect(
      Object.values(state.boardEffects)
        .flat()
        .filter(e => e.type === 'BLOCK'),
    ).toEqual([expect.objectContaining({ cards: { ids: [] } })]);
  });
});

describe('Blessed cards', () => {
  it('produce +1 gold or 1 science with Gregorius', () => {
    const agg = makeGame({ board: [LAND], permanents: [ARCHBISHOP] });
    const state = agg.getGameState();
    state.instances[LAND].stickers[1] = [38];
    state.boardEffects[ARCHBISHOP] = catalog.cards[245].states[0].passives ?? [];
    expect(
      getCardProductionChoices(state.instances[LAND], state, catalog.cards, catalog.stickers),
    ).toEqual([{ gold: 2 }, { gold: 1, science: 1 }]);
  });

  it('cannot stay in play with Skepticism, even with a Stay in play sticker', () => {
    const agg = makeGame({ board: [SKEPTICISM, LAND], drawPile: [5] });
    const state = agg.getGameState();
    state.instances[LAND].stickers[1] = [38, 7];
    state.boardEffects[SKEPTICISM] = catalog.cards[238].states[0].passives ?? [];
    agg.turnEnded();
    expect(agg.getGameState().board).not.toContain(LAND);
  });
});

describe('Renowned School', () => {
  it('upgrades persons without ending the turn', () => {
    const agg = makeGame({ board: [SCHOOL, 5], resources: { gold: 10 } }, { [SCHOOL]: 4 });
    agg.getGameState().boardEffects[SCHOOL] = catalog.cards[249].states[3].passives ?? [];
    agg.upgradeCard(5, 2, {});
    expect(agg.getGameState().phase).toBe(Phase.PLAYING);
    expect(stateOf(agg, 5)).toBe(2);
  });
});

describe('Theology of Science', () => {
  it('makes 1 card stay in play for every 3 science spent', () => {
    const agg = makeGame({
      permanents: [THEOLOGY],
      board: [5, 6, 7],
      drawPile: [LAND, 8],
      resources: { science: 7 },
    });
    const action = actionOf(agg, THEOLOGY, '260-1-1');
    agg.cardAction(action, THEOLOGY, undefined, 7);
    pickCards(agg, [5]);
    pickCards(agg, [6]);
    expect(agg.getGameState().resources.science ?? 0).toBe(0);
    agg.turnEnded();
    expect(agg.getGameState().board).toEqual(expect.arrayContaining([5, 6]));
    expect(agg.getGameState().board).not.toContain(7);
  });
});
