import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { Public } from '../auth/public.decorator';
import { ScoresService } from './scores.service';
import type { LeaderboardResponse, ScoreEntry } from '@deck-legacy/api-contract';
import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';

const MAX_LEADERBOARD_SIZE = 100;

@Controller('scores')
export class ScoresController {
  constructor(private readonly scores: ScoresService) {}

  @Public()
  @Get('leaderboard')
  leaderboard(
    @Query('segment', new DefaultValuePipe('base')) segment: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<LeaderboardResponse> {
    return this.scores.leaderboard(segment, Math.min(Math.max(limit, 1), MAX_LEADERBOARD_SIZE));
  }

  @Get('me')
  mine(@CurrentUser() user: AuthUser): Promise<ScoreEntry[]> {
    return this.scores.forUser(user.id);
  }
}
