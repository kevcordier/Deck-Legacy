/** JPEG counterpart of `assets.d.ts` (one file per module: lint forbids duplicate imports in a file). */
declare module '*.jpg' {
  import type { ImageSourcePropType } from 'react-native';

  const source: ImageSourcePropType;
  export default source;
}
