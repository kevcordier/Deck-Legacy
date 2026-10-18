import type { KingdomSummary } from './KingdomSummary';

/** A kingdom (one save of the player, EDR-038) in the index of this device. */
export type KingdomMeta = {
  id: string;
  name: string;
  createdAt: number;
  summary: KingdomSummary;
};
