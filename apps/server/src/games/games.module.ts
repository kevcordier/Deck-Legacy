import { ScoresModule } from '../scores/scores.module';
import { GamesController } from './games.controller';
import { GamesRepository } from './games.repository';
import { GamesService } from './games.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [ScoresModule],
  controllers: [GamesController],
  providers: [GamesService, GamesRepository],
})
export class GamesModule {}
