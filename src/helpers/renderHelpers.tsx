import React from 'react';
import {
  CrownIcon,
  GloryIcon,
  GoldIcon,
  GoodsIcon,
  IronIcon,
  StoneIcon,
  WeaponIcon,
  WoodIcon,
  type IconProps,
} from '@components/ui/Icon/icon';

// Detects tokens like {{gold}}, {{wood}}, etc. in translated texts
const ICON_TOKEN = /\{\{(gold|wood|stone|iron|weapon|goods|glory)\}\}/g;

const RESOURCE_META: Record<
  string,
  {
    icon?: React.ComponentType<IconProps>;
    cls: string;
    label: string;
  }
> = {
  gold: { icon: GoldIcon, cls: 'color:gold', label: 'resources.gold' },
  wood: { icon: WoodIcon, cls: 'color:brown', label: 'resources.wood' },
  stone: { icon: StoneIcon, cls: 'color:gray', label: 'resources.stone' },
  iron: { icon: IronIcon, cls: 'color:lightsteelblue', label: 'resources.iron' },
  weapon: { icon: WeaponIcon, cls: 'color:orangered', label: 'resources.weapon' },
  goods: { icon: GoodsIcon, cls: 'color:limegreen', label: 'resources.goods' },
  glory: { icon: GloryIcon, cls: 'color:gold', label: 'resources.glory' },
};

export function getResMeta(key: string) {
  return RESOURCE_META[key] ?? { icon: CrownIcon, cls: 'color:gold', label: key };
}

/**
 * Replaces {{resource}} tokens in a text with the corresponding SVG icon.
 * Example: "Gain 3 {{wood}}, then upgrade." → "Gain 3 [wood icon], then upgrade."
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
        <meta.icon key={match.index} className={`${meta.cls} size-4 align-middle`} alt={key} />
      ) : (
        key
      ),
    );
    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}
