import baseGameEnded from './base-game-ended.json';
import round3 from './round-3.json';
import type { GameCheckpoint, GameEvent } from '@deck-legacy/engine/domain/types';

/**
 * Saved games offered by `NewKingdomModal` (`__DEV__`) for manual tests. Export a game from the
 * browser console with `copy(JSON.stringify(__cheat.getEvents(), null, 2))`. With a `checkpoint`
 * (seq 0), the game starts from its state and `events` only hold what follows: the server cannot
 * verify such a game, keep it on the device.
 */
export type Scenario = { name: string; events: GameEvent[]; checkpoint?: GameCheckpoint };

export const SCENARIOS: Scenario[] = [
  { name: 'round-3', events: round3 as unknown as GameEvent[] },
  // State at the start of the base game's last round, then that round: opens on the expansion choice.
  { name: 'base-game-ended', ...(baseGameEnded as unknown as Omit<Scenario, 'name'>) },
];
