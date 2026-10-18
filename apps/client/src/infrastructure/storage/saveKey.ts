/** Storage key of a kingdom's save. */
export function saveKey(id: string): string {
  return `deck_legacy_save_${id}`;
}
