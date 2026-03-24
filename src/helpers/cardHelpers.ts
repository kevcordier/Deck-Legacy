import type { CardInstance, CardState, Resources } from '@engine/types';

export function getEffectiveProductions(cs: CardState, instance: CardInstance): Resources {
  const raw = cs.productions;
  const base: Resources = (raw as Resources[] | undefined)?.[0] ?? {};

  const vigBonus = instance.stickers.reduce<Resources>((acc, v) => {
    if (v.effect.type === 'resource') {
      return { ...acc, [v.effect.resource]: (acc[v.effect.resource] ?? 0) + v.effect.amount };
    }
    return acc;
  }, {});

  const result: Resources = { ...base };
  for (const [k, v] of Object.entries(vigBonus)) {
    result[k] = (result[k] ?? 0) + v;
  }
  return result;
}

export function tagClass(tag: string): string {
  const t = tag.toLowerCase();
  if (t === 'enemy' || t === 'ennemy') return 'tag tag-enemy';
  if (t === 'building') return 'tag tag-building';
  if (t === 'seafaring') return 'tag tag-seafaring';
  if (t === 'event') return 'tag tag-event';
  return 'tag';
}
