import { DEFAULT_OPTIONS, makeCatalog } from './fixtures';
import { GameSession } from '@engine/application/session/GameSession';
import type { EngineEnvironment } from '@engine/domain/environment/EngineEnvironment';
import { describe, expect, it } from 'vitest';

/** A fixed clock, counted ids and a fixed random sequence. */
function fixedEnvironment(): EngineEnvironment {
  let ids = 0;
  let time = 1_000;
  return {
    now: () => {
      time += 1;
      return time;
    },
    newId: () => {
      ids += 1;
      return `id-${ids}`;
    },
    random: () => 0.42,
  };
}

function play(seed?: string) {
  const options = { ...DEFAULT_OPTIONS, environment: fixedEnvironment() };
  const session = GameSession.start('g', makeCatalog(), options, 'standard', undefined, seed);
  const state = session.getState();
  const field = state.board.find(id => state.instances[id].cardId === 1);
  if (field !== undefined) {
    session.execute({ type: 'resolveProduction', instanceId: field, choiceIndex: 0 });
  }
  session.execute({ type: 'endTurn' });
  return session.getEvents();
}

describe('GameSession environment', () => {
  it('takes timestamps and ids from the given environment', () => {
    const events = play('seed');

    expect(events.every(event => event.id.startsWith('id-'))).toBe(true);
    expect(events.every(event => event.timestamp > 1_000)).toBe(true);
  });

  it('produces the same events twice with the same environment', () => {
    expect(play('seed')).toEqual(play('seed'));
  });

  it('draws the seed from the environment when none is given', () => {
    const events = play();

    expect(events[0]).toMatchObject({ seed: 'id-1' });
    expect(events).toEqual(play());
  });
});
