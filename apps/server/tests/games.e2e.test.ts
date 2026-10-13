import { AppModule } from '../src/app.module';
import { SUPABASE_JWKS } from '../src/auth/supabase-token.verifier';
import { configureApp } from '../src/bootstrap';
import { APP_CONFIG } from '../src/config/env';
import { type GameSnapshot, GamesRepository } from '../src/games/games.repository';
import { PrismaService } from '../src/prisma/prisma.service';
import { ScoresService } from '../src/scores/scores.service';
import { UsersService } from '../src/users/users.service';
import { signToken, testConfig, testJwks } from './helpers';
import type { GameSummary } from '@deck-legacy/api-contract';
import { GameSession } from '@deck-legacy/engine/application/session/GameSession';
import type { GameEvent } from '@deck-legacy/engine/domain/types';
import { loadGameCatalog } from '@deck-legacy/game-data';
import { ConflictException } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const ALICE = '0b6f5a52-3a3c-4f0e-9a37-5c4a1e2d9b10';
const BOB = '9c1e7d24-6b8a-4c3f-8e21-7a5d3f9b0c42';
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
  events: GameEvent[];
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
    return row ? { userId: row.userId, version: row.version } : null;
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
      events: structuredClone(snapshot.events),
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
    row.events = structuredClone(snapshot.events);
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

/** Plays a few commands with the real engine, as the client does. */
function playedGame(commands = 1) {
  const session = GameSession.start(randomUUID(), loadGameCatalog(), OPTIONS);
  for (let i = 0; i < commands; i += 1) {
    session.execute({
      type: 'resolveProduction',
      instanceId: session.getState().board[0],
      choiceIndex: 0,
    });
  }
  return session;
}

describe('Games sync API (e2e, in-memory storage)', () => {
  let app: NestExpressApplication;
  const repository = new InMemoryGamesRepository();
  const ensured: string[] = [];
  const syncedScores: Record<string, number>[] = [];
  let aliceToken: string;
  let bobToken: string;

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
      .overrideProvider(UsersService)
      .useValue({
        ensureUser: async (u: { id: string }) => {
          ensured.push(u.id);
        },
      })
      .overrideProvider(ScoresService)
      .useValue({
        syncGameScores: async (
          _tx: unknown,
          _u: string,
          _g: string,
          scores: Record<string, number>,
        ) => {
          syncedScores.push(scores);
        },
      })
      .compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    configureApp(app, config);
    await app.init();

    aliceToken = await signToken({ sub: ALICE, email: 'alice@test' });
    bobToken = await signToken({ sub: BOB, isAnonymous: true });
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
      instanceId: session.getState().board[0],
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
      instanceId: session.getState().board[0],
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

    await put(aliceToken, session.id, { events: events.slice(0, 1) }).expect(200);
    await put(aliceToken, session.id, { events, fromSeq: 2, baseVersion: 1 }).expect(409);
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

  it('exports what was synced', async () => {
    const session = playedGame();
    await put(aliceToken, session.id, { events: session.getEvents(), cardNames: { 1: 'Bessie' } });

    const exported = await request(app.getHttpServer())
      .get(`/games/${session.id}/export`)
      .set(as(aliceToken))
      .expect(200);

    expect(exported.body.events).toEqual(session.getEvents());
    expect(exported.body.cardNames).toEqual({ '1': 'Bessie' });
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
    const session = playedGame(0);
    session.execute({ type: 'cheat', cheat: { op: 'addResources', resources: { gold: 1 } } });
    session.execute({
      type: 'cheat',
      cheat: { op: 'discardCard', instanceIds: [session.getState().board[0]] },
    });

    const response = await put(aliceToken, session.id, { events: session.getEvents() }).expect(422);
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
});
