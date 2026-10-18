import type { GameSnapshot } from '../domain/game-snapshot';

/** A game checked by `GameValidator`, with the campaign scores to mirror into `Score`. */
export type ValidatedGame = GameSnapshot & { campaignScores: Record<string, number> };
