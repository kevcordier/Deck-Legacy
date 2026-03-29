import goldIcon from '@assets/icons/gold.svg';
import woodIcon from '@assets/icons/wood.svg';
import stoneIcon from '@assets/icons/stone.svg';
import ironIcon from '@assets/icons/iron.svg';
import swordIcon from '@assets/icons/sword.svg';
import goodsIcon from '@assets/icons/goods.svg';
import gloryIcon from '@assets/icons/glory.svg';
import crownIcon from '@assets/icons/crown.svg';
import type { Resources } from '@engine/domain/types';

const RESOURCE_META: Record<string, { iconUrl?: string; cls: string; label: string }> = {
  gold: { iconUrl: goldIcon, cls: 'res-gold', label: 'resources.gold' },
  wood: { iconUrl: woodIcon, cls: 'res-wood', label: 'resources.wood' },
  stone: { iconUrl: stoneIcon, cls: 'res-stone', label: 'resources.stone' },
  iron: { iconUrl: ironIcon, cls: 'res-iron', label: 'resources.iron' },
  sword: { iconUrl: swordIcon, cls: 'res-sword', label: 'resources.sword' },
  goods: { iconUrl: goodsIcon, cls: 'res-goods', label: 'resources.goods' },
  glory: { iconUrl: gloryIcon, cls: 'res-glory', label: 'resources.glory' },
};

export function getResMeta(key: string) {
  return RESOURCE_META[key] ?? { iconUrl: crownIcon, cls: 'res-default', label: key };
}

/** Fusionne deux dictionnaires de ressources en additionnant les valeurs. Pur, sans mutation. */
export function mergeResources(a: Resources, b: Resources): Resources {
  const result = JSON.parse(JSON.stringify(a)) as Resources;
  for (const [k, v] of Object.entries(b)) {
    result[k as keyof Resources] = (result[k as keyof Resources] ?? 0) + v;
  }
  return result;
}

export function spendResources(a: Resources, b: Resources): Resources {
  const result = JSON.parse(JSON.stringify(a)) as Resources;
  for (const [k, v] of Object.entries(b)) {
    result[k as keyof Resources] = (result[k as keyof Resources] ?? 0) - v;
    if ((result[k as keyof Resources] ?? 0) <= 0) delete result[k as keyof Resources];
  }
  return result;
}
