import { PrismaService } from '../prisma/prisma.service';
import type { LeaderboardResponse, ScoreEntry } from '@deck-legacy/api-contract';
import { Injectable } from '@nestjs/common';

type ScoreWriter = Pick<PrismaService, 'score'>;

type ScoreRow = {
  id: string;
  gameId: string;
  segment: string;
  score: number;
  createdAt: Date;
  user: { displayName: string | null };
};

function toEntry(row: ScoreRow): ScoreEntry {
  return {
    id: row.id,
    gameId: row.gameId,
    segment: row.segment,
    score: row.score,
    createdAt: row.createdAt.toISOString(),
    displayName: row.user.displayName,
  };
}

@Injectable()
export class ScoresService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mirrors the campaign scores of a game (one per finished segment) into the Score table.
   * Segments that disappeared (after a rewind) are removed.
   */
  async syncGameScores(
    db: ScoreWriter,
    userId: string,
    gameId: string,
    campaignScores: Record<string, number>,
  ): Promise<void> {
    const segments = Object.keys(campaignScores);
    await db.score.deleteMany({ where: { gameId, segment: { notIn: segments } } });
    for (const segment of segments) {
      const score = campaignScores[segment];
      await db.score.upsert({
        where: { gameId_segment: { gameId, segment } },
        create: { userId, gameId, segment, score },
        update: { score },
      });
    }
  }

  /** Best scores of registered (non-anonymous) players for a campaign segment. */
  async leaderboard(segment: string, limit: number): Promise<LeaderboardResponse> {
    const rows = await this.prisma.score.findMany({
      where: { segment, user: { isAnonymous: false } },
      orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
      take: limit,
      include: { user: { select: { displayName: true } } },
    });
    return { segment, entries: rows.map(toEntry) };
  }

  async forUser(userId: string): Promise<ScoreEntry[]> {
    const rows = await this.prisma.score.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { user: { select: { displayName: true } } },
    });
    return rows.map(toEntry);
  }
}
