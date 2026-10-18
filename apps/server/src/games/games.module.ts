import { ScoresModule } from '../scores/scores.module';
import { AbandonGameUseCase } from './application/abandon-game.use-case';
import { ExportGameUseCase } from './application/export-game.use-case';
import { GameLock } from './application/game-lock';
import { GameValidator } from './application/game-validator';
import { GamesRepository } from './application/games.repository';
import { GetCurrentGameUseCase } from './application/get-current-game.use-case';
import { ListGamesUseCase } from './application/list-games.use-case';
import { SyncGameUseCase } from './application/sync-game.use-case';
import { PrismaGamesRepository } from './infrastructure/prisma-games.repository';
import { GamesController } from './presentation/games.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [ScoresModule],
  controllers: [GamesController],
  providers: [
    { provide: GamesRepository, useClass: PrismaGamesRepository },
    GameValidator,
    GameLock,
    ListGamesUseCase,
    GetCurrentGameUseCase,
    SyncGameUseCase,
    ExportGameUseCase,
    AbandonGameUseCase,
  ],
})
export class GamesModule {}
