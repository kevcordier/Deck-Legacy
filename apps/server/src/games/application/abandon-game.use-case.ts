import { GamesRepository } from './games.repository';
import { Injectable, NotFoundException } from '@nestjs/common';

/** Abandons a game (deletes a kingdom); its scores stay. */
@Injectable()
export class AbandonGameUseCase {
  constructor(private readonly repository: GamesRepository) {}

  async execute(userId: string, gameId: string): Promise<void> {
    if (!(await this.repository.abandon(gameId, userId))) {
      throw new NotFoundException('Game not found');
    }
  }

  /** Abandons the latest game (clients older than the kingdoms); nothing when there is none. */
  async current(userId: string): Promise<void> {
    const current = await this.repository.findCurrent(userId);
    if (current) await this.execute(userId, current.id);
  }
}
