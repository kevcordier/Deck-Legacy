import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { GamesModule } from './games/games.module';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ScoresModule } from './scores/scores.module';
import { UsersModule } from './users/users.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, UsersModule, ScoresModule, GamesModule],
  controllers: [HealthController],
})
export class AppModule {}
