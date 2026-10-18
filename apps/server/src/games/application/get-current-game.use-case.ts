import { GamesRepository } from './games.repository';
import type { GameSummary } from './models/game-summary';
import { Injectable, NotFoundException } from '@nestjs/common';

/**
 * Latest non-abandoned game of the player. Kept for clients older than the kingdoms (EDR-038),
 * which had a single save.
 */
@Injectable()
export class GetCurrentGameUseCase {
  constructor(private readonly repository: GamesRepository) {}

  async execute(userId: string): Promise<GameSummary> {
    const game = await this.repository.findCurrent(userId);
    if (!game) throw new NotFoundException('No current game');
    return game;
  }
}
