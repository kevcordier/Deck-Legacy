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
import type { Resources } from '@engine/domain/types';
import type { ComponentType } from 'react';

const RESOURCE_META: Record<
  string,
  {
    icon?: ComponentType<IconProps>;
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

/** Merges two resource dictionaries by summing their values. Pure, no mutation. */
export function mergeResources(a: Resources, b: Resources): Resources {
  const result = JSON.parse(JSON.stringify(a)) as Resources;
  for (const [k, v] of Object.entries(b)) {
    result[k as keyof Resources] = (result[k as keyof Resources] ?? 0) + v;
  }
  return result;
}
