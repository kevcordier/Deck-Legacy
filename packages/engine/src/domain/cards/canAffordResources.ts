import type { Resources } from '../types';

/** Vérifie si les ressources disponibles suffisent pour payer un coût. */
export function canAffordResources(available: Resources, resources: Resources[]): boolean {
  return (
    resources.length === 0 ||
    resources.some(r =>
      Object.entries(r).every(([k, v]) => (available[k as keyof Resources] ?? 0) >= v),
    )
  );
}
