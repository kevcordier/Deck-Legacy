import { DEFAULT_OPTIONS, makeCatalog } from './fixtures';
import { GameSession } from '@engine/application/session/GameSession';
import { GameEventType, Phase } from '@engine/domain/enums';
import { CorruptedGameError } from '@engine/domain/errors/CorruptedGameError';
import { ForbiddenCommandError } from '@engine/domain/errors/ForbiddenCommandError';
import type { GameEvent, GameState } from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

function startGame(options = DEFAULT_OPTIONS) {
  return GameSession.start('game-1', makeCatalog(), options);
}

/** A field (card 1) on the board: the fixture deck also holds workshops, which produce nothing. */
function boardCard(session: GameSession): number {
  const state = session.getState();
  const field = state.board.find(id => state.instances[id].cardId === 1);
  if (field === undefined) throw new Error('No field on the board');
  return field;
}

describe('GameSession.start', () => {
  it('starts a standard game in the playing phase', () => {
    const session = startGame();
    const view = session.toView();

    expect(view.gameState.phase).toBe(Phase.PLAYING);
    expect(view.gameState.board.length).toBeGreaterThan(0);
    expect(view.gameState.discoveryPile).toEqual([11, 12]);
    expect(view.tutorial).toBe(false);
    expect(session.getEvents()[0].type).toBe(GameEventType.GAME_STARTED);
  });

  it('draws the tutorial round in the given order and replays it', () => {
    const order = [5, 1, 2, 7, 6, 3, 10, 8, 4, 9];
    const session = GameSession.start('tuto', makeCatalog(), DEFAULT_OPTIONS, 'tutorial', order);
    const view = session.toView();

    expect(view.tutorial).toBe(true);
    expect(view.canRewind).toBe(false);
    expect(view.gameState.board).toEqual([5, 1, 2, 7]);
    expect(view.gameState.drawPile).toEqual([6, 3, 10, 8, 4, 9]);

    const replayed = GameSession.restore(
      'kingdom',
      session.getEvents(),
      makeCatalog(),
      DEFAULT_OPTIONS,
    );
    expect(replayed.getState()).toEqual(session.getState());
    expect(replayed.toView().tutorial).toBe(false);
  });

  it('rejects a first draw pile that is not the starting deck', () => {
    for (const order of [
      [1, 2, 3],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 11],
      [1, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    ]) {
      expect(() =>
        GameSession.start('tuto', makeCatalog(), DEFAULT_OPTIONS, 'tutorial', order),
      ).toThrow('starting deck');
    }
  });
});

describe('GameSession commands', () => {
  it('produces resources', () => {
    const session = startGame();
    const gold = session.getState().resources.gold ?? 0;

    const error = session.execute({
      type: 'resolveProduction',
      instanceId: boardCard(session),
      choiceIndex: 0,
    });

    expect(error).toBeUndefined();
    expect(session.getState().resources.gold).toBe(gold + 1);
  });

  it('pays the upgrade cost from produced resources', () => {
    // Seeded: the first turn draws at least two fields.
    const session = GameSession.start(
      'g',
      makeCatalog(),
      DEFAULT_OPTIONS,
      'standard',
      undefined,
      'seed',
    );
    const state = session.getState();
    const [produced, upgraded] = state.board.filter(id => state.instances[id].cardId === 1);
    session.execute({ type: 'resolveProduction', instanceId: produced, choiceIndex: 0 });

    session.execute({ type: 'resolveUpgrade', instanceId: upgraded, upgradeTo: 2 });

    expect(session.getState().instances[upgraded].stateId).toBe(2);
    expect(session.getState().resources.gold ?? 0).toBe(0);
  });

  it('pays the upgrade chosen by its index when several lead to the same state', () => {
    const catalog = makeCatalog();
    // Two ways to pay: 5 gold (unaffordable) or 1 gold
    catalog.cards[1].states[0].upgrade = [
      { cost: { resources: [{ gold: 5 }] }, upgradeTo: 2 },
      { cost: { resources: [{ gold: 1 }] }, upgradeTo: 2 },
    ];
    const session = GameSession.start('g', catalog, DEFAULT_OPTIONS, 'standard', undefined, 'seed');
    const state = session.getState();
    const [produced, upgraded] = state.board.filter(id => state.instances[id].cardId === 1);
    session.execute({ type: 'resolveProduction', instanceId: produced, choiceIndex: 0 });

    // An index that does not lead to the state is ignored
    session.execute({
      type: 'resolveUpgrade',
      instanceId: upgraded,
      upgradeTo: 3,
      upgradeIndex: 1,
    });
    expect(session.getState().instances[upgraded].stateId).toBe(1);

    session.execute({
      type: 'resolveUpgrade',
      instanceId: upgraded,
      upgradeTo: 2,
      upgradeIndex: 1,
    });
    expect(session.getState().instances[upgraded].stateId).toBe(2);
    expect(session.getState().resources.gold ?? 0).toBe(0);
  });

  it('ignores upgrades of cards out of play', () => {
    const session = startGame();
    const instanceId = boardCard(session);
    session.execute({ type: 'resolveProduction', instanceId, choiceIndex: 0 });

    session.execute({ type: 'resolveUpgrade', instanceId, upgradeTo: 2 });

    expect(session.getState().instances[instanceId].stateId).toBe(1);
  });

  describe('production of a card that produces nothing', () => {
    const WORKSHOP = 9;
    const PERMANENT_WORKSHOP = 10;

    /** Workshops (no production): one on the board, one in the permanents. */
    function withWorkshops(): GameSession {
      const state = JSON.parse(JSON.stringify(startGame().getState())) as GameState;
      const moved = new Set([WORKSHOP, PERMANENT_WORKSHOP]);
      state.drawPile = state.drawPile.filter(id => !moved.has(id));
      state.discardPile = state.discardPile.filter(id => !moved.has(id));
      state.board = [...state.board.filter(id => !moved.has(id)), WORKSHOP];
      state.permanents = [PERMANENT_WORKSHOP];
      return GameSession.restore(
        'game-1',
        [],
        makeCatalog(),
        DEFAULT_OPTIONS,
        {},
        { seq: 0, state },
      );
    }

    it('ignores it on the board', () => {
      const session = withWorkshops();
      session.execute({ type: 'resolveProduction', instanceId: WORKSHOP, choiceIndex: 0 });

      expect(session.getEvents()).toHaveLength(0);
      expect(session.getState().board).toContain(WORKSHOP);
    });

    it('ignores it in the permanents, which would put the card in two piles', () => {
      const session = withWorkshops();
      session.execute({
        type: 'resolveProduction',
        instanceId: PERMANENT_WORKSHOP,
        choiceIndex: 0,
      });

      expect(session.getEvents()).toHaveLength(0);
      expect(session.getState().discardPile).not.toContain(PERMANENT_WORKSHOP);
    });

    it('ignores a production choice the card does not offer', () => {
      const session = withWorkshops();
      const field = boardCard(session);
      session.execute({ type: 'resolveProduction', instanceId: field, choiceIndex: 5 });

      expect(session.getEvents()).toHaveLength(0);
      expect(session.getState().board).toContain(field);
    });
  });

  it('ignores actions that do not exist on the card', () => {
    const session = startGame();
    const before = session.getEvents().length;

    const error = session.execute({
      type: 'resolveAction',
      instanceId: boardCard(session),
      actionId: 'missing',
    });

    expect(error).toBeUndefined();
    expect(session.getEvents()).toHaveLength(before);
  });

  it('ignores commands on unknown instances', () => {
    const session = startGame();
    const before = session.getEvents().length;

    session.execute({ type: 'resolveProduction', instanceId: 999, choiceIndex: 0 });
    session.execute({ type: 'chooseState', instanceId: 999, stateId: 1 });
    session.execute({ type: 'resolveUpgrade', instanceId: 999, upgradeTo: 2 });

    expect(session.getEvents()).toHaveLength(before);
  });

  it('chooses the state of a card discovered during a turn', () => {
    const catalog = makeCatalog();
    catalog.cards[1] = { ...catalog.cards[1], chooseState: [1, 2] };
    const session = GameSession.start('game-1', catalog, { ...DEFAULT_OPTIONS, allowCheats: true });
    session.execute({ type: 'cheat', cheat: { op: 'discoverCard', instanceIds: [11] } });

    session.execute({ type: 'chooseState', instanceId: 11, stateId: 2 });

    expect(session.getState().phase).toBe(Phase.PLAYING);
    expect(session.getState().instances[11].stateId).toBe(2);
  });

  it('reports an invalid choice type as a cancelled action', () => {
    const session = startGame();

    const error = session.execute({
      type: 'resolvePlayerChoice',
      choice: { id: 'x', type: 'add_resources' as never, sourceInstanceId: 1 },
      choiceType: 'not_a_choice',
    });

    expect(error).toEqual({
      code: 'ACTION_CANCELLED',
      message: 'errors.actionCancelled',
    });
    expect(session.toView().pendingChoices).toBeNull();
  });

  it('stores trimmed card names and removes empty ones', () => {
    const session = startGame();

    session.execute({ type: 'setCardName', instanceId: 3, name: '  Bessie  ' });
    expect(session.getCardNames()).toEqual({ '3': 'Bessie' });

    session.execute({ type: 'setCardName', instanceId: 3, name: '   ' });
    expect(session.getCardNames()).toEqual({});
  });

  it('ignores unknown expansions', () => {
    const session = startGame();
    const before = session.getEvents().length;

    session.execute({ type: 'selectExpansion', name: 'nope' });

    expect(session.getEvents()).toHaveLength(before);
  });
});

describe('GameSession rewind', () => {
  it('rewinds an event that did not reveal cards', () => {
    const session = startGame();
    const gold = session.getState().resources.gold ?? 0;
    session.execute({ type: 'resolveProduction', instanceId: boardCard(session), choiceIndex: 0 });
    const count = session.getEvents().length;

    expect(session.canRewind()).toBe(true);
    session.execute({ type: 'rewind' });

    expect(session.getEvents()).toHaveLength(count - 1);
    expect(session.getState().resources.gold ?? 0).toBe(gold);
  });

  it('refuses to rewind a turn start that drew cards', () => {
    const session = startGame();
    const last = session.getEvents().at(-1);

    expect(last?.type).toBe(GameEventType.TURN_STARTED);
    expect(session.canRewind()).toBe(false);
  });

  it('rewinds several events to the state a replay of the remaining log gives', () => {
    const played = startGame();
    const field = boardCard(played);
    played.execute({ type: 'resolveProduction', instanceId: field, choiceIndex: 0 });
    // A restored session rewinds too, from the states kept while replaying.
    const session = GameSession.restore(
      'game-1',
      played.getEvents(),
      makeCatalog(),
      DEFAULT_OPTIONS,
    );
    session.execute({ type: 'resolveProduction', instanceId: boardCard(session), choiceIndex: 0 });

    session.execute({ type: 'rewind' });
    session.execute({ type: 'rewind' });

    const replayed = GameSession.restore(
      'game-1',
      session.getEvents(),
      makeCatalog(),
      DEFAULT_OPTIONS,
    );
    expect(session.getState()).toEqual(replayed.getState());
    expect(session.canRewind()).toBe(false);
  });

  it('allows any rewind when unrestricted, replaying the log past a draw', () => {
    const session = startGame({ ...DEFAULT_OPTIONS, unrestrictedRewind: true });
    const count = session.getEvents().length;

    expect(session.canRewind()).toBe(true);
    session.execute({ type: 'rewind' });

    expect(session.getEvents()).toHaveLength(count - 1);
    expect(session.getState().board).toEqual([]);
  });
});

describe('GameSession cheats', () => {
  it('rejects cheats when disabled', () => {
    const session = startGame();

    expect(() =>
      session.execute({ type: 'cheat', cheat: { op: 'addResources', resources: { gold: 3 } } }),
    ).toThrow(ForbiddenCommandError);
  });

  it('applies cheats when enabled', () => {
    const session = startGame({ ...DEFAULT_OPTIONS, allowCheats: true });
    const gold = session.getState().resources.gold ?? 0;

    session.execute({ type: 'cheat', cheat: { op: 'addResources', resources: { gold: 3 } } });

    expect(session.getState().resources.gold).toBe(gold + 3);
  });
});

describe('GameSession.restore', () => {
  it('rebuilds the same state from the event log', () => {
    const session = startGame();
    session.execute({ type: 'resolveProduction', instanceId: boardCard(session), choiceIndex: 0 });

    const restored = GameSession.restore(
      'game-1',
      session.getEvents(),
      makeCatalog(),
      DEFAULT_OPTIONS,
      { '1': 'Named' },
    );

    expect(restored.getState()).toEqual(session.getState());
    expect(restored.getCardNames()).toEqual({ '1': 'Named' });
  });

  it('flags an unreadable event log as corrupted', () => {
    const broken = [{ id: 'x', type: GameEventType.CARD_PRODUCED, timestamp: 0 }] as GameEvent[];

    expect(() => GameSession.restore('g', broken, makeCatalog(), DEFAULT_OPTIONS)).toThrow(
      CorruptedGameError,
    );
  });
});
