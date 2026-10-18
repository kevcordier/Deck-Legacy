import { GameSession } from '@deck-legacy/engine/application/session/GameSession';
import { getActiveState } from '@deck-legacy/engine/domain/cardHelpers';
import type {
  GameCommand,
  PendingChoice,
  ResolvedActionEffect,
  Resources,
} from '@deck-legacy/engine/domain/types';
import { loadGameCatalog } from '@deck-legacy/game-data';
import { describe, expect, it } from 'vitest';

/**
 * Random games on the real game data, checked by `GameSession.verify` (EDR-051): a card whose
 * effects do not replay the same way from the recorded commands fails here.
 */
const catalog = loadGameCatalog();
const OPTIONS = { allowCheats: false, unrestrictedRewind: false };

/** Deterministic random numbers, so a failure can be replayed. */
function random(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function choiceCommands(choice: PendingChoice, pick: <T>(items: T[]) => T): GameCommand[] {
  const ids = [...new Set(choice.choices.filter(item => typeof item === 'number'))].slice(
    0,
    Math.max(1, choice.pickMin),
  );
  if (choice.kind === 'COST') {
    const resolved =
      choice.type === 'choose_resource'
        ? {
            resources: pick(choice.choices) as Resources,
            discardedCardIds: [],
            destroyedCardIds: [],
          }
        : {
            resources: {},
            discardedCardIds: choice.id.includes('-destroy') ? [] : ids,
            destroyedCardIds: choice.id.includes('-destroy') ? ids : [],
          };
    return [{ type: 'resolvePayCost', resolved }, { type: 'skipChoice' }];
  }
  const selection: Record<string, Partial<ResolvedActionEffect>> = {
    choose_card: { instanceIds: ids },
    choose_step: { stepIds: ids },
    choose_sticker: { stickerIds: ids },
    choose_state: { stateId: pick(choice.choices) as number },
    choose_resource: { resources: pick(choice.choices) as Resources },
    choose_action_effect: { newActionEffects: [pick(choice.choices)] as never },
  };
  const resolved = {
    id: choice.id,
    type: choice.kind,
    sourceInstanceId: choice.sourceInstanceId,
    ...selection[choice.type],
  };
  return [
    { type: 'resolvePlayerChoice', choice: resolved, choiceType: choice.type },
    { type: 'resolvePlayerChoice', choice: resolved, choiceType: choice.type },
    { type: 'skipChoice' },
  ];
}

/** Commands a player could send now (the engine ignores the ones its rules refuse). */
function commands(session: GameSession, pick: <T>(items: T[]) => T): GameCommand[] {
  const view = session.toView();
  const state = view.gameState;
  const [choice] = view.pendingChoices ?? [];
  if (choice) return choiceCommands(choice, pick);

  const list: GameCommand[] = [];
  for (const [triggerId, entry] of Object.entries(state.triggerPile)) {
    list.push(
      {
        type: 'resolveAction',
        instanceId: entry.sourceInstanceId,
        actionId: entry.effectDef.id,
        triggerId,
      },
      { type: 'skipTrigger', triggerId },
    );
  }
  for (const id of [...state.board, ...state.permanents]) {
    const cardState = getActiveState(state.instances[id], catalog.cards);
    for (const action of cardState.actions ?? []) {
      list.push({ type: 'resolveAction', instanceId: id, actionId: action.id, amount: 1 });
    }
    for (const upgrade of cardState.upgrade ?? []) {
      list.push({ type: 'resolveUpgrade', instanceId: id, upgradeTo: upgrade.upgradeTo });
    }
    list.push({ type: 'resolveProduction', instanceId: id, choiceIndex: 0 });
  }
  for (const id of view.purge.candidates.slice(0, 3))
    list.push({ type: 'selectPurgeCard', instanceId: id });
  for (const id of view.purge.permanentCandidates.slice(0, 2)) {
    list.push({ type: 'selectPurgePermanent', instanceId: id });
  }
  for (const name of Object.keys(catalog.expansions)) list.push({ type: 'selectExpansion', name });
  list.push(
    { type: 'progress' },
    { type: 'endTurn' },
    { type: 'startTurn' },
    { type: 'endRound' },
    { type: 'startRound' },
    { type: 'finalizePurge' },
    { type: 'dismissParchment' },
    { type: 'continueCampaign' },
  );
  if (view.canRewind) list.push({ type: 'rewind' });
  return list;
}

describe('verification of random games', () => {
  it('verifies every game and gives the same score', { timeout: 60_000 }, () => {
    for (let game = 1; game <= 4; game++) {
      const next = random(game);
      const pick = <T>(items: T[]): T => items[Math.floor(next() * items.length)];
      const tutorial = game === 1;
      const session = GameSession.start(
        `game-${game}`,
        catalog,
        OPTIONS,
        tutorial ? 'tutorial' : 'standard',
        tutorial ? catalog.tutorialDrawOrder : undefined,
        `fuzz-${game}`,
      );
      for (let step = 0; step < 3000; step++) {
        session.execute(pick(commands(session, pick)));
      }

      const events = structuredClone(session.getEvents());
      const verified = GameSession.verify(session.id, events, catalog);

      expect(session.getEvents().length).toBeGreaterThan(200);
      expect(verified?.getScore()).toBe(session.getScore());
    }
  });
});
