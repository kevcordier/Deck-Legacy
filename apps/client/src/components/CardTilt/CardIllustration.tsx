import { useIllustrationParallaxStyle } from './CardTiltContext';
import { type ImageSourcePropType, StyleSheet } from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';

type CardIllustrationProps = {
  readonly source: ImageSourcePropType;
};

/** Card background image, slightly zoomed and shifted by the parallax of the enclosing `CardTilt`. */
export function CardIllustration({ source }: CardIllustrationProps) {
  const size = useSharedValue({ width: 0, height: 0 });
  const parallaxStyle = useIllustrationParallaxStyle(size);
  // Explicit styles (not className): without a size, the image would render at its intrinsic size.
  return (
    <Animated.Image
      source={source}
      resizeMode="cover"
      onLayout={event => {
        const { width, height } = event.nativeEvent.layout;
        size.set({ width, height });
      }}
      style={[styles.fill, parallaxStyle]}
    />
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
});
