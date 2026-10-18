import type { KingdomRanking } from './models/kingdom-ranking';
import type { Leaderboard } from './models/leaderboard';
import type { ScoreEntry } from './models/score-entry';

/** Reads of the leaderboards; the Nest injection token is the class itself. */
export abstract class ScoresRepository {
  /** Best scores of registered (non-anonymous) players for a campaign segment, verified games only. */
  abstract leaderboard(segment: string, limit: number): Promise<Leaderboard>;

  /** Verified kingdoms (non-abandoned games) of registered players with the best total score. */
  abstract kingdomLeaderboard(limit: number): Promise<KingdomRanking[]>;

  /** A player's own scores, most recent first. */
  abstract forUser(userId: string): Promise<ScoreEntry[]>;
}
