import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CampaignSegmentScore } from './presentation/dto/campaign-segment-score.schema';
import type { GameSummary } from './presentation/dto/game-summary.dto';
import type { GameCheckpoint, GameEvent, GameState } from '@deck-legacy/engine/domain/types';
import { ConflictException, Injectable } from '@nestjs/common';

export type GameMeta = {
  userId: string;
  version: number;
  checkpoint: GameCheckpoint | null;
};

export type StoredGame = {
  id: string;
  userId: string;
  name: string;
  version: number;
  cardNames: Record<string, string>;
  events: GameEvent[];
  checkpoint: GameCheckpoint | null;
  updatedAt: Date;
};

export type GameSnapshot = {
  name: string;
  cardNames: Record<string, string>;
  score: number;
  segments: CampaignSegmentScore[];
  finished: boolean;
  /**
   * The log was produced by the player's commands (EDR-051). `undefined`: a log without a seed,
   * which cannot be verified: a new game is stored unverified, a stored one keeps its flag.
   */
  verified?: boolean;
  events: GameEvent[];
  /** State kept at the start of the last round (EDR-052); `null` when there is none yet. */
  checkpoint: GameCheckpoint | null;
};

export type Transaction = Prisma.TransactionClient;

type GameRow = {
  id: string;
  name: string;
  version: number;
  score: number;
  segments: Prisma.JsonValue;
  status: string;
  updatedAt: Date;
  _count: { events: number };
};

function toCardNames(value: Prisma.JsonValue): Record<string, string> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
  const names: Record<string, string> = {};
  for (const [key, name] of Object.entries(value)) {
    if (typeof name === 'string') names[key] = name;
  }
  return names;
}

export function toSegments(value: Prisma.JsonValue): CampaignSegmentScore[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(item => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) return [];
    const { segment, score } = item;
    return typeof segment === 'string' && typeof score === 'number' ? [{ segment, score }] : [];
  });
}

function eventRows(gameId: string, events: GameEvent[], fromSeq: number) {
  return events.slice(fromSeq).map((event, index) => ({
    gameId,
    seq: fromSeq + index,
    eventId: event.id,
    type: event.type,
    payload: event as unknown as Prisma.InputJsonValue,
  }));
}

function toCheckpoint(seq: number | null, state: Prisma.JsonValue): GameCheckpoint | null {
  return seq === null || state === null ? null : { seq, state: state as unknown as GameState };
}

function checkpointColumns(checkpoint: GameCheckpoint | null) {
  return {
    checkpointSeq: checkpoint?.seq ?? null,
    checkpointState: checkpoint
      ? (checkpoint.state as unknown as Prisma.InputJsonValue)
      : Prisma.DbNull,
  };
}

function toSummary(row: GameRow): GameSummary {
  return {
    id: row.id,
    name: row.name,
    version: row.version,
    eventCount: row._count.events,
    score: row.score,
    segments: toSegments(row.segments),
    finished: row.status === 'FINISHED',
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Refuses a new (or revived) kingdom once the player has `limit` non-abandoned games. */
async function assertBelowLimit(tx: Transaction, userId: string, limit: number): Promise<void> {
  const kingdoms = await tx.game.count({
    where: { userId, status: { in: ['ACTIVE', 'FINISHED'] } },
  });
  if (kingdoms >= limit) {
    throw new ConflictException({ code: 'KINGDOM_LIMIT', message: 'errors.kingdomLimit' });
  }
}

const SUMMARY_SELECT = {
  id: true,
  name: true,
  version: true,
  score: true,
  segments: true,
  status: true,
  updatedAt: true,
  _count: { select: { events: true } },
} as const;

@Injectable()
export class GamesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Latest non-abandoned game of a player. */
  async findCurrent(userId: string): Promise<GameSummary | null> {
    const row = await this.prisma.game.findFirst({
      where: { userId, status: { in: ['ACTIVE', 'FINISHED'] } },
      orderBy: { updatedAt: 'desc' },
      select: SUMMARY_SELECT,
    });
    return row ? toSummary(row) : null;
  }

  /** Non-abandoned games (kingdoms) of a player, most recently synced first. */
  async list(userId: string): Promise<GameSummary[]> {
    const rows = await this.prisma.game.findMany({
      where: { userId, status: { in: ['ACTIVE', 'FINISHED'] } },
      orderBy: { updatedAt: 'desc' },
      select: SUMMARY_SELECT,
    });
    return rows.map(toSummary);
  }

  async getSummary(gameId: string): Promise<GameSummary> {
    return toSummary(
      await this.prisma.game.findUniqueOrThrow({ where: { id: gameId }, select: SUMMARY_SELECT }),
    );
  }

  /** Owner, version and checkpoint of a game, whatever its status. */
  async getMeta(gameId: string): Promise<GameMeta | null> {
    const row = await this.prisma.game.findUnique({
      where: { id: gameId },
      select: { userId: true, version: true, checkpointSeq: true, checkpointState: true },
    });
    if (!row) return null;
    const { checkpointSeq, checkpointState, ...meta } = row;
    return { ...meta, checkpoint: toCheckpoint(checkpointSeq, checkpointState) };
  }

  async getEventIds(gameId: string): Promise<string[]> {
    const rows = await this.prisma.gameEvent.findMany({
      where: { gameId },
      orderBy: { seq: 'asc' },
      select: { eventId: true },
    });
    return rows.map(row => row.eventId);
  }

  /** Stored events before `seq` `before`, in order (the part of the log a delta sync keeps). */
  async getEventPayloads(gameId: string, before: number): Promise<GameEvent[]> {
    const rows = await this.prisma.gameEvent.findMany({
      where: { gameId, seq: { lt: before } },
      orderBy: { seq: 'asc' },
      select: { payload: true },
    });
    return rows.map(row => row.payload as unknown as GameEvent);
  }

  /** Full game for export; abandoned games are hidden. */
  async load(gameId: string): Promise<StoredGame | null> {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { events: { orderBy: { seq: 'asc' }, select: { payload: true } } },
    });
    if (!game || game.status === 'ABANDONED') return null;
    return {
      id: game.id,
      userId: game.userId,
      name: game.name,
      version: game.version,
      cardNames: toCardNames(game.cardNames),
      events: game.events.map(row => row.payload as unknown as GameEvent),
      checkpoint: toCheckpoint(game.checkpointSeq, game.checkpointState),
      updatedAt: game.updatedAt,
    };
  }

  /**
   * Creates a game (a new kingdom). Refused with `KINGDOM_LIMIT` when the player already has
   * `limit` non-abandoned games.
   */
  async create(
    gameId: string,
    userId: string,
    limit: number,
    snapshot: GameSnapshot,
    afterWrite?: (tx: Transaction) => Promise<void>,
  ): Promise<void> {
    await this.prisma.$transaction(async tx => {
      await assertBelowLimit(tx, userId, limit);
      await tx.game.create({
        data: {
          id: gameId,
          userId,
          version: 1,
          name: snapshot.name,
          cardNames: snapshot.cardNames,
          score: snapshot.score,
          segments: snapshot.segments,
          status: snapshot.finished ? 'FINISHED' : 'ACTIVE',
          verified: snapshot.verified ?? false,
          ...checkpointColumns(snapshot.checkpoint),
        },
      });
      await tx.gameEvent.createMany({ data: eventRows(gameId, snapshot.events, 0) });
      if (afterWrite) await afterWrite(tx);
    });
  }

  /**
   * Replaces the event log from `fromSeq` (the first event that differs from the stored log)
   * and bumps the version. A previously abandoned game becomes active again, within the
   * player's kingdom limit.
   */
  async save(
    gameId: string,
    userId: string,
    limit: number,
    fromSeq: number,
    snapshot: GameSnapshot,
    afterWrite?: (tx: Transaction) => Promise<void>,
  ): Promise<void> {
    await this.prisma.$transaction(async tx => {
      const current = await tx.game.findUniqueOrThrow({
        where: { id: gameId },
        select: { status: true },
      });
      if (current.status === 'ABANDONED') await assertBelowLimit(tx, userId, limit);
      await tx.game.update({
        where: { id: gameId },
        data: {
          version: { increment: 1 },
          name: snapshot.name,
          cardNames: snapshot.cardNames,
          score: snapshot.score,
          segments: snapshot.segments,
          status: snapshot.finished ? 'FINISHED' : 'ACTIVE',
          verified: snapshot.verified,
          ...checkpointColumns(snapshot.checkpoint),
        },
      });
      await tx.gameEvent.deleteMany({ where: { gameId, seq: { gte: fromSeq } } });
      if (snapshot.events.length > fromSeq) {
        await tx.gameEvent.createMany({ data: eventRows(gameId, snapshot.events, fromSeq) });
      }
      if (afterWrite) await afterWrite(tx);
    });
  }

  async abandon(gameId: string, userId: string): Promise<boolean> {
    const result = await this.prisma.game.updateMany({
      where: { id: gameId, userId },
      data: { status: 'ABANDONED' },
    });
    return result.count > 0;
  }
}
