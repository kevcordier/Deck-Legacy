import type { AuthUser } from '../../auth/domain/auth-user';
import type { Transaction } from '../../prisma/transaction';
import { firstDifference } from '../domain/first-difference';
import { GameLock } from './game-lock';
import { GameValidator } from './game-validator';
import { GamesRepository } from './games.repository';
import type { GameSummary } from './models/game-summary';
import type { SyncGameCommand } from './models/sync-game-command';
import { ScoreMirror } from './score-mirror';
import { staleVersionException } from './stale-version.exception';
import { kingdomLimit } from '@deck-legacy/engine/domain/kingdom/kingdomLimit';
import { Injectable, NotFoundException } from '@nestjs/common';

/**
 * Stores a game played on a device.
 *
 * Each sync sends the events from `fromSeq` on; the server rebuilds the full log with the stored
 * events before `fromSeq`, checks it (`GameValidator`), computes the score and mirrors campaign
 * scores for the leaderboard. A sync with a `baseVersion` other than the stored version is
 * refused (another device synced first); without one, the last sync wins. The first sync creates
 * the kingdom, within the player's kingdom limit.
 */
@Injectable()
export class SyncGameUseCase {
  constructor(
    private readonly repository: GamesRepository,
    private readonly validator: GameValidator,
    private readonly lock: GameLock,
    private readonly scores: ScoreMirror,
  ) {}

  execute(user: AuthUser, gameId: string, body: SyncGameCommand): Promise<GameSummary> {
    const userId = user.id;
    const limit = kingdomLimit(user.isAnonymous);
    // Per player as well: the kingdom limit counts every game of the player.
    return this.lock.run(gameId, () =>
      this.lock.run(`user:${userId}`, async () => {
        const meta = await this.repository.getMeta(gameId);
        if (meta && meta.userId !== userId) throw new NotFoundException('Game not found');
        if (meta && body.baseVersion !== undefined && body.baseVersion !== meta.version) {
          throw staleVersionException();
        }
        const storedIds = meta ? await this.repository.getEventIds(gameId) : [];
        if (body.fromSeq > storedIds.length) throw staleVersionException();
        const firstChange =
          body.fromSeq + firstDifference(storedIds.slice(body.fromSeq), body.events);
        // Events the server already has come from its own log: a client cannot alter them (or drop
        // the seed) under the same ids.
        const kept =
          firstChange > 0 ? await this.repository.getEventPayloads(gameId, firstChange) : [];
        const events = [...kept, ...body.events.slice(firstChange - body.fromSeq)];
        // A log rewritten before the checkpoint (development rewind, overwrite) is checked in full.
        const checkpoint =
          meta?.checkpoint && meta.checkpoint.seq <= firstChange ? meta.checkpoint : undefined;
        const validated = this.validator.validate({ ...body, events }, checkpoint);
        // Only a game that keeps its stored start keeps its flag when it cannot be verified.
        const snapshot =
          firstChange === 0 ? { ...validated, verified: validated.verified ?? false } : validated;

        const mirrorScores = (tx: Transaction) =>
          this.scores.mirror(tx, userId, gameId, snapshot.campaignScores);

        if (meta) {
          await this.repository.save(gameId, userId, limit, firstChange, snapshot, mirrorScores);
        } else {
          await this.repository.create(gameId, userId, limit, snapshot, mirrorScores);
        }
        return this.repository.getSummary(gameId);
      }),
    );
  }
}
