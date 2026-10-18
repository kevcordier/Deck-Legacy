import type { Resources } from '../types';
import { sanitizeResources } from './sanitizeResources';

function resourceSignature(resources: Resources): string {
  return Object.entries(resources)
    .filter(([, value]) => value > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('|');
}

export function dedupeResourceOptions(options: Resources[]): Resources[] {
  const seen = new Set<string>();
  return options.reduce<Resources[]>((acc, option) => {
    const normalized = sanitizeResources(option);
    const signature = resourceSignature(normalized);
    if (!signature || seen.has(signature)) return acc;
    seen.add(signature);
    return [...acc, normalized];
  }, []);
}
