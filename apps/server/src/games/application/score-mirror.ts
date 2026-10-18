import type { Transaction } from '../../prisma/transaction';

/** Copies the campaign scores of a synced game to the leaderboard, in the game's transaction. */
export abstract class ScoreMirror {
  /** One score per finished segment; segments that disappeared (after a rewind) are removed. */
  abstract mirror(
    tx: Transaction,
    userId: string,
    gameId: string,
    campaignScores: Record<string, number>,
  ): Promise<void>;
}
