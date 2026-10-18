import type { ExpansionConfig } from '@deck-legacy/engine/domain/types';

/** Name of the expansion that brings the card instance into the game, if any (base deck otherwise). */
export function expansionOfInstance(
  instanceId: number,
  expansions: Record<string, ExpansionConfig>,
): string | undefined {
  return Object.entries(expansions).find(([, config]) =>
    [...config.campaign, ...(config.discoverable ?? [])].some(entry => entry.id === instanceId),
  )?.[0];
}
