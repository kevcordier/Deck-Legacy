import { GameUIContext } from '@contexts/GameUIContext';
import { use } from 'react';
import { useReducedMotion as useSystemReducedMotion } from 'react-native-reanimated';

/** True when the system asks for reduced motion or the player turned animations off. */
export function useReducedMotion(): boolean {
  const systemReduced = useSystemReducedMotion();
  return systemReduced || !use(GameUIContext).animationsEnabled;
}
