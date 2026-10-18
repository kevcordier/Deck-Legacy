/** Retourne la classe Tailwind de couleur de bordure associée à un tag (même palette que tagClass). */
export function tagBorderClass(tag: string, isEnemy: boolean): string {
  const t = tag.toLowerCase();
  if (isEnemy) return 'border-tag-enemy';
  if (t === 'building') return 'border-tag-building';
  if (t === 'person') return 'border-tag-person';
  if (t === 'seafaring') return 'border-tag-seafaring';
  if (t === 'land') return 'border-tag-land';
  if (t === 'livestock') return 'border-tag-livestock';
  return 'border-tag-tag';
}
