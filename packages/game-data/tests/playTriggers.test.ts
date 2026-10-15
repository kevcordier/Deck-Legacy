import { loadGameCatalog } from '../src';
import { GameAggregate } from '@deck-legacy/engine/application/aggregates/GameAggregate';
import { getActiveState } from '@deck-legacy/engine/application/cardHelpers';
import { EMPTY_STATE } from '@deck-legacy/engine/application/emptyState';
import { createInstance } from '@deck-legacy/engine/application/factory';
import { discardCards } from '@deck-legacy/engine/application/gameStateHelper';
import { ActionEffectType, PendingChoiceType, Phase } from '@deck-legacy/engine/domain/enums';
import type { GameState } from '@deck-legacy/engine/domain/types';
import { describe, expect, it } from 'vitest';

// Triggered actions that react to other cards (`triggeredBy`) or fire at the end of the turn.
const catalog = loadGameCatalog();

// instance id → [card id, state id]
const CARDS: Record<number, [number, number]> = {
  3: [3, 1], // Forest (land)
  5: [5, 1], // Trader (person)
  8: [8, 1], // Field Worker (person)
  81: [81, 3], // Healing Potion
  91: [91, 4], // Camelot
  20: [20, 1], // Volcanic Eruption
  48: [48, 1], // Assassin
  119: [119, 3], // Uprising
  121: [121, 2], // Espionage
  1213: [121, 3], // Espionage, third state
  124: [124, 1], // Bandit (enemy)
  126: [126, 1], // Terrified Town
};

function makeGame(overrides: Partial<GameState>) {
  const instances = Object.fromEntries(
    Object.entries(CARDS).map(([id, [cardId, stateId]]) => [
      id,
      createInstance(Number(id), cardId, stateId, catalog.cards),
    ]),
  );
  return new GameAggregate(
    'game',
    {
      ...(JSON.parse(JSON.stringify(EMPTY_STATE)) as GameState),
      phase: Phase.PLAYING,
      instances,
      ...overrides,
    },
    catalog.cards,
    catalog.stickers,
  );
}

const triggerIds = (agg: GameAggregate) =>
  Object.values(agg.getGameState().triggerPile).map(t => t.effectDef.id);

function resolveTrigger(agg: GameAggregate, actionId: string) {
  const entry = Object.entries(agg.getGameState().triggerPile).find(
    ([, t]) => t.effectDef.id === actionId,
  );
  if (!entry) throw new Error(`No trigger ${actionId}`);
  agg.cardAction(entry[1].effectDef, entry[1].sourceInstanceId, entry[0]);
}

/** Picks the played card to destroy (first effect of the action). */
function destroyPlayed(agg: GameAggregate, sourceInstanceId: number, instanceId: number) {
  agg.resolveCardActionChoice(
    {
      id: `${sourceInstanceId}-1`,
      type: ActionEffectType.DESTROY_CARD,
      sourceInstanceId,
      instanceIds: [instanceId],
    },
    PendingChoiceType.CHOOSE_CARD,
  );
}

const stateOf = (agg: GameAggregate, id: number) =>
  getActiveState(agg.getGameState().instances[id], catalog.cards).name;

describe('Volcanic Eruption', () => {
  it('destroys the next land played, then turns into Ashlands', () => {
    const agg = makeGame({ board: [20], drawPile: [3] });
    agg.advance();
    resolveTrigger(agg, '20-1-1');
    destroyPlayed(agg, 20, 3);
    expect(agg.getGameState().destroyedPile).toEqual([3]);
    expect(stateOf(agg, 20)).toBe('Ashlands');
  });

  it('does not fire for a land played with it or for itself', () => {
    const agg = makeGame({ drawPile: [20, 3] });
    agg.turnStarted();
    expect(triggerIds(agg)).not.toContain('20-1-1');
  });
});

describe('Assassin', () => {
  it('destroys the next person played, then upgrades', () => {
    const agg = makeGame({ board: [48], drawPile: [5] });
    agg.advance();
    resolveTrigger(agg, '48-1-2');
    destroyPlayed(agg, 48, 5);
    expect(agg.getGameState().destroyedPile).toEqual([5]);
    expect(stateOf(agg, 48)).toBe('Enemy soldier');
  });
});

describe('Uprising', () => {
  it('marks a step when a person is played while a person is already in play', () => {
    const agg = makeGame({ permanents: [119], board: [5], drawPile: [8] });
    agg.advance();
    resolveTrigger(agg, '119-3-2');
    expect(agg.getGameState().instances[119].trackProgress).toHaveLength(1);
  });

  it('does not fire for the first person in play', () => {
    const agg = makeGame({ permanents: [119], drawPile: [8] });
    agg.advance();
    expect(triggerIds(agg)).not.toContain('119-3-2');
  });
});

describe('Espionage', () => {
  it('fires when a person is played', () => {
    const agg = makeGame({ permanents: [121], drawPile: [5] });
    agg.advance();
    expect(triggerIds(agg)).toContain('121-2-1');
  });
});

describe('Terrified Town', () => {
  it('fires when an enemy is played, not when it is played itself', () => {
    const inPlay = makeGame({ board: [126, 3, 5, 8], drawPile: [124] });
    inPlay.advance();
    expect(triggerIds(inPlay)).toContain('126-1-1');

    const together = makeGame({ drawPile: [126, 124] });
    together.turnStarted();
    expect(triggerIds(together)).not.toContain('126-1-1');
  });
});

describe('Healing Potion', () => {
  it('may replay a discarded person, then resets', () => {
    const agg = makeGame({ board: [81, 5, 3] });
    const gs = discardCards(agg.getGameState(), [5], catalog.cards, catalog.stickers);
    expect(Object.values(gs.triggerPile).map(t => t.effectDef.id)).toEqual(['81-3-1']);
    expect(discardCards(gs, [3], catalog.cards, catalog.stickers).triggerPile).toEqual(
      gs.triggerPile,
    );
  });
});

describe('Camelot', () => {
  it('marks a step at the end of the last turn of the round only', () => {
    const last = makeGame({ board: [91], drawPile: [] });
    last.turnEnded();
    expect(triggerIds(last)).toContain('91-4-1');

    const notLast = makeGame({ board: [91], drawPile: [3] });
    notLast.turnEnded();
    expect(triggerIds(notLast)).not.toContain('91-4-1');
  });
});

describe('Espionage (third state)', () => {
  it('crosses out a production at the end of the turn without weapons', () => {
    const noWeapon = makeGame({ permanents: [1213], board: [3] });
    noWeapon.turnEnded();
    expect(triggerIds(noWeapon)).toContain('121-3-1');

    const armed = makeGame({ permanents: [1213], board: [3], resources: { weapon: 1 } });
    armed.turnEnded();
    expect(triggerIds(armed)).not.toContain('121-3-1');
  });
});
