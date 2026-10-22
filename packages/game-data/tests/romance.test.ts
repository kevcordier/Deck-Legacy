import { loadGameCatalog } from '../src';
import { GameSession } from '@deck-legacy/engine/application/session/GameSession';
import { GameAggregate } from '@deck-legacy/engine/domain/aggregates/GameAggregate';
import { getCardProductionChoices } from '@deck-legacy/engine/domain/cards/getCardProductionChoices';
import { cardSelector } from '@deck-legacy/engine/domain/cards/selection/cardSelector';
import { getActiveState } from '@deck-legacy/engine/domain/cards/selection/getActiveState';
import { getEffectiveGlory } from '@deck-legacy/engine/domain/cards/selection/getEffectiveGlory';
import { getStateActions } from '@deck-legacy/engine/domain/cards/selection/getStateActions';
import { CardTag, Phase, TargetScope } from '@deck-legacy/engine/domain/enums';
import { createInstance } from '@deck-legacy/engine/domain/factory';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/state/emptyState';
import type { CardAction, GameState, PendingChoice } from '@deck-legacy/engine/domain/types';
import { describe, expect, it } from 'vitest';

const catalog = loadGameCatalog();

// Instance ids (expansions/foundations/deck.json): printed number + 191
const COURT = 286;
const DIANA = 290;
const ALETA = 293;
const GUINEVERE = 294;
const SIR_GAWAIN = 283;
// Base game cards, with ids of this test: Trader (person, gold 1)
const PERSONS = [5, 6, 7];
const RED_SCARF = 591;
const KNIGHT_STICKER = 11;

const cardIds: Record<number, number> = {
  [COURT]: 268,
  [DIANA]: 272,
  [ALETA]: 275,
  [GUINEVERE]: 276,
  [SIR_GAWAIN]: 265,
  ...Object.fromEntries(PERSONS.map(id => [id, 5])),
};

function makeGame(overrides: Partial<GameState>, states: Record<number, number> = {}) {
  const state: GameState = {
    ...(JSON.parse(JSON.stringify(EMPTY_STATE)) as GameState),
    seed: 'romance',
    activeExpansion: 'Invasion',
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

const OPTIONS = { allowCheats: false, unrestrictedRewind: false };
const restore = (agg: GameAggregate) =>
  GameSession.restore('romance', [], catalog, OPTIONS, {}, { seq: 0, state: agg.getGameState() });

const pending = (agg: GameAggregate): PendingChoice =>
  found(agg.getCurrentCardAction()?.getPendingChoices()[0]);

function resolve(agg: GameAggregate, values: { instanceIds?: number[]; stepIds?: number[] }) {
  const choice = pending(agg);
  agg.resolveCardActionChoice(
    { id: choice.id, type: choice.kind, sourceInstanceId: choice.sourceInstanceId, ...values },
    choice.type,
  );
}

const gloryOf = (agg: GameAggregate, id: number) => {
  const state = agg.getGameState();
  const instance = state.instances[id];
  return getEffectiveGlory(
    getActiveState(instance, catalog.cards),
    state,
    catalog.cards,
    instance,
    catalog.stickers,
  );
};

describe('Knight sticker', () => {
  it('makes a person a knight for every effect', () => {
    const agg = makeGame({ board: [5, 6] });
    agg.getGameState().instances[5].stickers[1] = [KNIGHT_STICKER];
    const knights = cardSelector(
      { scope: [TargetScope.BOARD], tags: [CardTag.KNIGHT] },
      -1,
      agg.getGameState(),
      catalog.cards,
      catalog.stickers,
    );
    expect(knights).toEqual([5]);
  });
});

describe('Imprisoned Princess', () => {
  it('is rescued by a knight without a scarf, who gets the red scarf: she becomes Diana', () => {
    const session = restore(
      makeGame(
        {
          board: [DIANA, SIR_GAWAIN],
          resources: { weapon: 7 },
          stickerStock: { [RED_SCARF]: 1 },
        },
        { [SIR_GAWAIN]: 2 },
      ),
    );
    session.execute({ type: 'resolveAction', instanceId: DIANA, actionId: '272-1-2' });
    session.execute({
      type: 'resolvePayCost',
      resolved: { resources: {}, discardedCardIds: [SIR_GAWAIN], destroyedCardIds: [] },
    });
    const state = session.getState();
    expect(state.instances[SIR_GAWAIN].stickers[2]).toEqual([RED_SCARF]);
    expect(state.instances[DIANA].stateId).toBe(2);
  });

  it('is destroyed when the last end-of-turn box is marked', () => {
    const agg = makeGame({ board: [DIANA] });
    agg.getGameState().instances[DIANA].trackProgress.push(1, 2);
    agg.cardAction(actionOf(agg, DIANA, '272-1-3'), DIANA);
    expect(agg.getGameState().destroyedPile).toContain(DIANA);
  });
});

describe('Hostage', () => {
  it('crosses out a medal of Aleta at the end of each turn', () => {
    const agg = makeGame({ board: [ALETA] });
    agg.cardAction(actionOf(agg, ALETA, '275-1-3'), ALETA);
    resolve(agg, { stepIds: [11] }); // the 6
    agg.getGameState().instances[ALETA].stateId = 2;
    expect(gloryOf(agg, ALETA)).toBe(15);
  });
});

describe('Guinevere', () => {
  it('doubles the whole production of knights', () => {
    const agg = makeGame({ board: [GUINEVERE, 5] }, { [GUINEVERE]: 2 });
    const state = agg.getGameState();
    state.instances[5].stickers[1] = [KNIGHT_STICKER, 1];
    state.boardEffects[GUINEVERE] = catalog.cards[276].states[1].passives ?? [];
    expect(
      getCardProductionChoices(state.instances[5], state, catalog.cards, catalog.stickers),
    ).toEqual([{ gold: 2 }]);
  });
});

describe('Famous Court', () => {
  it('writes the fame and name of a discarded person, each name once', () => {
    const game = makeGame({ board: [COURT, 5, 6], drawPile: [7] }, { [COURT]: 4 });
    game.getGameState().instances[5].stickers[1] = [10];
    const session = restore(game);
    session.execute({ type: 'resolveAction', instanceId: COURT, actionId: '268-4-1' });
    session.execute({
      type: 'resolvePayCost',
      resolved: { resources: {}, discardedCardIds: [5], destroyedCardIds: [] },
    });
    const agg = makeGame(session.getState());
    const court = agg.getGameState().instances[COURT];
    expect(court.glories).toEqual([5]);
    expect(court.writtenNames).toEqual(['Trader']);
    expect(gloryOf(agg, COURT)).toBe(5);

    // Another Trader cannot be written
    const traders = cardSelector(
      { scope: [TargetScope.BOARD], tags: [CardTag.PERSON], notWrittenHere: true },
      COURT,
      agg.getGameState(),
      catalog.cards,
      catalog.stickers,
    );
    expect(traders).toEqual([]);
  });
});
