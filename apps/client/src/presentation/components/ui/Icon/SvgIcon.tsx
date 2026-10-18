import type { IconProps } from './IconProps';
import { useTextDefaults } from '@components/ui/Text/useTextDefaults';
import { textCategories } from '@styles/text/textCategories';
import type { ReactNode } from 'react';
import { Platform, type ViewStyle } from 'react-native';
import Svg from 'react-native-svg';

const SIZE_CLASS = /(^|\s)(size|w|h)-/;

// On web, react-native-svg renders a block element: keep icons inline when nested in text.
const WEB_INLINE_STYLE = {
  display: 'inline-flex',
  verticalAlign: 'middle',
} as unknown as ViewStyle;

type SvgIconProps = Omit<IconProps, 'color'> & {
  readonly viewBox: string;
  readonly fill?: string;
  readonly children: ReactNode;
};

/**
 * Base SVG wrapper. `currentColor` resolves to the text color class of `className`
 * or, when absent, to the inherited text color (see `TextStyle`).
 */
export function SvgIcon({ viewBox, fill, className = '', style, alt, children }: SvgIconProps) {
  const { color: inheritedColor } = useTextDefaults();
  const colorClass = textCategories(className).color ? '' : (inheritedColor ?? '');
  const sizeClass = SIZE_CLASS.test(className) ? '' : 'size-4';

  return (
    <Svg
      viewBox={viewBox}
      fill={fill}
      className={`${sizeClass} ${colorClass} ${className}`.trim()}
      style={Platform.OS === 'web' ? [WEB_INLINE_STYLE, style] : style}
      accessibilityLabel={alt}
    >
      {children}
    </Svg>
  );
}
