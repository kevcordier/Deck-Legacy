import { ScoresController } from './scores.controller';
import { ScoresService } from './scores.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [ScoresController],
  providers: [ScoresService],
  exports: [ScoresService],
})
export class ScoresModule {}
