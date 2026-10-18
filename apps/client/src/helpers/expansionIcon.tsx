import {
  BorderDisputeIcon,
  type IconProps,
  ProsperityIcon,
  RiddingTheWoodsIcon,
  WaterMillIcon,
} from '@components/ui/Icon/icon';
import { IconColors } from '@components/ui/Icon/iconColors';
import type { CardInstance, ExpansionConfig } from '@deck-legacy/engine/domain/types';
import type { ComponentType } from 'react';

/**
 * Logo of each expansion, keyed by the expansion name used in `deck.json` and in campaign
 * segments (never renamed: old event logs reference it).
 */
const EXPANSION_ICONS: Record<string, ComponentType<IconProps>> = {
  Prosperity: ProsperityIcon,
  'The Water Mill': WaterMillIcon,
  'Border Dispute': BorderDisputeIcon,
  'Ridding the Woods': RiddingTheWoodsIcon,
};

/** Colors replacing a logo's own on a dark page background (logos are drawn for the card parchment). */
const ON_DARK_COLORS: Record<string, string> = { 'The Water Mill': IconColors.woodLight };

export function ExpansionIcon({
  expansion,
  onDark = false,
  ...props
}: IconProps & { readonly expansion: string; readonly onDark?: boolean }) {
  const Icon = EXPANSION_ICONS[expansion];
  const color = onDark ? ON_DARK_COLORS[expansion] : undefined;
  return Icon ? <Icon color={color} {...props} /> : null;
}

/** Name of the expansion that brings the card instance into the game, if any (base deck otherwise). */
export function expansionOfInstance(
  instanceId: number,
  expansions: Record<string, ExpansionConfig>,
): string | undefined {
  return Object.entries(expansions).find(([, config]) =>
    [...config.campaign, ...(config.discoverable ?? [])].some(entry => entry.id === instanceId),
  )?.[0];
}

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
