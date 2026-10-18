import { ScoreMirror } from '../../games/application/score-mirror';
import type { Transaction } from '../../prisma/transaction';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaScoreMirror extends ScoreMirror {
  async mirror(
    tx: Transaction,
    userId: string,
    gameId: string,
    campaignScores: Record<string, number>,
  ): Promise<void> {
    const segments = Object.keys(campaignScores);
    await tx.score.deleteMany({ where: { gameId, segment: { notIn: segments } } });
    for (const segment of segments) {
      const score = campaignScores[segment];
      await tx.score.upsert({
        where: { gameId_segment: { gameId, segment } },
        create: { userId, gameId, segment, score },
        update: { score },
      });
    }
  }
}
