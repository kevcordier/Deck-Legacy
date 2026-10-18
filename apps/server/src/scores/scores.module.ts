import { ScoreMirror } from '../games/application/score-mirror';
import { GetKingdomLeaderboardUseCase } from './application/get-kingdom-leaderboard.use-case';
import { GetLeaderboardUseCase } from './application/get-leaderboard.use-case';
import { GetMyScoresUseCase } from './application/get-my-scores.use-case';
import { ScoresRepository } from './application/scores.repository';
import { PrismaScoreMirror } from './infrastructure/prisma-score-mirror';
import { PrismaScoresRepository } from './infrastructure/prisma-scores.repository';
import { ScoresController } from './presentation/scores.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [ScoresController],
  providers: [
    { provide: ScoresRepository, useClass: PrismaScoresRepository },
    { provide: ScoreMirror, useClass: PrismaScoreMirror },
    GetLeaderboardUseCase,
    GetKingdomLeaderboardUseCase,
    GetMyScoresUseCase,
  ],
  exports: [ScoreMirror],
})
export class ScoresModule {}
