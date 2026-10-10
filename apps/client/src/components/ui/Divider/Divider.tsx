import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

type DividerProps = {
  readonly orientation?: 'vertical' | 'horizontal';
  readonly color?: 'ink' | 'base-ink' | 'border' | 'gradient';
  readonly className?: string;
};

const BACKGROUND = { ink: 'bg-ink', 'base-ink': 'bg-base-ink', border: 'bg-border' } as const;

// Must stay in sync with `primary` in tailwind.config.js.
const GRADIENT_COLOR = '#c79233';

export function Divider({
  orientation = 'horizontal',
  color = 'ink',
  className = '',
}: DividerProps) {
  const orientationClass =
    orientation === 'vertical' ? 'w-px self-stretch mx-2' : 'h-px w-full my-2';

  if (color === 'gradient') {
    return (
      <LinearGradient
        colors={['transparent', GRADIENT_COLOR, 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        className={`${orientationClass} ${className}`}
        accessibilityRole="none"
      />
    );
  }

  return (
    <View
      className={`${BACKGROUND[color]} ${orientationClass} ${className}`}
      accessibilityRole="none"
    />
  );
}
