import type { ScoreEntry } from './models/score-entry';
import { ScoresRepository } from './scores.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetMyScoresUseCase {
  constructor(private readonly scores: ScoresRepository) {}

  execute(userId: string): Promise<ScoreEntry[]> {
    return this.scores.forUser(userId);
  }
}
