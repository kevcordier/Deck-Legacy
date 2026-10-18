import { DESKTOP_MIN_WIDTH } from '@styles/breakpointConstants';
import { useWindowDimensions } from 'react-native';

export function useIsDesktop(): boolean {
  const { width } = useWindowDimensions();
  return width >= DESKTOP_MIN_WIDTH;
}
