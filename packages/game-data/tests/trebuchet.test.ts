import { loadGameCatalog } from '../src';
import { GameSession } from '@deck-legacy/engine/application/session/GameSession';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/emptyState';
import { Phase } from '@deck-legacy/engine/domain/enums';
import { createInstance } from '@deck-legacy/engine/domain/factory';
import type { GameState } from '@deck-legacy/engine/domain/types';
import { describe, expect, it } from 'vitest';

const catalog = loadGameCatalog();
const OPTIONS = { allowCheats: false, unrestrictedRewind: false };

// Instance ids of the base deck (deck.json)
const ARMY = 25;
const TREBUCHET = 33;
const BANDIT = 14;

function startWith(overrides: Partial<GameState>): GameSession {
  const ids: [number, number, number][] = [
    [ARMY, 17, 1],
    [TREBUCHET, 25, 2],
    [BANDIT, 9, 1],
  ];
  const state: GameState = {
    ...(JSON.parse(JSON.stringify(EMPTY_STATE)) as GameState),
    phase: Phase.PLAYING,
    round: 3,
    turn: 1,
    instances: Object.fromEntries(
      ids.map(([id, cardId, stateId]) => [id, createInstance(id, cardId, stateId, catalog.cards)]),
    ),
    ...overrides,
  };
  return GameSession.restore('trebuchet', [], catalog, OPTIONS, {}, { seq: 0, state });
}

function resolveTrigger(session: GameSession, actionId: string) {
  const [triggerId, entry] = Object.entries(session.getState().triggerPile).find(
    ([, t]) => t.effectDef.id === actionId,
  ) ?? [undefined, undefined];
  if (!triggerId || !entry) throw new Error(`No ${actionId} trigger`);
  session.execute({
    type: 'resolveAction',
    instanceId: entry.sourceInstanceId,
    actionId,
    triggerId,
  });
}

describe('Trebuchet', () => {
  it("defeats an enemy of the discard pile through the enemy's own defeat, for free", () => {
    const session = startWith({ board: [TREBUCHET], discardPile: [BANDIT], permanents: [ARMY] });

    session.execute({ type: 'resolveAction', instanceId: TREBUCHET, actionId: '25-2-1' });
    const [choice] = session.toView().pendingChoices ?? [];
    if (choice) {
      expect(choice.choices).toEqual([BANDIT]);
      session.execute({
        type: 'resolvePlayerChoice',
        choice: {
          id: choice.id,
          type: choice.kind,
          sourceInstanceId: choice.sourceInstanceId,
          instanceIds: [BANDIT],
        },
        choiceType: choice.type,
      });
    }

    let state = session.getState();
    expect(state.destroyedPile).toContain(TREBUCHET);
    // The Bandit is not destroyed by the Trebuchet: its defeat waits as a mandatory trigger.
    expect(state.discardPile).toContain(BANDIT);
    const trigger = Object.values(state.triggerPile).find(t => t.effectDef.id === '9-1-2');
    expect(trigger?.effectDef.optional).toBeUndefined();
    expect(state.instances[ARMY].trackProgress).toHaveLength(1);

    // No weapon needed: the Bandit destroys itself and gives its reward (2 resources of choice).
    resolveTrigger(session, '9-1-2');
    for (let i = 0; i < 2; i++) {
      const [pick] = session.toView().pendingChoices ?? [];
      if (!pick) break;
      session.execute({
        type: 'resolvePlayerChoice',
        choice: {
          id: pick.id,
          type: pick.kind,
          sourceInstanceId: pick.sourceInstanceId,
          resources: { gold: 1 },
        },
        choiceType: pick.type,
      });
    }

    state = session.getState();
    expect(state.destroyedPile).toContain(BANDIT);
    expect(state.discardPile).not.toContain(BANDIT);
    expect(state.resources.gold).toBe(2);
  });
});
