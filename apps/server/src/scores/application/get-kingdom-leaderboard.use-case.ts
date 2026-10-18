import type { KingdomRanking } from './models/kingdom-ranking';
import { ScoresRepository } from './scores.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetKingdomLeaderboardUseCase {
  constructor(private readonly scores: ScoresRepository) {}

  execute(limit: number): Promise<KingdomRanking[]> {
    return this.scores.kingdomLeaderboard(limit);
  }
}
