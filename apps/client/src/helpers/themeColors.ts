import { GameUIContext } from '@contexts/GameUIContext';
import { use } from 'react';
import { useColorScheme } from 'react-native';

/**
 * Hex values of the themed tokens (mirrors `src/styles/global.css`), for APIs that take
 * style objects or color props instead of class names.
 */
export const THEME_COLORS = {
  light: { background: '#fff2e0', ink: '#664a26', border: '#bda887', primary: '#c79233' },
  dark: { background: '#3b342a', ink: '#fff2e0', border: '#65553c', primary: '#ffd07c' },
} as const;

export type ThemeColors = (typeof THEME_COLORS)['light' | 'dark'];

/**
 * Follows the theme chosen in the options (the OS one in `system`), like the `dark` class does.
 * NativeWind's own color scheme can disagree with that class on web, leaving light text on a
 * light background.
 */
export function useThemeColors(): ThemeColors {
  const { theme } = use(GameUIContext);
  const system = useColorScheme();
  const scheme = theme === 'light' || theme === 'dark' ? theme : system;
  return scheme === 'dark' ? THEME_COLORS.dark : THEME_COLORS.light;
}
