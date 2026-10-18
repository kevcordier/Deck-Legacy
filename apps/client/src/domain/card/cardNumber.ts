import { expansionOfInstance } from './expansionOfInstance';
import type { CardInstance, ExpansionConfig } from '@deck-legacy/engine/domain/types';

/**
 * Number printed on the card, scoped to its expansion (deck entry `number`, the instance id in the
 * base game). Read from the instance when it exists, from the catalog otherwise (a card not in the
 * game yet, Storybook).
 */
export function cardNumber(
  instanceId: number,
  expansions: Record<string, ExpansionConfig>,
  instance?: CardInstance,
): { expansion?: string; number: number } {
  const expansion = instance?.expansion ?? expansionOfInstance(instanceId, expansions);
  if (instance?.expansionId !== undefined) return { expansion, number: instance.expansionId };
  const config = expansion ? expansions[expansion] : undefined;
  const entry = config
    ? [...config.campaign, ...(config.discoverable ?? [])].find(e => e.id === instanceId)
    : undefined;
  return { expansion, number: entry?.number ?? instanceId };
}
