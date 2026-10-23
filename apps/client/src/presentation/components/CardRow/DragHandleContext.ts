import { createContext } from 'react';
import type { useGridSortable } from 'react-native-reanimated-dnd';

type DragHandleContextValue = {
  gesture: ReturnType<typeof useGridSortable>['handlePanGestureHandler'];
  registerHandle: (registered: boolean) => void;
  isMoving: boolean;
};

export const DragHandleContext = createContext<DragHandleContextValue | null>(null);
