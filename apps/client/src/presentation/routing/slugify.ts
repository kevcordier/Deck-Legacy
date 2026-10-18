/** URL-friendly version of a kingdom name ("Le Royaume d'Été" → "le-royaume-d-ete"). */
export function slugify(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join('-');
  return slug || 'kingdom';
}
