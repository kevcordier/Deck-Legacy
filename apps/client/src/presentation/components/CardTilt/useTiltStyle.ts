import type { CardTiltValues } from './CardTiltValues';
import { TILT_MAX_DEG, TILT_PERSPECTIVE } from './cardTiltConstants';
import { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

/** 3D rotation of the card for the given tilt values. */
export function useTiltStyle(tilt: CardTiltValues, scale?: SharedValue<number>) {
  return useAnimatedStyle(() => ({
    transform: [
      { perspective: TILT_PERSPECTIVE },
      { rotateX: `${-tilt.y.value * TILT_MAX_DEG}deg` },
      { rotateY: `${tilt.x.value * TILT_MAX_DEG}deg` },
      { scale: scale?.value ?? 1 },
    ],
  }));
}
