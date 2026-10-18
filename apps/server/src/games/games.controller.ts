import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { ApiErrorDto } from '../common/api-error.dto';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { GamesService } from './games.service';
import { type GameExport, GameExportDto } from './presentation/dto/game-export.dto';
import { type GameSummary, GameSummaryDto } from './presentation/dto/game-summary.dto';
import { SyncGameRequestDto } from './presentation/dto/sync-game-request.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiDefaultResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('games')
@ApiBearerAuth()
@ApiDefaultResponse({ type: ApiErrorDto })
@Controller('games')
export class GamesController {
  constructor(private readonly games: GamesService) {}

  /** The player's kingdoms (non-abandoned games), most recently synced first. */
  @Get()
  @ApiOkResponse({ type: [GameSummaryDto] })
  list(@CurrentUser() user: AuthUser): Promise<GameSummary[]> {
    return this.games.list(user.id);
  }

  /**
   * Latest non-abandoned game of the player. Kept for clients older than the kingdoms
   * (EDR-038), which had a single save.
   */
  @Get('current')
  @ApiOkResponse({ type: GameSummaryDto })
  async current(@CurrentUser() user: AuthUser): Promise<GameSummary> {
    const game = await this.games.getCurrent(user.id);
    if (!game) throw new NotFoundException('No current game');
    return game;
  }

  @Delete('current')
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  async abandonCurrent(@CurrentUser() user: AuthUser): Promise<void> {
    await this.games.abandonCurrent(user.id);
  }

  /**
   * Stores the full event log of a game played on a device. The first sync creates the
   * kingdom, within the player's kingdom limit.
   */
  @Put(':id')
  @ApiOkResponse({ type: GameSummaryDto })
  sync(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(SyncGameRequestDto.schema)) body: SyncGameRequestDto,
  ): Promise<GameSummary> {
    return this.games.sync(user, id, body);
  }

  @Get(':id/export')
  @ApiOkResponse({ type: GameExportDto })
  export(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<GameExport> {
    return this.games.exportGame(user.id, id);
  }

  @Delete(':id')
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  abandon(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    return this.games.abandon(user.id, id);
  }
}
