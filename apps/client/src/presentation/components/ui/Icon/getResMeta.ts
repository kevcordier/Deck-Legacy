import type { IconProps } from './IconProps';
import { IconColors } from './iconColors';
import { ActivatedIcon } from '@components/ui/Icon/icons/ActivatedIcon';
import { CrownIcon } from '@components/ui/Icon/icons/CrownIcon';
import { DestroyIcon } from '@components/ui/Icon/icons/DestroyIcon';
import { GloryIcon } from '@components/ui/Icon/icons/GloryIcon';
import { GoldIcon } from '@components/ui/Icon/icons/GoldIcon';
import { GoodsIcon } from '@components/ui/Icon/icons/GoodsIcon';
import { HerbIcon } from '@components/ui/Icon/icons/HerbIcon';
import { IronIcon } from '@components/ui/Icon/icons/IronIcon';
import { PassifIcon } from '@components/ui/Icon/icons/PassifIcon';
import { ScienceIcon } from '@components/ui/Icon/icons/ScienceIcon';
import { StoneIcon } from '@components/ui/Icon/icons/StoneIcon';
import { TimeIcon } from '@components/ui/Icon/icons/TimeIcon';
import { TriggerIcon } from '@components/ui/Icon/icons/TriggerIcon';
import { UnlimitedIcon } from '@components/ui/Icon/icons/UnlimitedIcon';
import { UpgradeIcon } from '@components/ui/Icon/icons/UpgradeIcon';
import { WeaponIcon } from '@components/ui/Icon/icons/WeaponIcon';
import { WoodIcon } from '@components/ui/Icon/icons/WoodIcon';
import type React from 'react';

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
  science: { icon: ScienceIcon, label: 'resources.science' },
  herb: { icon: HerbIcon, label: 'resources.herb' },
  glory: { icon: GloryIcon, label: 'resources.glory' },
  action: { icon: ActivatedIcon, color: 'green', label: 'resources.action' },
  time: { icon: TimeIcon, color: IconColors.baseInk, label: 'resources.time' },
  passif: { icon: PassifIcon, color: IconColors.baseInk, label: 'resources.passif' },
  unlimited: { icon: UnlimitedIcon, color: 'green', label: 'resources.unlimited' },
  destroy: { icon: DestroyIcon, color: IconColors.tagEnemy, label: 'resources.destroy' },
  trigger: { icon: TriggerIcon, color: 'red', label: 'resources.trigger' },
  optionalTrigger: { icon: TriggerIcon, color: 'yellow', label: 'resources.trigger' },
  upgrade: { icon: UpgradeIcon, label: 'resources.upgrade' },
};

export function getResMeta(key: string) {
  return RESOURCE_META[key] ?? { icon: CrownIcon, color: 'gold', label: key };
}
