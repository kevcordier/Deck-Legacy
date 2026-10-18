import { kingdomLimit } from '@deck-legacy/engine/domain/kingdomLimits';

/** Maximum number of kingdoms: one without an account, ten with a registered account. */
export function maxKingdoms(user: { readonly isAnonymous: boolean } | null): number {
  return kingdomLimit(user?.isAnonymous ?? true);
}
