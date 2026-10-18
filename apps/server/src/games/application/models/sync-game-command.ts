import type { GameEvent } from '@deck-legacy/engine/domain/types';

/** The events of a game from `fromSeq` on, as a device sends them. */
export type SyncGameCommand = {
  events: GameEvent[];
  /** Index, in the full log, of the first event sent. */
  fromSeq: number;
  /** Server version the device built on; without it, the sync overwrites the stored game. */
  baseVersion?: number;
  cardNames: Record<string, string>;
  /** Kingdom name chosen by the player; metadata outside the event log. */
  name: string;
};
