import type { GameExport } from './dto/game-export.dto';
import { GamesRepository } from './games.repository';
import { Injectable, NotFoundException } from '@nestjs/common';

/** Full event log of a kingdom, to resume it on another device. */
@Injectable()
export class ExportGameUseCase {
  constructor(private readonly repository: GamesRepository) {}

  async execute(userId: string, gameId: string): Promise<GameExport> {
    const game = await this.repository.load(gameId);
    if (game?.userId !== userId) throw new NotFoundException('Game not found');
    return {
      id: game.id,
      name: game.name,
      version: game.version,
      events: game.events,
      cardNames: game.cardNames,
      savedAt: game.updatedAt.getTime(),
      checkpoint: game.checkpoint,
    };
  }
}
