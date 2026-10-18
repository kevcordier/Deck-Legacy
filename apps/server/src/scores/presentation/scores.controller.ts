import type { AuthUser } from '../../auth/auth-user';
import { CurrentUser } from '../../auth/current-user.decorator';
import { Public } from '../../auth/public.decorator';
import { ApiErrorDto } from '../../shared/http/api-error.dto';
import { type KingdomRanking, KingdomRankingDto } from '../application/dto/kingdom-ranking.dto';
import { type Leaderboard, LeaderboardDto } from '../application/dto/leaderboard.dto';
import { type ScoreEntry, ScoreEntryDto } from '../application/dto/score-entry.dto';
import { ScoresService } from '../application/scores.service';
import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiDefaultResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

const MAX_LEADERBOARD_SIZE = 100;

@ApiTags('scores')
@ApiDefaultResponse({ type: ApiErrorDto })
@Controller('scores')
export class ScoresController {
  constructor(private readonly scores: ScoresService) {}

  @Public()
  @Get('leaderboard')
  @ApiOkResponse({ type: LeaderboardDto })
  @ApiQuery({ name: 'segment', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  leaderboard(
    @Query('segment', new DefaultValuePipe('base')) segment: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<Leaderboard> {
    return this.scores.leaderboard(segment, Math.min(Math.max(limit, 1), MAX_LEADERBOARD_SIZE));
  }

  @Public()
  @Get('kingdoms')
  @ApiOkResponse({ type: [KingdomRankingDto] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  kingdoms(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ): Promise<KingdomRanking[]> {
    return this.scores.kingdomLeaderboard(Math.min(Math.max(limit, 1), MAX_LEADERBOARD_SIZE));
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ScoreEntryDto] })
  mine(@CurrentUser() user: AuthUser): Promise<ScoreEntry[]> {
    return this.scores.forUser(user.id);
  }
}
