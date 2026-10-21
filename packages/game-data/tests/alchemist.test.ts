import { loadGameCatalog } from '../src';
import { GameAggregate } from '@deck-legacy/engine/domain/aggregates/GameAggregate';
import { Phase } from '@deck-legacy/engine/domain/enums';
import { createInstance } from '@deck-legacy/engine/domain/factory';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/state/emptyState';
import type { GameState } from '@deck-legacy/engine/domain/types';
import { describe, expect, it } from 'vitest';

const catalog = loadGameCatalog();
// Instance ids of the base deck (deck.json): Alchemist and a Peasant (person)
const ALCHEMIST = 96;
const PEASANT = 5;

describe('Alchemist, Healing Potion', () => {
  it('plays the discarded person again, then resets', () => {
    const agg = new GameAggregate(
      'game',
      {
        ...(JSON.parse(JSON.stringify(EMPTY_STATE)) as GameState),
        phase: Phase.PLAYING,
        round: 1,
        turn: 1,
        board: [ALCHEMIST, PEASANT],
        drawPile: [],
        instances: {
          [ALCHEMIST]: createInstance(ALCHEMIST, 81, 3, catalog.cards),
          [PEASANT]: createInstance(PEASANT, 5, 1, catalog.cards),
        },
      },
      catalog.cards,
      catalog.stickers,
    );
    agg.turnEnded();
    const [triggerId, entry] = Object.entries(agg.getGameState().triggerPile)[0];
    expect(entry.effectDef.id).toBe('81-3-1');

    agg.cardAction(entry.effectDef, entry.sourceInstanceId, triggerId);
    const [choice] = agg.getCurrentCardAction()?.getPendingChoices() ?? [];
    expect(choice?.choices).toEqual([PEASANT]);
    agg.resolveCardActionChoice(
      {
        id: choice.id,
        type: choice.kind,
        sourceInstanceId: choice.sourceInstanceId,
        instanceIds: [PEASANT],
      },
      choice.type,
    );

    expect(agg.getGameState().board).toContain(PEASANT);
    expect(agg.getGameState().instances[ALCHEMIST].stateId).toBe(1);
  });
});
