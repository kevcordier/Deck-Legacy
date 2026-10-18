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
    return this.lock.run(gameId, async () => {
      const meta = await this.repository.getMeta(gameId);
      if (meta && meta.userId !== userId) throw new NotFoundException('Game not found');
      if (meta && body.baseVersion !== undefined && body.baseVersion !== meta.version) {
        throw staleVersionException();
      }
      const storedIds = meta ? await this.repository.getEventIds(gameId) : [];
      if (body.fromSeq > storedIds.length) throw staleVersionException();
      const kept =
        body.fromSeq > 0 ? await this.repository.getEventPayloads(gameId, body.fromSeq) : [];
      const events = [...kept, ...body.events];
      const firstChange = firstDifference(storedIds, events);
      // A log rewritten before the checkpoint (development rewind, overwrite) is checked in full.
      const checkpoint =
        meta?.checkpoint && meta.checkpoint.seq <= firstChange ? meta.checkpoint : undefined;
      const snapshot = this.validator.validate({ ...body, events }, checkpoint);

      const mirrorScores = (tx: Transaction) =>
        this.scores.mirror(tx, userId, gameId, snapshot.campaignScores);

      if (meta) {
        await this.repository.save(gameId, userId, limit, firstChange, snapshot, mirrorScores);
      } else {
        await this.repository.create(gameId, userId, limit, snapshot, mirrorScores);
      }
      return this.repository.getSummary(gameId);
    });
  }
}
