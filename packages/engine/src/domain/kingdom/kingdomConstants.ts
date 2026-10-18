/**
 * Limits on kingdoms (one synced game, one save, of a player), shared by the client and the
 * server so both enforce the same rules (EDR-038).
 */
export const KINGDOM_NAME_MAX_LENGTH = 40;

/** Maximum number of kingdoms (non-abandoned games) per registered account. */
export const MAX_KINGDOMS_PER_ACCOUNT = 10;

/** Maximum number of kingdoms for a guest (anonymous) or offline player. */
export const MAX_KINGDOMS_PER_GUEST = 1;
