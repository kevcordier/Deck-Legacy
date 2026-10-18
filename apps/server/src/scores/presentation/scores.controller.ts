import type { AuthUser } from '../../auth/domain/auth-user';
import { CurrentUser } from '../../auth/presentation/current-user.decorator';
import { Public } from '../../auth/presentation/public.decorator';
import { ApiErrorDto } from '../../shared/presentation/http/api-error.dto';
import { GetKingdomLeaderboardUseCase } from '../application/get-kingdom-leaderboard.use-case';
import { GetLeaderboardUseCase } from '../application/get-leaderboard.use-case';
import { GetMyScoresUseCase } from '../application/get-my-scores.use-case';
import type { KingdomRanking } from '../application/models/kingdom-ranking';
import type { Leaderboard } from '../application/models/leaderboard';
import type { ScoreEntry } from '../application/models/score-entry';
import { KingdomRankingDto } from './dto/kingdom-ranking.dto';
import { LeaderboardDto } from './dto/leaderboard.dto';
import { ScoreEntryDto } from './dto/score-entry.dto';
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
  constructor(
    private readonly getLeaderboard: GetLeaderboardUseCase,
    private readonly getKingdomLeaderboard: GetKingdomLeaderboardUseCase,
    private readonly getMyScores: GetMyScoresUseCase,
  ) {}

  @Public()
  @Get('leaderboard')
  @ApiOkResponse({ type: LeaderboardDto })
  @ApiQuery({ name: 'segment', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  leaderboard(
    @Query('segment', new DefaultValuePipe('base')) segment: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<Leaderboard> {
    return this.getLeaderboard.execute(segment, Math.min(Math.max(limit, 1), MAX_LEADERBOARD_SIZE));
  }

  @Public()
  @Get('kingdoms')
  @ApiOkResponse({ type: [KingdomRankingDto] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  kingdoms(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ): Promise<KingdomRanking[]> {
    return this.getKingdomLeaderboard.execute(Math.min(Math.max(limit, 1), MAX_LEADERBOARD_SIZE));
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ScoreEntryDto] })
  mine(@CurrentUser() user: AuthUser): Promise<ScoreEntry[]> {
    return this.getMyScores.execute(user.id);
  }
}
