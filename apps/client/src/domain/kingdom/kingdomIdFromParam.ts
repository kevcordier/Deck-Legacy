const UUID_LENGTH = 36;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
