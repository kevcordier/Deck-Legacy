import { DragHandleContext } from './DragHandleContext';
import { type ReactNode, use, useEffect } from 'react';
import { Platform, View, type ViewStyle } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

// `cursor: grab` is web only and missing from the React Native style types.
const webCursor = (cursor: string) =>
  Platform.OS === 'web' ? ({ cursor } as unknown as ViewStyle) : undefined;

const GRAB_CURSOR_STYLE = webCursor('grab');

const GRABBING_CURSOR_STYLE = webCursor('grabbing');

/**
 * The only zone that drags its card when the grid is sorted by handle. Outside such a grid, it
 * renders its children as they are.
 */
export function CardDragHandle({
  className,
  children,
}: {
  readonly className?: string;
  readonly children: ReactNode;
}) {
  const context = use(DragHandleContext);
  const registerHandle = context?.registerHandle;
  useEffect(() => {
    registerHandle?.(true);
    return () => registerHandle?.(false);
  }, [registerHandle]);
  if (!context) return <View className={className}>{children}</View>;
  return (
    <GestureDetector gesture={context.gesture}>
      <Animated.View
        className={className}
        style={context.isMoving ? GRABBING_CURSOR_STYLE : GRAB_CURSOR_STYLE}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
