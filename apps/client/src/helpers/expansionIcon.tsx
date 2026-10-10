import {
  BorderDisputeIcon,
  type IconProps,
  ProsperityIcon,
  WaterMillIcon,
} from '@components/ui/Icon/icon';
import type { ExpansionConfig } from '@deck-legacy/engine/domain/types';
import type { ComponentType } from 'react';

/**
 * Logo of each expansion, keyed by the expansion name used in `deck.json` and in campaign
 * segments (never renamed: old event logs reference it).
 */
const EXPANSION_ICONS: Record<string, ComponentType<IconProps>> = {
  Prosperity: ProsperityIcon,
  'The Water Mill': WaterMillIcon,
  'Border Dispute': BorderDisputeIcon,
};

export function ExpansionIcon({ expansion, ...props }: IconProps & { readonly expansion: string }) {
  const Icon = EXPANSION_ICONS[expansion];
  return Icon ? <Icon {...props} /> : null;
}

/** Name of the expansion that brings the card instance into the game, if any (base deck otherwise). */
export function expansionOfInstance(
  instanceId: number,
  expansions: Record<string, ExpansionConfig>,
): string | undefined {
  return Object.entries(expansions).find(([, config]) =>
    config.deck.some(entry => entry.id === instanceId),
  )?.[0];
}
