/** Static images are bundled by Metro and resolved to an asset reference usable as `source`. */
declare module '*.png' {
  import type { ImageSourcePropType } from 'react-native';

  const source: ImageSourcePropType;
  export default source;
}
