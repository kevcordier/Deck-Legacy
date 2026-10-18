import { ScoresService } from './application/scores.service';
import { ScoresController } from './presentation/scores.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [ScoresController],
  providers: [ScoresService],
  exports: [ScoresService],
})
export class ScoresModule {}
