import { CardTiltContext } from './CardTiltContext';
import type { CardTiltValues } from './CardTiltValues';
import { useTiltStyle } from './useTiltStyle';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type PointerEvent, View } from 'react-native';
import Animated, { useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

type CardTiltProps = {
  readonly children: ReactNode;
  readonly enabled?: boolean;
  readonly className?: string;
  /** Web: called when the mouse starts or stops hovering the card. */
  readonly onHoverChange?: (hovered: boolean) => void;
};

const HOVER_SCALE = 1.04;
const ENTER_DURATION_MS = 150;
const LEAVE_DURATION_MS = 400;
/** Keeps the hovered (scaled) card above its neighbours. */
const HOVERED_Z_INDEX = 20;

/** Web: tilts the card towards the mouse pointer while it is hovered (mouse only). */
export function CardTilt({ children, enabled = true, className, onHoverChange }: CardTiltProps) {
  const reducedMotion = useReducedMotion();
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const scale = useSharedValue(1);
  const tilt = useMemo<CardTiltValues>(() => ({ x, y }), [x, y]);
  const tiltStyle = useTiltStyle(tilt, scale);
  const [hovered, setHovered] = useState(false);
  const active = enabled && !reducedMotion;

  // Whether the card is currently lifted (scaled) by the hover.
  const liftedRef = useRef(false);

  const flatten = useCallback(() => {
    liftedRef.current = false;
    x.set(withTiming(0, { duration: LEAVE_DURATION_MS }));
    y.set(withTiming(0, { duration: LEAVE_DURATION_MS }));
    scale.set(withTiming(1, { duration: LEAVE_DURATION_MS }));
  }, [x, y, scale]);

  // Disabling (e.g. while the card is dragged) flattens the card without changing the tree, so
  // the card content is not remounted. The next pointer move lifts it again.
  useEffect(() => {
    if (!active) flatten();
  }, [active, flatten]);

  const handlePointerMove = (event: PointerEvent) => {
    if (!active) return;
    const nativeEvent = event.nativeEvent as unknown as globalThis.PointerEvent;
    if (nativeEvent.pointerType !== 'mouse') return;
    // Measured on the static wrapper: the tilted card's own box changes with the tilt and the
    // scale, which would feed back into the pointer position and make the card jitter.
    const element = event.currentTarget as unknown as HTMLElement;
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const nextX = ((nativeEvent.clientX - rect.left) / rect.width) * 2 - 1;
    const nextY = ((nativeEvent.clientY - rect.top) / rect.height) * 2 - 1;
    // Set directly: restarting an eased animation on every move (several per frame) kept it
    // stuck at its slow start, so the card only caught up once the pointer stopped.
    x.set(Math.max(-1, Math.min(1, nextX)));
    y.set(Math.max(-1, Math.min(1, nextY)));
    if (!liftedRef.current) {
      liftedRef.current = true;
      scale.set(withTiming(HOVER_SCALE, { duration: ENTER_DURATION_MS }));
      setHovered(true);
      onHoverChange?.(true);
    }
  };

  const handlePointerLeave = () => {
    flatten();
    setHovered(false);
    onHoverChange?.(false);
  };

  return (
    <CardTiltContext value={reducedMotion ? null : tilt}>
      <View
        className={className}
        style={hovered && active ? { zIndex: HOVERED_Z_INDEX } : undefined}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <Animated.View style={tiltStyle}>{children}</Animated.View>
      </View>
    </CardTiltContext>
  );
}
