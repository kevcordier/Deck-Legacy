import { AppModule } from '../src/app.module';
import { SUPABASE_JWKS } from '../src/auth/infrastructure/supabase-jwks.token';
import { configureApp } from '../src/bootstrap';
import { APP_CONFIG } from '../src/config/app-config.token';
import { GamesRepository } from '../src/games/application/games.repository';
import type { GameSummary } from '../src/games/application/models/game-summary';
import { ScoreMirror } from '../src/games/application/score-mirror';
import type { GameSnapshot } from '../src/games/domain/game-snapshot';
import { PrismaService } from '../src/prisma/prisma.service';
import { ScoresRepository } from '../src/scores/application/scores.repository';
import { EnsureUserUseCase } from '../src/users/application/ensure-user.use-case';
import { IdentityAdmin } from '../src/users/application/identity-admin';
import { UsersRepository } from '../src/users/application/users.repository';
import { signToken, testConfig, testJwks } from './helpers';
import { GameSession } from '@deck-legacy/engine/application/session/GameSession';
import { Phase } from '@deck-legacy/engine/domain/enums';
import { checkpointSeq } from '@deck-legacy/engine/domain/state/checkpointSeq';
import type { GameCheckpoint, GameEvent, GameStartedEvent } from '@deck-legacy/engine/domain/types';
import { loadGameCatalog } from '@deck-legacy/game-data';
import { ConflictException, Logger } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const ALICE = '0b6f5a52-3a3c-4f0e-9a37-5c4a1e2d9b10';
const BOB = '9c1e7d24-6b8a-4c3f-8e21-7a5d3f9b0c42';
/** A user whose sign-in fails for another reason than the token (database down…). */
const BROKEN = '5d2f8a61-1c4e-4b7a-9f03-2e6c8d4b1a57';
const OPTIONS = { allowCheats: true, unrestrictedRewind: false };

type Row = {
  id: string;
  userId: string;
  name: string;
  segments: GameSummary['segments'];
  version: number;
  status: string;
  score: number;
  cardNames: Record<string, string>;
  verified: boolean;
  events: GameEvent[];
  checkpoint: GameCheckpoint | null;
  updatedAt: Date;
};

/** In-memory stand-in for the Prisma repository. */
class InMemoryGamesRepository {
  readonly games = new Map<string, Row>();

  private summary(row: Row): GameSummary {
    return {
      id: row.id,
      name: row.name,
      version: row.version,
      eventCount: row.events.length,
      score: row.score,
      segments: row.segments,
      finished: row.status === 'FINISHED',
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async findCurrent(userId: string): Promise<GameSummary | null> {
    const mine = [...this.games.values()].filter(
      g => g.userId === userId && g.status !== 'ABANDONED',
    );
    const last = mine.at(-1);
    return last ? this.summary(last) : null;
  }

  private countKingdoms(userId: string): number {
    return [...this.games.values()].filter(g => g.userId === userId && g.status !== 'ABANDONED')
      .length;
  }

  private assertBelowLimit(userId: string, limit: number): void {
    if (this.countKingdoms(userId) >= limit) {
      throw new ConflictException({ code: 'KINGDOM_LIMIT', message: 'errors.kingdomLimit' });
    }
  }

  async list(userId: string): Promise<GameSummary[]> {
    return [...this.games.values()]
      .filter(g => g.userId === userId && g.status !== 'ABANDONED')
      .reverse()
      .map(g => this.summary(g));
  }

  async getSummary(gameId: string): Promise<GameSummary> {
    return this.summary(this.games.get(gameId) as Row);
  }

  async getMeta(gameId: string) {
    const row = this.games.get(gameId);
    return row
      ? { userId: row.userId, version: row.version, checkpoint: structuredClone(row.checkpoint) }
      : null;
  }

  async getEventIds(gameId: string): Promise<string[]> {
    return (this.games.get(gameId)?.events ?? []).map(e => e.id);
  }

  async getEventPayloads(gameId: string, before: number): Promise<GameEvent[]> {
    return structuredClone((this.games.get(gameId)?.events ?? []).slice(0, before));
  }

  async load(gameId: string) {
    const row = this.games.get(gameId);
    return row && row.status !== 'ABANDONED' ? structuredClone(row) : null;
  }

  async create(
    gameId: string,
    userId: string,
    limit: number,
    snapshot: GameSnapshot,
    afterWrite?: (tx: never) => Promise<void>,
  ): Promise<void> {
    this.assertBelowLimit(userId, limit);
    this.games.set(gameId, {
      id: gameId,
      userId,
      name: snapshot.name,
      segments: snapshot.segments,
      version: 1,
      status: snapshot.finished ? 'FINISHED' : 'ACTIVE',
      score: snapshot.score,
      cardNames: snapshot.cardNames,
      verified: snapshot.verified ?? false,
      events: structuredClone(snapshot.events),
      checkpoint: structuredClone(snapshot.checkpoint),
      updatedAt: new Date(),
    });
    if (afterWrite) await afterWrite({} as never);
  }

  async save(
    gameId: string,
    userId: string,
    limit: number,
    _fromSeq: number,
    snapshot: GameSnapshot,
    afterWrite?: (tx: never) => Promise<void>,
  ): Promise<void> {
    const row = this.games.get(gameId) as Row;
    if (row.status === 'ABANDONED') this.assertBelowLimit(userId, limit);
    row.version += 1;
    row.name = snapshot.name;
    row.segments = snapshot.segments;
    row.status = snapshot.finished ? 'FINISHED' : 'ACTIVE';
    row.score = snapshot.score;
    row.cardNames = snapshot.cardNames;
    row.verified = snapshot.verified ?? row.verified;
    row.events = structuredClone(snapshot.events);
    row.checkpoint = structuredClone(snapshot.checkpoint);
    row.updatedAt = new Date();
    if (afterWrite) await afterWrite({} as never);
  }

  async abandon(gameId: string, userId: string): Promise<boolean> {
    const row = this.games.get(gameId);
    if (row?.userId !== userId) return false;
    row.status = 'ABANDONED';
    return true;
  }
}

/** A board card with a production: the engine ignores the production of the others. */
function producingCard(session: GameSession): number {
  const { board, instances } = session.getState();
  const { cards } = loadGameCatalog();
  const id = board.find(cardId => {
    const { cardId: defId, stateId } = instances[cardId];
    const state = cards[defId].states.find(candidate => candidate.id === stateId);
    return state?.productions?.some(production => Object.keys(production).length > 0);
  });
  if (id === undefined) throw new Error('No card with a production on the board');
  return id;
}

/** Plays a few productions with the real engine, as the client does (fixed seed: same draws). */
function playedGame(commands = 1) {
  const session = GameSession.start(
    randomUUID(),
    loadGameCatalog(),
    OPTIONS,
    'standard',
    undefined,
    'e2e',
  );
  for (let i = 0; i < commands; i += 1) {
    session.execute({
      type: 'resolveProduction',
      instanceId: producingCard(session),
      choiceIndex: 0,
    });
  }
  return session;
}

/** Plays with the real engine until `round` starts, ending each turn at once. */
function playUntilRound(session: GameSession, round: number) {
  for (let step = 0; step < 500 && session.getState().round < round; step += 1) {
    const state = session.getState();
    const [triggerId] = Object.keys(state.triggerPile);
    if (triggerId) {
      const { sourceInstanceId, effectDef } = state.triggerPile[triggerId];
      session.execute({ type: 'skipTrigger', triggerId });
      if (session.getState().triggerPile[triggerId]) {
        session.execute({
          type: 'resolveAction',
          instanceId: sourceInstanceId,
          actionId: effectDef.id,
          triggerId,
        });
      }
    } else if (state.phase === Phase.PARCHMENT) session.execute({ type: 'dismissParchment' });
    else if (state.phase === Phase.PLAYING) session.execute({ type: 'endTurn' });
    else if (state.phase === Phase.ROUND_END) session.execute({ type: 'endRound' });
    else if (state.phase === Phase.PRE_GAME) session.execute({ type: 'startRound' });
    else session.execute({ type: 'startTurn' });
  }
  expect(session.getState().round).toBe(round);
  return session;
}

describe('Games sync API (e2e, in-memory storage)', () => {
  let app: NestExpressApplication;
  const repository = new InMemoryGamesRepository();
  const ensured: string[] = [];
  const syncedScores: Record<string, number>[] = [];
  const scores = {
    leaderboard: vi.fn(async (segment: string, limit: number) => ({ segment, limit, entries: [] })),
    kingdomLeaderboard: vi.fn(async (limit: number) => [{ limit }]),
    forUser: vi.fn(async (userId: string) => [{ userId }]),
  };
  const users = {
    getProfile: vi.fn(async (id: string) => ({ id, displayName: 'Ally' })),
    setDisplayName: vi.fn(async () => undefined),
    delete: vi.fn(async (_id: string, beforeCommit: () => Promise<void>) => beforeCommit()),
  };
  const identity = { deleteUser: vi.fn(async () => undefined) };
  let aliceToken: string;
  let bobToken: string;
  /** Plays the long games of the checkpoint tests, apart from Alice's kingdom limit. */
  let carolToken: string;

  beforeAll(async () => {
    const config = testConfig();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(APP_CONFIG)
      .useValue(config)
      .overrideProvider(SUPABASE_JWKS)
      .useValue(await testJwks())
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(GamesRepository)
      .useValue(repository)
      .overrideProvider(EnsureUserUseCase)
      .useValue({
        execute: async (u: { id: string }) => {
          if (u.id === BROKEN) throw new Error('database unavailable');
          ensured.push(u.id);
        },
        forget: () => undefined,
      })
      .overrideProvider(ScoresRepository)
      .useValue(scores)
      .overrideProvider(UsersRepository)
      .useValue(users)
      .overrideProvider(IdentityAdmin)
      .useValue(identity)
      .overrideProvider(ScoreMirror)
      .useValue({
        mirror: async (_tx: unknown, _u: string, _g: string, scores: Record<string, number>) => {
          syncedScores.push(scores);
        },
      })
      .compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    configureApp(app, config);
    await app.init();

    aliceToken = await signToken({ sub: ALICE, email: 'alice@test' });
    bobToken = await signToken({ sub: BOB, isAnonymous: true });
    carolToken = await signToken({ sub: randomUUID(), email: 'carol@test' });
  });

  afterAll(async () => {
    await app.close();
  });

  const as = (token: string) => ({ Authorization: `Bearer ${token}` });
  const put = (token: string, id: string, body: object) =>
    request(app.getHttpServer()).put(`/games/${id}`).set(as(token)).send(body);

  it('serves health without a token', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  // `pnpm --filter @deck-legacy/server generate:openapi` rewrites openapi.json when the API changes.
  it('serves the OpenAPI document without a token, matching openapi.json', async () => {
    const response = await request(app.getHttpServer()).get('/docs-json').expect(200);
    await expect(`${JSON.stringify(response.body, null, 2)}\n`).toMatchFileSnapshot(
      '../openapi.json',
    );
  });

  it('requires a token for games', async () => {
    const response = await request(app.getHttpServer()).get('/games/current').expect(401);
    expect(response.body.code).toBe('UNAUTHORIZED');
  });

  it('returns 404 when the player has no game', async () => {
    const response = await request(app.getHttpServer())
      .get('/games/current')
      .set(as(aliceToken))
      .expect(404);
    expect(response.body.code).toBe('NOT_FOUND');
    expect(ensured).toContain(ALICE);
  });

  it('creates a game on first sync, then updates it', async () => {
    const session = playedGame(0);
    const created = await put(aliceToken, session.id, { events: session.getEvents() }).expect(200);
    expect(created.body).toMatchObject({ id: session.id, version: 1, finished: false });
    expect(created.body.eventCount).toBe(session.getEvents().length);

    session.execute({
      type: 'resolveProduction',
      instanceId: producingCard(session),
      choiceIndex: 0,
    });
    const updated = await put(aliceToken, session.id, {
      events: session.getEvents(),
      cardNames: { 2: 'Daisy' },
    }).expect(200);
    expect(updated.body.version).toBe(2);
    expect(updated.body.score).toBe(session.getScore());
    expect(syncedScores.at(-1)).toEqual(session.getState().campaignScores);

    const current = await request(app.getHttpServer())
      .get('/games/current')
      .set(as(aliceToken))
      .expect(200);
    expect(current.body.id).toBe(session.id);
  });

  it('accepts a delta built on the stored version and replays the full log', async () => {
    const session = playedGame(0);
    const first = [...session.getEvents()];
    await put(aliceToken, session.id, { events: first }).expect(200);
    session.execute({
      type: 'resolveProduction',
      instanceId: producingCard(session),
      choiceIndex: 0,
    });

    const updated = await put(aliceToken, session.id, {
      events: session.getEvents().slice(first.length),
      fromSeq: first.length,
      baseVersion: 1,
    }).expect(200);

    expect(updated.body).toMatchObject({ version: 2, eventCount: session.getEvents().length });
    expect(updated.body.score).toBe(session.getScore());
    expect(repository.games.get(session.id)?.events).toEqual(session.getEvents());
  });

  it('refuses a sync built on another version, unless it has no base version', async () => {
    const session = playedGame();
    await put(aliceToken, session.id, { events: session.getEvents() }).expect(200);
    await put(aliceToken, session.id, { events: session.getEvents() }).expect(200);

    const stale = await put(aliceToken, session.id, {
      events: session.getEvents(),
      baseVersion: 1,
    }).expect(409);
    expect(stale.body.code).toBe('STALE_VERSION');
    // Clients older than the delta sync send no base version: the last writer wins.
    await put(aliceToken, session.id, { events: session.getEvents() }).expect(200);
  });

  it('refuses a delta starting after the stored log', async () => {
    const session = playedGame();
    const events = session.getEvents();
    const unknown = await put(aliceToken, randomUUID(), { events, fromSeq: 1 }).expect(409);
    expect(unknown.body.code).toBe('STALE_VERSION');

    // The events of `GameSession.start`, before the first recorded command.
    const start = events.findIndex(event => event.commands);
    await put(aliceToken, session.id, { events: events.slice(0, start) }).expect(200);
    await put(aliceToken, session.id, { events, fromSeq: start + 1, baseVersion: 1 }).expect(409);
  });

  it('rejects a delta that makes the log impossible to replay', async () => {
    const session = playedGame();
    await put(aliceToken, session.id, { events: session.getEvents() }).expect(200);
    const response = await put(aliceToken, session.id, {
      events: [{ id: 'x', type: 'cardProduced', timestamp: 0 }],
      fromSeq: session.getEvents().length,
      baseVersion: 1,
    }).expect(422);
    expect(response.body.code).toBe('INVALID_GAME');
  });

  it('keeps the state at the start of the last round and checks later syncs from it', async () => {
    const session = playUntilRound(playedGame(0), 2);
    const first = [...session.getEvents()];
    await put(carolToken, session.id, { events: first }).expect(200);
    const stored = repository.games.get(session.id)?.checkpoint;
    expect(stored?.seq).toBe(checkpointSeq(first));
    const exported = await request(app.getHttpServer())
      .get(`/games/${session.id}/export`)
      .set(as(carolToken))
      .expect(200);
    expect(exported.body.checkpoint).toEqual(stored);
    // Round 2 has not drawn yet: the checkpoint is the start of round 1.
    expect(stored?.state.round).toBe(1);

    playUntilRound(session, 3);
    const verify = vi.spyOn(GameSession, 'verify');
    const updated = await put(carolToken, session.id, {
      events: session.getEvents().slice(first.length),
      fromSeq: first.length,
      baseVersion: 1,
    }).expect(200);

    expect(verify.mock.calls[0][3]).toEqual(stored);
    expect(updated.body.score).toBe(session.getScore());
    expect(repository.games.get(session.id)?.checkpoint?.state.round).toBe(2);
    verify.mockRestore();
  });

  it('checks the whole log again when it changes before the checkpoint', async () => {
    const session = playUntilRound(playedGame(0), 3);
    const events = session.getEvents();
    await put(carolToken, session.id, { events }).expect(200);
    const seq = repository.games.get(session.id)?.checkpoint?.seq ?? 0;
    // The log as it was before the round of the checkpoint started.
    const earlier = events.slice(0, checkpointSeq(events.slice(0, seq - 1)));

    const verify = vi.spyOn(GameSession, 'verify');
    await put(carolToken, session.id, { events: earlier }).expect(200);

    expect(verify.mock.calls[0][3]).toBeUndefined();
    expect(repository.games.get(session.id)?.events).toHaveLength(earlier.length);
    verify.mockRestore();
  });

  it('carries a corrected checkpoint over to the next ones', async () => {
    // A game started before EDR-051 (no seed) can only be replayed.
    const session = playUntilRound(playedGame(0), 2);
    const events = structuredClone(session.getEvents());
    delete (events[0] as GameStartedEvent).seed;
    await put(carolToken, session.id, { events }).expect(200);
    const row = repository.games.get(session.id) as Row;
    // The maintainer repairs the game in the database.
    row.checkpoint = {
      ...(row.checkpoint as GameCheckpoint),
      state: { ...(row.checkpoint as GameCheckpoint).state, isLastRound: true },
    };

    playUntilRound(session, 3);
    await put(carolToken, session.id, {
      events: session.getEvents().slice(events.length),
      fromSeq: events.length,
      baseVersion: row.version,
    }).expect(200);

    expect(row.checkpoint?.state).toMatchObject({ round: 2, isLastRound: true });
  });

  it('verifies a game by running its recorded commands again', async () => {
    const session = playedGame(3);
    await put(aliceToken, session.id, { events: session.getEvents() }).expect(200);

    expect(repository.games.get(session.id)?.verified).toBe(true);
  });

  it('refuses a log the recorded commands do not produce', async () => {
    const session = playedGame(2);
    const events = structuredClone(session.getEvents());
    const produced = events.find(event => event.type === 'CARD_PRODUCED') as GameEvent & {
      productions: Record<string, number>;
    };
    produced.productions = { gold: 50 };

    const response = await put(aliceToken, session.id, { events }).expect(422);
    expect(response.body.code).toBe('INVALID_GAME');
    expect(repository.games.has(session.id)).toBe(false);
  });

  it('stores games started before the seed unverified', async () => {
    const session = playedGame(1);
    const [first, ...rest] = session.getEvents();
    const { seed: _seed, ...legacyStart } = first as GameEvent & { seed?: string };
    await put(aliceToken, session.id, { events: [legacyStart, ...rest] }).expect(200);

    expect(repository.games.get(session.id)?.verified).toBe(false);
  });

  it('keeps a game trusted by the migration verified when it syncs again', async () => {
    const session = playedGame(1);
    const [first, ...rest] = session.getEvents();
    const { seed: _seed, ...legacyStart } = first as GameEvent & { seed?: string };
    const events = [legacyStart, ...rest];
    await put(aliceToken, session.id, { events: events.slice(0, -1) }).expect(200);
    const row = repository.games.get(session.id);
    if (row) row.verified = true;

    await put(aliceToken, session.id, { events, baseVersion: row?.version }).expect(200);

    expect(repository.games.get(session.id)?.verified).toBe(true);
    repository.games.delete(session.id);
  });

  it('keeps its own copy of the events it already has', async () => {
    const session = playedGame(2);
    await put(aliceToken, session.id, { events: session.getEvents() }).expect(200);
    const score = repository.games.get(session.id)?.score;
    const tampered = structuredClone(session.getEvents());
    delete (tampered[0] as GameStartedEvent).seed;
    const produced = tampered.find(event => event.type === 'CARD_PRODUCED') as GameEvent & {
      productions: Record<string, number>;
    };
    produced.productions = { gold: 50 };

    await put(aliceToken, session.id, { events: tampered }).expect(200);

    const row = repository.games.get(session.id);
    expect(row?.events).toEqual(session.getEvents());
    expect(row?.score).toBe(score);
    expect(row?.verified).toBe(true);
    repository.games.delete(session.id);
  });

  it('drops the verified flag when an unverifiable log replaces the game start', async () => {
    const session = playedGame(1);
    await put(aliceToken, session.id, { events: session.getEvents() }).expect(200);
    const [first, ...rest] = session.getEvents();
    const { seed: _seed, ...legacyStart } = first as GameEvent & { seed?: string };

    await put(aliceToken, session.id, {
      events: [{ ...legacyStart, id: 'new-start' }, ...rest],
    }).expect(200);

    expect(repository.games.get(session.id)?.verified).toBe(false);
    repository.games.delete(session.id);
  });

  it('exports what was synced', async () => {
    const session = playedGame();
    await put(aliceToken, session.id, { events: session.getEvents(), cardNames: { 1: 'Bessie' } });

    const exported = await request(app.getHttpServer())
      .get(`/games/${session.id}/export`)
      .set(as(aliceToken))
      .expect(200);

    expect(exported.body.events).toEqual(session.getEvents());
    expect(exported.body.cardNames).toEqual({ '1': 'Bessie' });
    expect(exported.body.version).toBe(1);
  });

  it("hides and protects other players' games", async () => {
    const session = playedGame();
    await put(aliceToken, session.id, { events: session.getEvents() }).expect(200);

    await request(app.getHttpServer())
      .get(`/games/${session.id}/export`)
      .set(as(bobToken))
      .expect(404);
    const overwrite = await put(bobToken, session.id, { events: session.getEvents() }).expect(404);
    expect(overwrite.body.code).toBe('NOT_FOUND');
  });

  it('rejects event logs that cannot be replayed', async () => {
    const response = await put(aliceToken, randomUUID(), {
      events: [{ id: 'x', type: 'cardProduced', timestamp: 0 }],
    }).expect(422);
    expect(response.body.code).toBe('INVALID_GAME');
  });

  it('rejects empty logs and malformed bodies', async () => {
    await put(aliceToken, randomUUID(), { events: [] }).expect(422);
    const invalid = await put(aliceToken, randomUUID(), { events: 'nope' }).expect(400);
    expect(invalid.body.code).toBe('VALIDATION');
  });

  it('rejects games that used development cheats', async () => {
    // Added resources produce an ordinary CARD_PRODUCED event: only the cheat tag reveals it.
    const session = playedGame(0);
    session.execute({ type: 'cheat', cheat: { op: 'addResources', resources: { gold: 1 } } });

    const response = await put(aliceToken, session.id, { events: session.getEvents() }).expect(422);
    expect(response.body.message).toMatch(/cheats/);
  });

  it('rejects cheat card actions logged before the cheat tag existed', async () => {
    const session = playedGame(0);
    session.execute({
      type: 'cheat',
      cheat: { op: 'discardCard', instanceIds: [session.getState().board[0]] },
    });
    const events = session.getEvents().map(({ cheat: _cheat, ...event }) => event);

    const response = await put(aliceToken, session.id, { events }).expect(422);
    expect(response.body.message).toMatch(/cheats/);
  });

  it('lists the kingdoms of a player with their name', async () => {
    const session = playedGame();
    await put(aliceToken, session.id, { events: session.getEvents(), name: 'Avalon' }).expect(200);

    const list = await request(app.getHttpServer()).get('/games').set(as(aliceToken)).expect(200);

    expect(list.body[0]).toMatchObject({ id: session.id, name: 'Avalon', segments: [] });
    expect(list.body.length).toBeGreaterThan(1);
  });

  it('limits registered players to ten kingdoms', async () => {
    const existing = repository.games.size;
    const owned = [...repository.games.values()].filter(
      g => g.userId === ALICE && g.status !== 'ABANDONED',
    ).length;
    for (let i = owned; i < 10; i += 1) {
      const session = playedGame(0);
      await put(aliceToken, session.id, { events: session.getEvents() }).expect(200);
    }
    const extra = playedGame(0);

    const refused = await put(aliceToken, extra.id, { events: extra.getEvents() }).expect(409);

    expect(refused.body.code).toBe('KINGDOM_LIMIT');
    expect(repository.games.size).toBe(existing + 10 - owned);
  });

  it('abandons games and limits guests to one kingdom', async () => {
    const session = playedGame();
    await put(bobToken, session.id, { events: session.getEvents() }).expect(200);
    const second = playedGame(0);
    const refused = await put(bobToken, second.id, { events: second.getEvents() }).expect(409);
    expect(refused.body.code).toBe('KINGDOM_LIMIT');

    await request(app.getHttpServer()).delete('/games/current').set(as(bobToken)).expect(204);
    await request(app.getHttpServer())
      .get(`/games/${session.id}/export`)
      .set(as(bobToken))
      .expect(404);
    const missing = await request(app.getHttpServer())
      .delete(`/games/${randomUUID()}`)
      .set(as(bobToken))
      .expect(404);
    expect(missing.body.code).toBe('NOT_FOUND');

    await put(bobToken, second.id, { events: second.getEvents() }).expect(200);
    const revived = await put(bobToken, session.id, { events: session.getEvents() }).expect(409);
    expect(revived.body.code).toBe('KINGDOM_LIMIT');
  });

  it('serves the profile of the player and deletes the account', async () => {
    const profile = await request(app.getHttpServer()).get('/me').set(as(aliceToken)).expect(200);
    expect(profile.body).toEqual({ id: ALICE, displayName: 'Ally' });

    await request(app.getHttpServer())
      .patch('/me')
      .set(as(aliceToken))
      .send({ displayName: ' Arthur ' })
      .expect(200);
    expect(users.setDisplayName).toHaveBeenCalledWith(ALICE, 'Arthur');

    await request(app.getHttpServer()).delete('/me').set(as(aliceToken)).expect(204);
    expect(identity.deleteUser).toHaveBeenCalledWith(ALICE);
    expect(users.delete).toHaveBeenCalledWith(ALICE, expect.any(Function));
  });

  it('serves the leaderboards without a token, with a bounded size', async () => {
    const board = await request(app.getHttpServer()).get('/scores/leaderboard').expect(200);
    expect(board.body).toEqual({ segment: 'base', limit: 20, entries: [] });
    await request(app.getHttpServer()).get('/scores/leaderboard?segment=x&limit=0').expect(200);
    expect(scores.leaderboard).toHaveBeenLastCalledWith('x', 1);

    await request(app.getHttpServer()).get('/scores/kingdoms?limit=500').expect(200);
    expect(scores.kingdomLeaderboard).toHaveBeenLastCalledWith(100);
  });

  it("serves the player's own scores", async () => {
    const mine = await request(app.getHttpServer()).get('/scores/me').set(as(bobToken)).expect(200);
    expect(mine.body).toEqual([{ userId: BOB }]);
  });

  it('refuses a token that is not signed by the project', async () => {
    const token = await signToken({ sub: ALICE, foreignKey: true });
    const response = await request(app.getHttpServer()).get('/me').set(as(token)).expect(401);
    expect(response.body.code).toBe('UNAUTHORIZED');
  });

  it('answers a server error when signing in fails for another reason than the token', async () => {
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const token = await signToken({ sub: BROKEN });
    const response = await request(app.getHttpServer()).get('/me').set(as(token)).expect(500);
    expect(response.body.code).toBe('SERVER_ERROR');
  });
});
