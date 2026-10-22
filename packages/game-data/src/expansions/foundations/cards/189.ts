import { campaignCard } from './campaignCard';

/** Invasion (Foundations 16): 5 rounds, foundations at rounds 1 and 4. */
export const invasion = campaignCard(189, 'Invasion', [
  { count: 5, green: true },
  { count: 4 },
  { count: 3 },
  { count: 0, green: true },
  { count: 5 },
]);
