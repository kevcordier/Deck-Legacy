import type { AuthUser } from '../../auth/auth-user';
import { CurrentUser } from '../../auth/current-user.decorator';
import { ApiErrorDto } from '../../shared/presentation/http/api-error.dto';
import { ZodValidationPipe } from '../../shared/presentation/http/zod-validation.pipe';
import { AbandonGameUseCase } from '../application/abandon-game.use-case';
import { ExportGameUseCase } from '../application/export-game.use-case';
import { GetCurrentGameUseCase } from '../application/get-current-game.use-case';
import { ListGamesUseCase } from '../application/list-games.use-case';
import type { GameExport } from '../application/models/game-export';
import type { GameSummary } from '../application/models/game-summary';
import { SyncGameUseCase } from '../application/sync-game.use-case';
import { GameExportDto } from './dto/game-export.dto';
import { GameSummaryDto } from './dto/game-summary.dto';
import { SyncGameRequestDto } from './dto/sync-game-request.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
  constructor(
    private readonly listGames: ListGamesUseCase,
    private readonly getCurrentGame: GetCurrentGameUseCase,
    private readonly syncGame: SyncGameUseCase,
    private readonly exportGame: ExportGameUseCase,
    private readonly abandonGame: AbandonGameUseCase,
  ) {}

  /** The player's kingdoms (non-abandoned games), most recently synced first. */
  @Get()
  @ApiOkResponse({ type: [GameSummaryDto] })
  list(@CurrentUser() user: AuthUser): Promise<GameSummary[]> {
    return this.listGames.execute(user.id);
  }

  /**
   * Latest non-abandoned game of the player. Kept for clients older than the kingdoms
   * (EDR-038), which had a single save.
   */
  @Get('current')
  @ApiOkResponse({ type: GameSummaryDto })
  current(@CurrentUser() user: AuthUser): Promise<GameSummary> {
    return this.getCurrentGame.execute(user.id);
  }

  @Delete('current')
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  async abandonCurrent(@CurrentUser() user: AuthUser): Promise<void> {
    await this.abandonGame.current(user.id);
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
    return this.syncGame.execute(user, id, body);
  }

  @Get(':id/export')
  @ApiOkResponse({ type: GameExportDto })
  export(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<GameExport> {
    return this.exportGame.execute(user.id, id);
  }

  @Delete(':id')
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  abandon(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    return this.abandonGame.execute(user.id, id);
  }
}
