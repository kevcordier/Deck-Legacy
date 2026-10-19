import type { IconProps } from '@components/ui/Icon/IconProps';
import { IconColors } from '@components/ui/Icon/iconColors';
import { BorderDisputeIcon } from '@components/ui/Icon/icons/BorderDisputeIcon';
import { MerchantsIcon } from '@components/ui/Icon/icons/MerchantsIcon';
import { ProsperityIcon } from '@components/ui/Icon/icons/ProsperityIcon';
import { RiddingTheWoodsIcon } from '@components/ui/Icon/icons/RiddingTheWoodsIcon';
import { WaterMillIcon } from '@components/ui/Icon/icons/WaterMillIcon';
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
  Merchants: MerchantsIcon,
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
