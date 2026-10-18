import { CardTiltContext } from './CardTiltContext';
import { ILLUSTRATION_SCALE } from './cardTiltConstants';
import { use } from 'react';
import { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

/** Maximum illustration offset at full tilt, as a share of the illustration size. */
const ILLUSTRATION_PARALLAX_RATIO = 0.04;

/**
 * Parallax offset of a card illustration inside a `CardTilt` (the image moves against the tilt
 * to give depth). Outside a `CardTilt`, the image is displayed as is.
 */
export function useIllustrationParallaxStyle(size: SharedValue<{ width: number; height: number }>) {
  const tilt = use(CardTiltContext);
  return useAnimatedStyle(() => ({
    transform: [
      // The zoom only exists to hide the image edges while the parallax moves it.
      { scale: tilt ? ILLUSTRATION_SCALE : 1 },
      { translateX: -(tilt?.x.value ?? 0) * size.value.width * ILLUSTRATION_PARALLAX_RATIO },
      { translateY: -(tilt?.y.value ?? 0) * size.value.height * ILLUSTRATION_PARALLAX_RATIO },
    ],
  }));
}
