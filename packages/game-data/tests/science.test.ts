import { loadGameCatalog } from '../src';
import { GameSession } from '@deck-legacy/engine/application/session/GameSession';
import { GameAggregate } from '@deck-legacy/engine/domain/aggregates/GameAggregate';
import { Phase, ResourceType } from '@deck-legacy/engine/domain/enums';
import { createInstance } from '@deck-legacy/engine/domain/factory';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/state/emptyState';
import type { GameState } from '@deck-legacy/engine/domain/types';
import { describe, expect, it } from 'vitest';

const catalog = loadGameCatalog();
const OPTIONS = { allowCheats: false, unrestrictedRewind: false };

// Instance ids (expansions/foundations/deck.json): printed number + 191
const COVER = 236;
const TRACK = 237;
const EXPERIMENT = 250;

const cardIds: Record<number, number> = { [COVER]: 218, [TRACK]: 219, [EXPERIMENT]: 232 };

function baseState(overrides: Partial<GameState>): GameState {
  return {
    ...(JSON.parse(JSON.stringify(EMPTY_STATE)) as GameState),
    seed: 'science',
    activeExpansion: 'The Black Plague',
    phase: Phase.PLAYING,
    round: 1,
    turn: 1,
    instances: Object.fromEntries(
      Object.entries(cardIds).map(([id, cardId]) => [
        id,
        createInstance(Number(id), cardId, 1, catalog.cards),
      ]),
    ),
    ...overrides,
  };
}

const restore = (state: GameState) =>
  GameSession.restore('science', [], catalog, OPTIONS, {}, { seq: 0, state });

describe('Science cover', () => {
  it('discovers the Science track and unlocks science and its stickers', () => {
    const agg = new GameAggregate(
      'game',
      baseState({ board: [COVER], discoverablePile: [TRACK] }),
      catalog.cards,
      catalog.stickers,
    );
    const [action] = catalog.cards[218].states[0].actions ?? [];
    agg.cardAction(action, COVER);
    const state = agg.getGameState();
    expect(state.unlockedResources).toEqual([ResourceType.SCIENCE]);
    expect(state.stickerStock[62]).toBe(10);
    expect(state.discoverablePile).not.toContain(TRACK);
  });
});

describe('Science track', () => {
  it('adds the science spent to its total', () => {
    const session = restore(baseState({ permanents: [TRACK], resources: { science: 12 } }));
    session.execute({ type: 'resolveAction', instanceId: TRACK, actionId: '219-1-1', amount: 12 });
    expect(session.getState().instances[TRACK].cumulated).toBe(12);
    expect(session.getState().resources.science ?? 0).toBe(0);
  });
});

describe('Experiment', () => {
  it('turns science into more science, then turns to its next side', () => {
    const session = restore(baseState({ board: [EXPERIMENT], resources: { science: 1 } }));
    session.execute({ type: 'resolveAction', instanceId: EXPERIMENT, actionId: '232-1-1' });
    expect(session.getState().resources.science).toBe(2);
    expect(session.getState().instances[EXPERIMENT].stateId).toBe(2);
  });
});
