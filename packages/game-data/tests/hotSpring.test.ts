import { loadGameCatalog } from '../src';
import { GameSession } from '@deck-legacy/engine/application/session/GameSession';
import { Phase } from '@deck-legacy/engine/domain/enums';
import { createInstance } from '@deck-legacy/engine/domain/factory';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/state/emptyState';
import type { GameState } from '@deck-legacy/engine/domain/types';
import { describe, expect, it } from 'vitest';

const catalog = loadGameCatalog();
const OPTIONS = { allowCheats: false, unrestrictedRewind: false };

const HOT_SPRING = 112;
const FOREST = 3;

/** Hot Spring and a Forest (land) in play, enough to upgrade Hot Spring into Fountain. */
function upgradeHotSpring(): GameSession {
  const state: GameState = {
    ...(JSON.parse(JSON.stringify(EMPTY_STATE)) as GameState),
    phase: Phase.PLAYING,
    round: 1,
    turn: 1,
    board: [HOT_SPRING, FOREST],
    resources: { gold: 2, stone: 2 },
    stickerStock: { 1: 1 },
    instances: {
      [HOT_SPRING]: createInstance(HOT_SPRING, 112, 1, catalog.cards),
      [FOREST]: createInstance(FOREST, 3, 1, catalog.cards),
    },
  };
  const session = GameSession.restore('hot-spring', [], catalog, OPTIONS, {}, { seq: 0, state });
  session.execute({ type: 'resolveUpgrade', instanceId: HOT_SPRING, upgradeTo: 2 });
  return session;
}

function hotSpringTrigger(session: GameSession): string {
  const [triggerId] = Object.keys(session.getState().triggerPile);
  if (!triggerId) throw new Error('No 112-1-1 trigger');
  return triggerId;
}

describe('Hot Spring', () => {
  it('ends the turn once its upgrade trigger is resolved', () => {
    const session = upgradeHotSpring();
    expect(session.getState().phase).toBe(Phase.PLAYING);

    session.execute({
      type: 'resolveAction',
      instanceId: HOT_SPRING,
      actionId: '112-1-1',
      triggerId: hotSpringTrigger(session),
    });
    for (let [choice] = session.toView().pendingChoices ?? []; choice;) {
      session.execute({
        type: 'resolvePlayerChoice',
        choice: {
          id: choice.id,
          type: choice.kind,
          sourceInstanceId: choice.sourceInstanceId,
          instanceIds: [FOREST],
          stickerIds: [1],
        },
        choiceType: choice.type,
      });
      [choice] = session.toView().pendingChoices ?? [];
    }

    const state = session.getState();
    expect(state.instances[FOREST].stickers[1]).toEqual([1]);
    expect(state.triggerPile).toEqual({});
    expect(state.phase).toBe(Phase.TURN_END);
  });

  it('ends the turn once its upgrade trigger is skipped', () => {
    const session = upgradeHotSpring();

    session.execute({ type: 'skipTrigger', triggerId: hotSpringTrigger(session) });

    expect(session.getState().phase).toBe(Phase.TURN_END);
  });
});
