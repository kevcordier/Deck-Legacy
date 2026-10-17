import { type ReactNode, createContext, use, useEffect, useMemo } from 'react';
import { Platform, type StyleProp, View, type ViewStyle } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  type GestureType,
} from 'react-native-gesture-handler';
import Animated, { useSharedValue } from 'react-native-reanimated';
import {
  type GridDimensions,
  GridOrientation,
  type GridPositions,
  GridScrollDirection,
  type UseGridSortableOptions,
  calculateGridContentDimensions,
  listToGridObject,
  useGridSortable,
} from 'react-native-reanimated-dnd';

type SortableCardGridProps = {
  readonly ids: string[];
  readonly dimensions: GridDimensions;
  readonly renderItem: (id: string, index: number) => ReactNode;
  readonly itemStyle?: (id: string) => StyleProp<ViewStyle> | undefined;
  /** Items are dragged only by their `CardDragHandle`, not by their whole surface. */
  readonly dragByHandle?: boolean;
  readonly onDragStart?: (id: string) => void;
  /** Receives the ids in their new order. */
  readonly onDrop?: (orderedIds: string[]) => void;
};

/**
 * The library never scrolls this grid: a container this large keeps its auto-scroll (which would
 * shift the dragged item) idle.
 */
const NO_AUTO_SCROLL_SIZE = 1_000_000;

const toItems = (ids: string[]) => ids.map(id => ({ id }));

type CardGridItemProps = UseGridSortableOptions<unknown> & {
  readonly animatedStyle?: StyleProp<ViewStyle>;
  readonly dragByHandle?: boolean;
  readonly children: ReactNode;
};

type DragHandleContextValue = {
  gesture: GestureType;
  registerHandle: (registered: boolean) => void;
  isMoving: boolean;
};

const DragHandleContext = createContext<DragHandleContextValue | null>(null);

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

/**
 * `SortableGridItem` without its default `touch-action: none` on web, which stopped a swipe over
 * a card from scrolling the board on mobile browsers.
 */
function CardGridItem({ animatedStyle, dragByHandle, children, ...options }: CardGridItemProps) {
  const {
    animatedStyle: positionStyle,
    panGestureHandler,
    handlePanGestureHandler,
    registerHandle,
    isMoving,
  } = useGridSortable(options);
  const handle = useMemo(
    () => (dragByHandle ? { gesture: handlePanGestureHandler, registerHandle, isMoving } : null),
    [dragByHandle, handlePanGestureHandler, registerHandle, isMoving],
  );
  return (
    <Animated.View style={[positionStyle, animatedStyle]}>
      <GestureDetector gesture={panGestureHandler} touchAction="manipulation">
        <Animated.View style={{ flex: 1 }}>
          <DragHandleContext value={handle}>{children}</DragHandleContext>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

/**
 * Sortable grid built from `useGridSortable` without `SortableGrid`, whose scroll view clips
 * the cards' hover zoom and shadows. Items keep their own position while dragged; the order is
 * reported on drop.
 *
 * An item reads its starting cell when it mounts: remount the grid (`key`) when items are added
 * or removed, otherwise a new card would stay in the top-left cell. Reordering and resizing do
 * not need it.
 */
export function SortableCardGrid({
  ids,
  dimensions,
  renderItem,
  itemStyle,
  dragByHandle,
  onDragStart,
  onDrop,
}: SortableCardGridProps) {
  const orientation = GridOrientation.Vertical;
  const positions = useSharedValue<GridPositions>(
    listToGridObject(toItems(ids), dimensions, orientation),
  );
  const scrollX = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const autoScrollDirection = useSharedValue(GridScrollDirection.None);
  const signature = ids.join(',');

  useEffect(() => {
    positions.set(listToGridObject(toItems(signature.split(',')), dimensions, orientation));
  }, [signature, dimensions, orientation, positions]);

  const size = useMemo(
    () => calculateGridContentDimensions(ids.length, dimensions, orientation),
    [ids.length, dimensions, orientation],
  );

  const handleDrop = (_id: string, _position: number, allPositions?: GridPositions) => {
    if (!allPositions) return;
    onDrop?.(
      Object.entries(allPositions)
        .sort(([, a], [, b]) => a.index - b.index)
        .map(([id]) => id),
    );
  };

  return (
    <GestureHandlerRootView style={{ width: size.width, height: size.height }}>
      <View style={{ width: size.width, height: size.height }}>
        {ids.map((id, index) => (
          <CardGridItem
            key={id}
            id={id}
            positions={positions}
            scrollX={scrollX}
            scrollY={scrollY}
            autoScrollDirection={autoScrollDirection}
            itemsCount={ids.length}
            dimensions={dimensions}
            orientation={orientation}
            containerWidth={NO_AUTO_SCROLL_SIZE}
            containerHeight={NO_AUTO_SCROLL_SIZE}
            animatedStyle={itemStyle?.(id)}
            dragByHandle={dragByHandle}
            onDragStart={onDragStart}
            onDrop={handleDrop}
          >
            {renderItem(id, index)}
          </CardGridItem>
        ))}
      </View>
    </GestureHandlerRootView>
  );
}
