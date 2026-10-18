/**
 * What the game rules need from the outside world (EDR-058): the time of new events, ids of
 * new events and triggers, and randomness for games without a seed. `GameSession` provides the
 * system implementation; tests may provide a fixed one.
 */
export interface EngineEnvironment {
  /** Milliseconds since the epoch, for event timestamps. */
  now(): number;
  /**
   * A unique id for a new event or trigger. Must be a UUID: `GameSession.verify` ignores
   * UUID-shaped ids and trigger keys when it compares a log with the replayed one.
   */
  newId(): string;
  /** A number in [0, 1), only for the shuffles of games started without a seed. */
  random(): number;
}
