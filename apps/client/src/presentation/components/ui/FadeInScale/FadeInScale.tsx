import type { ReactNode } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

type FadeInScaleProps = {
  readonly children: ReactNode;
  readonly className?: string;
};

/** Entrance animation (replaces the `animate-fade-in-scale` CSS keyframes). */
export function FadeInScale({ children, className = '' }: FadeInScaleProps) {
  return (
    <Animated.View entering={FadeInDown.duration(500)} className={className}>
      {children}
    </Animated.View>
  );
}
