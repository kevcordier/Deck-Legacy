import { useState } from 'react';
import { Platform, Pressable, type PressableProps, type ViewStyle } from 'react-native';

type HoverPressableProps = Omit<PressableProps, 'style'> & {
  readonly className?: string;
};

/** Slight lift of an enabled control under the mouse (style, not `hover:` classes: see FRICTIONS). */
const HOVERED_STYLE: ViewStyle = {
  transform: [{ scale: 1.04 }],
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
};

// Web only: smooths the lift in and out.
const WEB_TRANSITION_STYLE = {
  transitionProperty: 'transform, box-shadow',
  transitionDuration: '150ms',
} as unknown as ViewStyle;

/**
 * `Pressable` with a light hover effect (mouse on web, pointer on iPad) while it is enabled.
 * Used for the controls on a card (actions, upgrades, productions).
 */
export function HoverPressable({ disabled, onHoverIn, onHoverOut, ...props }: HoverPressableProps) {
  const [hovered, setHovered] = useState(false);
  const lifted = hovered && !disabled;

  return (
    <Pressable
      {...props}
      disabled={disabled}
      onHoverIn={event => {
        setHovered(true);
        onHoverIn?.(event);
      }}
      onHoverOut={event => {
        setHovered(false);
        onHoverOut?.(event);
      }}
      style={[Platform.OS === 'web' && WEB_TRANSITION_STYLE, lifted && HOVERED_STYLE]}
    />
  );
}
