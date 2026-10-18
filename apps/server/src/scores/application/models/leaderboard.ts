import type { ScoreEntry } from './score-entry';

export type Leaderboard = {
  segment: string;
  entries: ScoreEntry[];
};
