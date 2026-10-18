import { createContext } from 'react';
import type { GestureType } from 'react-native-gesture-handler';

type DragHandleContextValue = {
  gesture: GestureType;
  registerHandle: (registered: boolean) => void;
  isMoving: boolean;
};

export const DragHandleContext = createContext<DragHandleContextValue | null>(null);
