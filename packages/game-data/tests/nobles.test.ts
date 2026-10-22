import { loadGameCatalog } from '../src';
import { GameAggregate } from '@deck-legacy/engine/domain/aggregates/GameAggregate';
import { getActiveState } from '@deck-legacy/engine/domain/cards/selection/getActiveState';
import { getEffectiveGlory } from '@deck-legacy/engine/domain/cards/selection/getEffectiveGlory';
import { getStateActions } from '@deck-legacy/engine/domain/cards/selection/getStateActions';
import { Phase } from '@deck-legacy/engine/domain/enums';
import { createInstance } from '@deck-legacy/engine/domain/factory';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/state/emptyState';
import type { CardAction, GameState, PendingChoice } from '@deck-legacy/engine/domain/types';
import { describe, expect, it } from 'vitest';

const catalog = loadGameCatalog();

// Instance ids (expansions/foundations/deck.json): printed number + 191
const PRINCE = 317;
const EDRIC = 322;
const STARFALL = 323;
const WINDERMERE = 326;
const ELARA = 328;
// Base game cards, with ids of this test: Trader (person), Wild Grass (land, gold)
const PERSON = 5;
const LAND = 1;
const LAND_2 = 2;

const cardIds: Record<number, number> = {
  [PRINCE]: 299,
  [EDRIC]: 304,
  [STARFALL]: 305,
  [WINDERMERE]: 308,
  [ELARA]: 310,
  [PERSON]: 5,
  [LAND]: 1,
  [LAND_2]: 1,
};

function makeGame(overrides: Partial<GameState>, states: Record<number, number> = {}) {
  const state: GameState = {
    ...(JSON.parse(JSON.stringify(EMPTY_STATE)) as GameState),
    seed: 'nobles',
    activeExpansion: 'Invasion',
    phase: Phase.PLAYING,
    round: 1,
    turn: 1,
    stickerStock: { 1: 3 },
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

const pending = (agg: GameAggregate): PendingChoice | undefined =>
  agg.getCurrentCardAction()?.getPendingChoices()[0];

/** Answers the pending choices: cards, then the first offered option of the others. */
function answer(agg: GameAggregate, instanceIds: number[]) {
  for (let choice = pending(agg); choice; choice = pending(agg)) {
    const first = choice.choices[0];
    const answers: Record<string, object> = {
      choose_card: { instanceIds },
      choose_sticker: { stickerIds: [first] },
      choose_step: { stepIds: [first] },
    };
    const values = answers[choice.type] ?? { resources: first as Record<string, number> };
    agg.resolveCardActionChoice(
      { id: choice.id, type: choice.kind, sourceInstanceId: choice.sourceInstanceId, ...values },
      choice.type,
    );
  }
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

describe('Lord Edric', () => {
  it('crosses out a production of another person to add its sticker here', () => {
    // The Valiant Prince, a person producing a weapon
    const agg = makeGame({ board: [EDRIC, PRINCE], drawPile: [LAND], stickerStock: { 5: 1 } });
    agg.cardAction(actionOf(agg, EDRIC, '304-1-1'), EDRIC);
    answer(agg, [PRINCE]);
    const state = agg.getGameState();
    expect(state.instances[PRINCE].removedResourcesByState?.[1]?.production).toEqual(['weapon']);
    expect(state.instances[EDRIC].stickers[1]).toEqual([5]);
  });
});

describe('House of Stonehaven', () => {
  it('destroys a friendly card to write its glory +7 and take a sticker of its production', () => {
    const agg = makeGame({ board: [EDRIC, LAND], drawPile: [PERSON] }, { [EDRIC]: 2 });
    agg.cardAction(actionOf(agg, EDRIC, '304-2-1'), EDRIC);
    answer(agg, [LAND]);
    const state = agg.getGameState();
    expect(state.destroyedPile).toContain(LAND);
    expect(state.instances[EDRIC].glories).toEqual([7]);
    expect(state.instances[EDRIC].stickers[2]).toEqual([1]);
  });
});

describe('Lady Elara', () => {
  it('crosses out the glory of a person to write it +2 here', () => {
    const agg = makeGame({ board: [ELARA, PERSON], drawPile: [LAND] });
    agg.getGameState().instances[PERSON].stickers[1] = [10];
    agg.cardAction(actionOf(agg, ELARA, '310-1-1'), ELARA);
    answer(agg, [PERSON]);
    expect(agg.getGameState().instances[ELARA].glories).toEqual([7]);
    expect(gloryOf(agg, PERSON)).toBe(0);
  });
});

describe('Valiant Prince', () => {
  it('gains 1 gold, wood or stone for each box of its second side', () => {
    const agg = makeGame({ board: [PRINCE], drawPile: [LAND] }, { [PRINCE]: 2 });
    agg.getGameState().instances[PRINCE].trackProgress.push(11, 12);
    agg.cardAction(actionOf(agg, PRINCE, '299-2-1'), PRINCE);
    answer(agg, []);
    expect(agg.getGameState().resources).toEqual({ gold: 2 });
  });

  it('marks a box on the other side when upgraded', () => {
    // The trigger of the first side resolves once the card shows the second side
    const [, markOtherSide] = catalog.cards[299].states[0].actions ?? [];
    const agg = makeGame({ board: [PRINCE] }, { [PRINCE]: 2 });
    agg.cardAction(found(markOtherSide), PRINCE);
    answer(agg, []);
    expect(agg.getGameState().instances[PRINCE].trackProgress).toContain(11);
  });
});

describe('Windermere Estate', () => {
  it('discards the lands played while it stays in play', () => {
    const agg = makeGame({ board: [WINDERMERE], drawPile: [LAND, LAND_2] }, { [WINDERMERE]: 2 });
    agg.getGameState().boardEffects[WINDERMERE] = catalog.cards[308].states[1].passives ?? [];
    agg.turnStarted();
    for (const [triggerId, entry] of Object.entries(agg.getGameState().triggerPile)) {
      if (entry.effectDef.id === '308-2-1') agg.cardAction(entry.effectDef, WINDERMERE, triggerId);
    }
    const state = agg.getGameState();
    expect(state.discardPile).toEqual(expect.arrayContaining([LAND, LAND_2]));
    expect(state.board).toContain(WINDERMERE);
  });
});

describe('Starfall Castle', () => {
  it('adds 1 to the purge number of the next campaign', () => {
    const agg = makeGame(
      {
        phase: Phase.GAME_OVER,
        permanents: [STARFALL],
        drawPile: [LAND, LAND_2, PERSON],
        campaignScores: { base: 0 },
      },
      { [STARFALL]: 2 },
    );
    agg.selectExpansion('Invasion', catalog.expansions.Invasion);
    expect(agg.getGameState().purgeState?.batchSize).toBe(9);
  });
});
