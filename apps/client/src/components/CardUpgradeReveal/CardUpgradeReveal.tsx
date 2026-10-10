import { TILT_PERSPECTIVE } from '@components/CardTilt/CardTiltContext';
import { useViewerCardWidth } from '@components/CardViewerModal/CardViewerModal';
import { GameCard } from '@components/GameCard/GameCard';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import type { CardInstance } from '@deck-legacy/engine/domain/types';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

type CardUpgradeRevealProps = {
  readonly before: CardInstance;
  readonly after: CardInstance;
  readonly onClose: () => void;
};

/**
 * Shows an upgraded card in large: it turns over from its former state to its new one.
 * A tap anywhere closes it (also during the animation).
 */
export function CardUpgradeReveal({ before, after, onClose }: CardUpgradeRevealProps) {
  const { t } = useTranslation();
  const cardWidth = useViewerCardWidth();
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
    <Modal onClose={onClose} label="card-upgraded" bare>
      <Text className="font-body-bold uppercase text-white">{t('cardUpgraded.title')}</Text>
      <View className="items-center">
        <View style={{ width: cardWidth }}>
          <Animated.View className="rounded-xl shadow-2xl" style={afterStyle}>
            <GameCard instance={after} unconstrained size="lg" hideStatePreview onPress={onClose} />
          </Animated.View>
          <Animated.View className="absolute inset-0 rounded-xl shadow-2xl" style={beforeStyle}>
            <GameCard
              instance={before}
              unconstrained
              size="lg"
              hideStatePreview
              onPress={onClose}
            />
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}
