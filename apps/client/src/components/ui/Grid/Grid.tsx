import { Children, type ReactNode, isValidElement, useState } from 'react';
import { View } from 'react-native';

type GridProps = {
  readonly children: ReactNode;
  /** Fixed number of columns. */
  readonly columns?: number;
  /** Minimum item width in px; the number of columns adapts to the available width. */
  readonly minItemWidth?: number;
  readonly maxColumns?: number;
  /** Gap between items in px. */
  readonly gap?: number;
  readonly className?: string;
};

/**
 * Responsive grid (React Native has no CSS grid): measures its width and lays out
 * children in rows of equal-width cells.
 */
export function Grid({
  children,
  columns,
  minItemWidth = 240,
  maxColumns = 8,
  gap = 16,
  className = '',
}: GridProps) {
  const [width, setWidth] = useState(0);
  const autoColumns = Math.floor((width + gap) / (minItemWidth + gap));
  const columnCount = Math.max(1, Math.min(columns ?? autoColumns, maxColumns));
  // Floored so rounding never pushes the last item of a row onto the next one.
  const itemWidth =
    width > 0 ? Math.floor((width - gap * (columnCount - 1)) / columnCount) : undefined;

  // The measured view has no padding (`className` goes on the outer one): measuring a padded
  // view sizes the cells wider than the room they have, and in a shrink-to-fit parent (desktop
  // modal) that overflow resizes the parent, which re-lays out the grid in an endless loop.
  return (
    <View className={`w-full ${className}`}>
      <View
        className="w-full flex-row flex-wrap"
        style={{ gap }}
        onLayout={event => setWidth(event.nativeEvent.layout.width)}
      >
        {/* Each child needs a sized cell; toArray drops null children and keys every element. */}
        {/* eslint-disable-next-line @eslint-react/no-children-to-array */}
        {Children.toArray(children).map((child, index) => (
          <View
            // eslint-disable-next-line @eslint-react/no-array-index-key -- only for non-element children
            key={isValidElement(child) && child.key !== null ? child.key : index}
            style={{ width: itemWidth ?? '100%' }}
          >
            {child}
          </View>
        ))}
      </View>
    </View>
  );
}
