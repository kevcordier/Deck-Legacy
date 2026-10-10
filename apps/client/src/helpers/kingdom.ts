import { kingdomLimit } from '@deck-legacy/api-contract';
import type { GameSession } from '@deck-legacy/engine/application/session/GameSession';
import { Phase } from '@deck-legacy/engine/domain/enums';
import type { KingdomSummary } from '@services/persistence';

const UUID_LENGTH = 36;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** URL-friendly version of a kingdom name ("Le Royaume d'Été" → "le-royaume-d-ete"). */
export function slugify(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join('-');
  return slug || 'kingdom';
}

/** Path of a kingdom's game page: `/game/{slug}-{id}`. */
export function kingdomPath(kingdom: { readonly id: string; readonly name: string }): string {
  return `/game/${slugify(kingdom.name)}-${kingdom.id}`;
}

/**
 * Kingdom id of a game page parameter. Only the trailing id counts, so a link with an outdated
 * slug (renamed kingdom) still opens the right kingdom.
 */
export function kingdomIdFromParam(param: string | string[] | undefined): string | null {
  const value = Array.isArray(param) ? param[0] : param;
  if (!value || value.length < UUID_LENGTH) return null;
  const id = value.slice(-UUID_LENGTH);
  return UUID.test(id) ? id.toLowerCase() : null;
}

/** Maximum number of kingdoms: one without an account, ten with a registered account. */
export function maxKingdoms(user: { readonly isAnonymous: boolean } | null): number {
  return kingdomLimit(user?.isAnonymous ?? true);
}

/** Scores shown on the home page, computed from the game being played. */
export function summarizeSession(session: GameSession): KingdomSummary {
  return {
    score: session.getScore(),
    segments: session.getCampaignSegments(),
    finished: session.getState().phase === Phase.GAME_OVER,
  };
}
