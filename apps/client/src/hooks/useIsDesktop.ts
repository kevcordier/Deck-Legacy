import { useWindowDimensions } from 'react-native';

/** Tailwind `lg` breakpoint (1024px), used to switch between desktop and mobile layouts. */
export const DESKTOP_MIN_WIDTH = 1024;

export function useIsDesktop(): boolean {
  const { width } = useWindowDimensions();
  return width >= DESKTOP_MIN_WIDTH;
}
