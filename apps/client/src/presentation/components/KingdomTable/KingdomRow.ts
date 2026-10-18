import type { KingdomSummary } from '@domain/kingdom/KingdomSummary';

/** A kingdom of this device, or of any registered player on the scoreboard. */
export type KingdomRow = {
  readonly id: string;
  readonly name: string;
  readonly summary: Pick<KingdomSummary, 'score' | 'segments' | 'round' | 'turn'>;
  /** Owner's display name, shown on the scoreboard. */
  readonly player?: string;
};
