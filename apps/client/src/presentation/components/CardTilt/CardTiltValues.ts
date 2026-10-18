import type { SharedValue } from 'react-native-reanimated';

/** Normalized card tilt: `x` (left → right) and `y` (top → bottom), both in [-1, 1]. */
export type CardTiltValues = {
  readonly x: SharedValue<number>;
  readonly y: SharedValue<number>;
};
