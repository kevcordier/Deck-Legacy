import { GamesRepository } from '../src/games/games.repository';
import { firstDifference } from '../src/games/games.service';
import type { PrismaService } from '../src/prisma/prisma.service';
import { ScoresService } from '../src/scores/scores.service';
import { UsersService } from '../src/users/users.service';
import { testConfig } from './helpers';
import type { GameEvent } from '@deck-legacy/engine/domain/types';
import { describe, expect, it, vi } from 'vitest';

const USER = '0b6f5a52-3a3c-4f0e-9a37-5c4a1e2d9b10';
const GAME = '9c1e7d24-6b8a-4c3f-8e21-7a5d3f9b0c42';

function events(count: number): GameEvent[] {
  return Array.from({ length: count }, (_, i) => ({ id: `e${i}`, type: 'advance', timestamp: i }));
}

function fakePrisma() {
  const tx = {
    game: {
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({}),
      create: vi.fn().mockResolvedValue({}),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn().mockResolvedValue({ status: 'ACTIVE' }),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
    gameEvent: {
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    score: {
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      upsert: vi.fn().mockResolvedValue({}),
      findMany: vi.fn().mockResolvedValue([]),
    },
    user: {
      upsert: vi.fn().mockResolvedValue({}),
      findUniqueOrThrow: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  };
  const prisma = {
    ...tx,
    $transaction: vi.fn(async (work: (client: typeof tx) => Promise<unknown>) => work(tx)),
  };
  return { prisma: prisma as unknown as PrismaService, tx };
}

const snapshot = (count: number) => ({
  name: 'Avalon',
  cardNames: {},
  score: 4,
  segments: [{ segment: 'base', score: 4 }],
  finished: false,
  events: events(count),
});

const summaryRow = {
  id: GAME,
  name: 'Avalon',
  version: 3,
  score: 12,
  segments: [{ segment: 'base', score: 12 }, { segment: 'Prosperity' }, 'junk'],
  status: 'FINISHED',
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  _count: { events: 7 },
};

describe('GamesRepository.save', () => {
  it('rewrites the log from the first differing event and bumps the version', async () => {
    const { prisma, tx } = fakePrisma();

    await new GamesRepository(prisma).save(GAME, USER, 10, 3, snapshot(5));

    expect(tx.game.update.mock.calls[0][0].data.version).toEqual({ increment: 1 });
    expect(tx.gameEvent.deleteMany).toHaveBeenCalledWith({
      where: { gameId: GAME, seq: { gte: 3 } },
    });
    const rows = tx.gameEvent.createMany.mock.calls[0][0].data;
    expect(rows.map((row: { seq: number }) => row.seq)).toEqual([3, 4]);
  });

  it('only truncates when the new log is a prefix of the stored one', async () => {
    const { prisma, tx } = fakePrisma();

    await new GamesRepository(prisma).save(GAME, USER, 10, 4, snapshot(4));

    expect(tx.gameEvent.deleteMany).toHaveBeenCalledOnce();
    expect(tx.gameEvent.createMany).not.toHaveBeenCalled();
  });

  it('runs the hook inside the transaction', async () => {
    const { prisma } = fakePrisma();
    const afterWrite = vi.fn().mockResolvedValue(undefined);

    await new GamesRepository(prisma).save(GAME, USER, 10, 4, snapshot(4), afterWrite);

    expect(afterWrite).toHaveBeenCalledOnce();
  });

  it('stores the kingdom name and ordered segments', async () => {
    const { prisma, tx } = fakePrisma();

    await new GamesRepository(prisma).save(GAME, USER, 10, 0, snapshot(1));

    expect(tx.game.update.mock.calls[0][0].data).toMatchObject({
      name: 'Avalon',
      segments: [{ segment: 'base', score: 4 }],
    });
    expect(tx.game.count).not.toHaveBeenCalled();
  });

  it('revives an abandoned game only within the kingdom limit', async () => {
    const { prisma, tx } = fakePrisma();
    const repository = new GamesRepository(prisma);
    tx.game.findUniqueOrThrow.mockResolvedValue({ status: 'ABANDONED' });

    await repository.save(GAME, USER, 10, 0, snapshot(1));
    expect(tx.game.update).toHaveBeenCalledOnce();

    tx.game.count.mockResolvedValue(10);
    await expect(repository.save(GAME, USER, 10, 0, snapshot(1))).rejects.toThrow(
      'errors.kingdomLimit',
    );
  });
});

describe('GamesRepository reads and creation', () => {
  it('creates a kingdom without touching the other games', async () => {
    const { prisma, tx } = fakePrisma();
    const afterWrite = vi.fn().mockResolvedValue(undefined);

    await new GamesRepository(prisma).create(
      GAME,
      USER,
      10,
      { ...snapshot(2), finished: true },
      afterWrite,
    );

    expect(tx.game.updateMany).not.toHaveBeenCalled();
    expect(tx.game.count).toHaveBeenCalledWith({
      where: { userId: USER, status: { in: ['ACTIVE', 'FINISHED'] } },
    });
    expect(tx.game.create.mock.calls[0][0].data).toMatchObject({
      status: 'FINISHED',
      version: 1,
      name: 'Avalon',
    });
    expect(tx.gameEvent.createMany.mock.calls[0][0].data).toHaveLength(2);
    expect(afterWrite).toHaveBeenCalledOnce();
  });

  it('refuses a kingdom above the limit', async () => {
    const { prisma, tx } = fakePrisma();
    tx.game.count.mockResolvedValue(1);

    await expect(new GamesRepository(prisma).create(GAME, USER, 1, snapshot(1))).rejects.toThrow(
      'errors.kingdomLimit',
    );
    expect(tx.game.create).not.toHaveBeenCalled();
  });

  it('lists the kingdoms of a player', async () => {
    const { prisma, tx } = fakePrisma();
    tx.game.findMany.mockResolvedValueOnce([summaryRow]);

    const list = await new GamesRepository(prisma).list(USER);

    expect(list).toHaveLength(1);
    expect(list[0].segments).toEqual([{ segment: 'base', score: 12 }]);
  });

  it('loads a game with its ordered events and sanitised card names', async () => {
    const { prisma, tx } = fakePrisma();
    const updatedAt = new Date();
    tx.game.findUnique.mockResolvedValue({
      id: GAME,
      userId: USER,
      name: 'Avalon',
      status: 'ACTIVE',
      cardNames: { 1: 'Bessie', 2: 42 },
      updatedAt,
      events: events(2).map(payload => ({ payload })),
    });

    const game = await new GamesRepository(prisma).load(GAME);

    expect(game).toEqual({
      id: GAME,
      userId: USER,
      name: 'Avalon',
      cardNames: { '1': 'Bessie' },
      events: events(2),
      updatedAt,
    });
  });

  it('hides abandoned and missing games', async () => {
    const { prisma, tx } = fakePrisma();
    const repository = new GamesRepository(prisma);

    tx.game.findUnique.mockResolvedValueOnce(null);
    await expect(repository.load(GAME)).resolves.toBeNull();

    tx.game.findUnique.mockResolvedValueOnce({ status: 'ABANDONED', events: [] });
    await expect(repository.load(GAME)).resolves.toBeNull();
  });

  it('summarises the current game', async () => {
    const { prisma, tx } = fakePrisma();
    const repository = new GamesRepository(prisma);

    tx.game.findFirst.mockResolvedValueOnce(summaryRow);
    await expect(repository.findCurrent(USER)).resolves.toEqual({
      id: GAME,
      name: 'Avalon',
      version: 3,
      eventCount: 7,
      score: 12,
      segments: [{ segment: 'base', score: 12 }],
      finished: true,
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    tx.game.findFirst.mockResolvedValueOnce(null);
    await expect(repository.findCurrent(USER)).resolves.toBeNull();

    tx.game.findUniqueOrThrow.mockResolvedValueOnce(summaryRow);
    await expect(repository.getSummary(GAME)).resolves.toMatchObject({ eventCount: 7 });
  });

  it('reads metadata and event ids', async () => {
    const { prisma, tx } = fakePrisma();
    const repository = new GamesRepository(prisma);
    tx.game.findUnique.mockResolvedValueOnce({ userId: USER, version: 2 });
    tx.gameEvent.findMany.mockResolvedValueOnce([{ eventId: 'e0' }, { eventId: 'e1' }]);

    await expect(repository.getMeta(GAME)).resolves.toEqual({ userId: USER, version: 2 });
    await expect(repository.getEventIds(GAME)).resolves.toEqual(['e0', 'e1']);
  });

  it('reports whether a game was abandoned', async () => {
    const { prisma, tx } = fakePrisma();
    const repository = new GamesRepository(prisma);

    await expect(repository.abandon(GAME, USER)).resolves.toBe(true);
    tx.game.updateMany.mockResolvedValueOnce({ count: 0 });
    await expect(repository.abandon(GAME, USER)).resolves.toBe(false);
  });
});

describe('ScoresService', () => {
  it('mirrors campaign scores and drops rewound segments', async () => {
    const { prisma, tx } = fakePrisma();

    await new ScoresService(prisma).syncGameScores(tx as never, USER, GAME, { base: 31 });

    expect(tx.score.deleteMany).toHaveBeenCalledWith({
      where: { gameId: GAME, segment: { notIn: ['base'] } },
    });
    expect(tx.score.upsert).toHaveBeenCalledWith({
      where: { gameId_segment: { gameId: GAME, segment: 'base' } },
      create: { userId: USER, gameId: GAME, segment: 'base', score: 31 },
      update: { score: 31 },
    });
  });

  it('ranks registered players only', async () => {
    const { prisma, tx } = fakePrisma();
    tx.score.findMany.mockResolvedValue([
      {
        id: 's1',
        gameId: GAME,
        segment: 'base',
        score: 40,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        user: { displayName: 'Alice' },
      },
    ]);

    const board = await new ScoresService(prisma).leaderboard('base', 5);

    expect(tx.score.findMany.mock.calls[0][0].where).toEqual({
      segment: 'base',
      user: { isAnonymous: false },
    });
    expect(board.entries[0]).toEqual({
      id: 's1',
      gameId: GAME,
      segment: 'base',
      score: 40,
      createdAt: '2026-01-01T00:00:00.000Z',
      displayName: 'Alice',
    });
  });

  it("lists a player's own scores", async () => {
    const { prisma, tx } = fakePrisma();

    await expect(new ScoresService(prisma).forUser(USER)).resolves.toEqual([]);
    expect(tx.score.findMany.mock.calls[0][0].where).toEqual({ userId: USER });
  });
});

describe('UsersService', () => {
  const identity = { id: USER, email: 'a@b.c', isAnonymous: false };

  it('upserts a user once until their identity changes', async () => {
    const { prisma, tx } = fakePrisma();
    const users = new UsersService(prisma, testConfig());

    await users.ensureUser(identity);
    await users.ensureUser(identity);
    expect(tx.user.upsert).toHaveBeenCalledOnce();

    await users.ensureUser({ ...identity, email: 'new@b.c' });
    expect(tx.user.upsert).toHaveBeenCalledTimes(2);
  });

  it('returns and updates the profile', async () => {
    const { prisma, tx } = fakePrisma();
    tx.user.findUniqueOrThrow.mockResolvedValue({
      id: USER,
      displayName: 'Ally',
      isAnonymous: false,
      email: 'a@b.c',
    });

    const profile = await new UsersService(prisma, testConfig()).updateDisplayName(USER, 'Ally');

    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: USER },
      data: { displayName: 'Ally' },
    });
    expect(profile).toEqual({ id: USER, displayName: 'Ally', isAnonymous: false, email: 'a@b.c' });
  });
});

describe('UsersService.deleteAccount', () => {
  const withKey = () => testConfig({ SUPABASE_SERVICE_ROLE_KEY: 'service-key' });

  it('is unavailable without the service role key', async () => {
    const { prisma, tx } = fakePrisma();

    await expect(new UsersService(prisma, testConfig()).deleteAccount(USER)).rejects.toThrow(
      'errors.accountDeletionUnavailable',
    );
    expect(tx.user.deleteMany).not.toHaveBeenCalled();
  });

  it('deletes the Supabase user, then the data', async () => {
    const { prisma, tx } = fakePrisma();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null));

    await new UsersService(prisma, withKey()).deleteAccount(USER);

    expect(fetchMock).toHaveBeenCalledWith(
      `https://project.supabase.test/auth/v1/admin/users/${USER}`,
      expect.objectContaining({
        method: 'DELETE',
        headers: { apikey: 'service-key', Authorization: 'Bearer service-key' },
      }),
    );
    expect(tx.user.deleteMany).toHaveBeenCalledWith({ where: { id: USER } });
    fetchMock.mockRestore();
  });

  it('sends a secret key in the apikey header only', async () => {
    const { prisma } = fakePrisma();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null));
    const config = testConfig({ SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_key' });

    await new UsersService(prisma, config).deleteAccount(USER);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ headers: { apikey: 'sb_secret_key' } }),
    );
    fetchMock.mockRestore();
  });

  it('removes the data of a user already deleted in Supabase', async () => {
    const { prisma, tx } = fakePrisma();
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 404 }));

    await new UsersService(prisma, withKey()).deleteAccount(USER);

    expect(tx.user.deleteMany).toHaveBeenCalledOnce();
    fetchMock.mockRestore();
  });

  it('keeps the data when Supabase refuses the deletion', async () => {
    const { prisma, tx } = fakePrisma();
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 500 }));

    await expect(new UsersService(prisma, withKey()).deleteAccount(USER)).rejects.toThrow(
      'errors.accountDeletionFailed',
    );
    expect(tx.user.deleteMany).not.toHaveBeenCalled();
    fetchMock.mockRestore();
  });
});

describe('firstDifference', () => {
  it('finds the first event that changed', () => {
    expect(firstDifference(['e0', 'e1', 'e2'], events(3))).toBe(3);
    expect(firstDifference(['e0', 'x', 'e2'], events(3))).toBe(1);
    expect(firstDifference(['e0', 'e1', 'e2', 'e3'], events(2))).toBe(2);
    expect(firstDifference([], events(2))).toBe(0);
  });
});
