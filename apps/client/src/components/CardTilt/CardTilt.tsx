import { CardTiltContext, type CardTiltValues, useTiltStyle } from './CardTiltContext';
import { useDeviceTilt } from './deviceTilt';
import type { ReactNode } from 'react';
import Animated, { makeMutable, useReducedMotion } from 'react-native-reanimated';

const FLAT_TILT: CardTiltValues = { x: makeMutable(0), y: makeMutable(0) };

type CardTiltProps = {
  readonly children: ReactNode;
  readonly enabled?: boolean;
  readonly className?: string;
  /** Web: called when the mouse starts or stops hovering the card. */
  readonly onHoverChange?: (hovered: boolean) => void;
};

/** iOS / Android: tilts the card and moves its illustration with the device orientation. */
// onHoverChange is web-only (CardTilt.web.tsx).
export function CardTilt({
  children,
  enabled = true,
  className,
  onHoverChange: _onHoverChange,
}: CardTiltProps) {
  const reducedMotion = useReducedMotion();
  const active = enabled && !reducedMotion;
  const deviceTilt = useDeviceTilt(active);
  // Disabling (e.g. while the card is dragged) flattens the card without changing the tree, so
  // the card content is not remounted.
  const tilt = active ? deviceTilt : FLAT_TILT;
  const tiltStyle = useTiltStyle(tilt);

  return (
    <CardTiltContext value={reducedMotion ? null : tilt}>
      <Animated.View className={className} style={tiltStyle}>
        {children}
      </Animated.View>
    </CardTiltContext>
  );
}
