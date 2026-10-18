import type { GameSummary } from './dto/game-summary.dto';
import { GamesRepository } from './games.repository';
import { Injectable } from '@nestjs/common';

/** The player's kingdoms (non-abandoned games), most recently synced first. */
@Injectable()
export class ListGamesUseCase {
  constructor(private readonly repository: GamesRepository) {}

  execute(userId: string): Promise<GameSummary[]> {
    return this.repository.list(userId);
  }
}
