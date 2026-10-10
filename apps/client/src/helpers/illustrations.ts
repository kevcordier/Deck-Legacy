import { illustrations } from '@data/illustrations';
import type { ImageSourcePropType } from 'react-native';

/** Resolves a card `illustration` path (e.g. `cards/1_1.jpg`) to a bundled image (works offline). */
export function getIllustrationSource(path?: string): ImageSourcePropType | undefined {
  if (!path) return undefined;
  return illustrations[path] ?? { uri: path };
}
