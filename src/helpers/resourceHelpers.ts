import goldIcon from '@assets/icons/gold.svg';
import woodIcon from '@assets/icons/wood.svg';
import stoneIcon from '@assets/icons/stone.svg';
import ironIcon from '@assets/icons/iron.svg';
import swordIcon from '@assets/icons/sword.svg';
import goodsIcon from '@assets/icons/goods.svg';
import gloryIcon from '@assets/icons/glory.svg';
import crownIcon from '@assets/icons/crown.svg';

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
