import {
  ActivatedIcon,
  CrownIcon,
  DestroyIcon,
  GloryIcon,
  GoldIcon,
  GoodsIcon,
  type IconProps,
  IronIcon,
  PassifIcon,
  StoneIcon,
  TimeIcon,
  TriggerIcon,
  UpgradeIcon,
  WeaponIcon,
  WoodIcon,
} from '@components/ui/Icon/icon';
import { IconColors } from '@components/ui/Icon/iconColors';
import React from 'react';

// Detects tokens like {{gold}}, {{wood}}, etc. in translated texts
const ICON_TOKEN =
  /\{\{(gold|wood|stone|iron|weapon|goods|glory|action|time|passif|destroy|trigger|optionalTrigger|upgrade)\}\}/g;

const RESOURCE_META: Record<
  string,
  {
    icon?: React.ComponentType<IconProps>;
    color?: string;
    label: string;
  }
> = {
  gold: { icon: GoldIcon, label: 'resources.gold' },
  wood: { icon: WoodIcon, label: 'resources.wood' },
  stone: { icon: StoneIcon, label: 'resources.stone' },
  iron: { icon: IronIcon, label: 'resources.iron' },
  weapon: { icon: WeaponIcon, label: 'resources.weapon' },
  goods: { icon: GoodsIcon, label: 'resources.goods' },
  glory: { icon: GloryIcon, label: 'resources.glory' },
  action: { icon: ActivatedIcon, color: 'green', label: 'resources.action' },
  time: { icon: TimeIcon, color: IconColors.baseInk, label: 'resources.time' },
  passif: { icon: PassifIcon, color: IconColors.baseInk, label: 'resources.passif' },
  destroy: { icon: DestroyIcon, color: IconColors.tagEnemy, label: 'resources.destroy' },
  trigger: { icon: TriggerIcon, color: 'red', label: 'resources.trigger' },
  optionalTrigger: { icon: TriggerIcon, color: 'yellow', label: 'resources.trigger' },
  upgrade: { icon: UpgradeIcon, label: 'resources.upgrade' },
};

export function getResMeta(key: string) {
  return RESOURCE_META[key] ?? { icon: CrownIcon, color: 'gold', label: key };
}

/**
 * Replaces {{resource}} tokens in a text with the corresponding SVG icon.
 * Example: "Gain 3 {{wood}}, then upgrade." → "Gain 3 [wood icon], then upgrade."
 * The result must be rendered inside a `Text` (icons are inline views).
 */
export function renderTextWithIcons(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  ICON_TOKEN.lastIndex = 0;

  while ((match = ICON_TOKEN.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const key = match[1];
    const meta = getResMeta(key);
    parts.push(
      meta.icon ? (
        <meta.icon key={match.index} color={meta.color} className="size-4" alt={key} />
      ) : (
        key
      ),
    );
    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}
