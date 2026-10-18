import { APP_CONFIG } from '../../config/app-config.token';
import { type AppConfig } from '../../config/env';
import { usesCheats } from '../domain/uses-cheats';
import type { SyncGameRequest } from './dto/sync-game-request.dto';
import type { ValidatedGame } from './validated-game';
import { GameSession, checkpointSeq } from '@deck-legacy/engine/application/session/GameSession';
import { Phase } from '@deck-legacy/engine/domain/enums';
import { CorruptedGameError } from '@deck-legacy/engine/domain/errors/CorruptedGameError';
import { UnverifiedGameError } from '@deck-legacy/engine/domain/errors/UnverifiedGameError';
import type { GameCatalog, GameCheckpoint, GameEvent } from '@deck-legacy/engine/domain/types';
import { loadGameCatalog } from '@deck-legacy/game-data';
import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';

/**
 * Checks a synced event log with the engine. The server runs the recorded player commands again
 * from the game seed and refuses a log they do not produce (EDR-051); older games without a seed
 * are only replayed. The state at the start of the last round is kept as a checkpoint: while the
 * incoming log keeps the events it covers, only the events after it are checked (EDR-052).
 */
@Injectable()
export class GameValidator {
  private readonly catalog: GameCatalog = loadGameCatalog();
  private readonly allowCheats: boolean;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.allowCheats = config.allowCheats;
  }

  /** Replays the events with the engine; rejects logs that cannot be replayed. */
  validate(body: SyncGameRequest, checkpoint?: GameCheckpoint): ValidatedGame {
    if (body.events.length === 0) {
      throw new UnprocessableEntityException('Empty event log');
    }
    if (!this.allowCheats && usesCheats(body.events)) {
      throw new UnprocessableEntityException('Games using development cheats are not accepted');
    }
    const { session, verified } = this.replay(body.events, checkpoint);
    const state = session.getState();
    return {
      events: body.events,
      name: body.name,
      cardNames: body.cardNames,
      score: session.getScore(),
      segments: session.getCampaignSegments(),
      finished: state.phase === Phase.GAME_OVER,
      verified,
      campaignScores: state.campaignScores,
      checkpoint: this.nextCheckpoint(body.events, checkpoint),
    };
  }

  /**
   * The checkpoint to keep after a checked log: the state at the start of its last round, rebuilt
   * from the previous checkpoint (so a corrected checkpoint carries over), or the previous one.
   */
  private nextCheckpoint(events: GameEvent[], previous?: GameCheckpoint): GameCheckpoint | null {
    const seq = checkpointSeq(events);
    if (seq <= (previous?.seq ?? 0)) return previous ?? null;
    const options = { allowCheats: false, unrestrictedRewind: false };
    const session = GameSession.restore(
      'sync',
      events.slice(0, seq),
      this.catalog,
      options,
      {},
      previous,
    );
    return { seq, state: session.getState() };
  }

  /**
   * Runs the player's recorded commands again (EDR-051): the score then comes from the server's
   * own run. Games started before EDR-051 can only be replayed (`verified` undefined): a new one is
   * stored unverified, a stored one keeps its flag (the games trusted by the migration).
   */
  private replay(
    events: GameEvent[],
    checkpoint?: GameCheckpoint,
  ): { session: GameSession; verified?: boolean } {
    try {
      // Development games with cheats (accepted when `allowCheats`) can only be replayed.
      const verified = usesCheats(events)
        ? null
        : GameSession.verify('sync', events, this.catalog, checkpoint);
      if (verified) return { session: verified, verified: true };
      const options = { allowCheats: false, unrestrictedRewind: false };
      const session = GameSession.restore('sync', events, this.catalog, options, {}, checkpoint);
      return { session };
    } catch (error) {
      if (error instanceof UnverifiedGameError) {
        throw new UnprocessableEntityException('Event log does not match the player commands');
      }
      if (error instanceof CorruptedGameError) {
        throw new UnprocessableEntityException('Event log cannot be replayed');
      }
      throw error;
    }
  }
}
