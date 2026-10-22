import { campaignCard } from './campaignCard';

/** The Black Plague (Foundations 2): 6 rounds, foundations at rounds 1 and 4. */
export const theBlackPlague = campaignCard(175, 'The Black Plague', [
  { count: 6, green: true },
  { count: 5 },
  { count: 3 },
  { count: 3, green: true },
  { count: 2 },
  { count: 0 },
]);
