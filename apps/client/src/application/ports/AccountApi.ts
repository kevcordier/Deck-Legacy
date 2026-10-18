import type { KingdomRanking, UserProfile } from './apiTypes';

/** Account and leaderboard endpoints of the API; failures throw `ApiError`. */
export interface AccountApi {
  getMe(): Promise<UserProfile>;
  updateMe(displayName: string): Promise<UserProfile>;
  /** Deletes the account and all its data (kingdoms, scores). */
  deleteMe(): Promise<undefined>;
  kingdomLeaderboard(): Promise<KingdomRanking[]>;
}
