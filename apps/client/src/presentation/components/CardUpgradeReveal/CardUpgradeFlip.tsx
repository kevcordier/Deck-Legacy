import { TILT_PERSPECTIVE } from '@components/CardTilt/cardTiltConstants';
import { GameCard, type GameCardSize } from '@components/GameCard/GameCard';
import { MiniGameCard } from '@components/MiniGameCard/MiniGameCard';
import type { CardInstance } from '@deck-legacy/engine/domain/types';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

/** Time the former state stays visible before the card turns. */
const HOLD_MS = 500;

const FLIP_MS = 700;

/** Extra zoom of the card halfway through the flip. */
const FLIP_LIFT = 0.08;

type CardUpgradeFlipProps = {
  readonly before: CardInstance;
  readonly after: CardInstance;
  /** Card width in px. */
  readonly width: number;
  readonly size?: GameCardSize;
  /** Mini cards (phone layouts): no texts, a tap usually opens the card in large. */
  readonly mini?: boolean;
  readonly onPress?: () => void;
};

/** An upgraded card turning over from its former state to its new one. */
export function CardUpgradeFlip({
  before,
  after,
  width,
  size = 'md',
  mini = false,
  onPress,
}: CardUpgradeFlipProps) {
  const reducedMotion = useReducedMotion();
  // 0: former state facing the player, 1: new state facing the player.
  const progress = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) return;
    progress.set(
      withDelay(HOLD_MS, withTiming(1, { duration: FLIP_MS, easing: Easing.inOut(Easing.cubic) })),
    );
  }, [progress, reducedMotion]);

  // The former state turns away during the first half, the new one turns in during the second.
  const beforeStyle = useAnimatedStyle(() => ({
    opacity: progress.value < 0.5 ? 1 : 0,
    transform: [
      { perspective: TILT_PERSPECTIVE },
      { rotateY: `${progress.value * 180}deg` },
      { scale: 1 + FLIP_LIFT * Math.sin(progress.value * Math.PI) },
    ],
  }));
  const afterStyle = useAnimatedStyle(() => ({
    opacity: progress.value < 0.5 ? 0 : 1,
    transform: [
      { perspective: TILT_PERSPECTIVE },
      { rotateY: `${(progress.value - 1) * 180}deg` },
      { scale: 1 + FLIP_LIFT * Math.sin(progress.value * Math.PI) },
    ],
  }));

  return (
    <View style={{ width }}>
      <Animated.View className="rounded-xl shadow-2xl" style={afterStyle}>
        {mini ? (
          <MiniGameCard instance={after} onPress={onPress} />
        ) : (
          <GameCard instance={after} unconstrained size={size} hideStatePreview onPress={onPress} />
        )}
      </Animated.View>
      <Animated.View className="absolute inset-0 rounded-xl shadow-2xl" style={beforeStyle}>
        {mini ? (
          <MiniGameCard instance={before} onPress={onPress} />
        ) : (
          <GameCard
            instance={before}
            unconstrained
            size={size}
            hideStatePreview
            onPress={onPress}
          />
        )}
      </Animated.View>
    </View>
  );
}
