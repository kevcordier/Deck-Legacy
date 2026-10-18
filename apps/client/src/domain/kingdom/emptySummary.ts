import type { KingdomSummary } from './KingdomSummary';

/** Summary of a kingdom whose game has not started. */
export const EMPTY_SUMMARY: KingdomSummary = { score: 0, segments: [], finished: false };
