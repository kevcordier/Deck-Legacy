import type { Resources } from '../domain/types';

export function mergeResources(a: Resources, b?: Resources): Resources {
  const result = JSON.parse(JSON.stringify(a)) as Resources;
  for (const [k, v] of Object.entries(b ?? {})) {
    result[k as keyof Resources] = (result[k as keyof Resources] ?? 0) + v;
  }
  return result;
}
