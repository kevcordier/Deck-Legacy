import type { Leaderboard } from './models/leaderboard';
import { ScoresRepository } from './scores.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetLeaderboardUseCase {
  constructor(private readonly scores: ScoresRepository) {}

  execute(segment: string, limit: number): Promise<Leaderboard> {
    return this.scores.leaderboard(segment, limit);
  }
}
