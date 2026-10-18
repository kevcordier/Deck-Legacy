import type { IconProps } from './IconProps';
import { SvgIcon } from './SvgIcon';
import { Circle, Line } from 'react-native-svg';

/** Magnifying glass with a minus sign, or a plus sign when `plus` is set. */
export function MagnifierIcon({
  color = 'currentColor',
  className,
  style,
  alt,
  plus,
}: IconProps & { readonly plus?: boolean }) {
  const line = { stroke: color, strokeWidth: '2', strokeLinecap: 'round' } as const;
  return (
    <SvgIcon viewBox="0 0 24 24" fill="none" className={className} style={style} alt={alt}>
      <Circle cx="10.5" cy="10.5" r="6.5" stroke={color} strokeWidth="2" />
      <Line x1="15.5" y1="15.5" x2="20" y2="20" {...line} />
      <Line x1="7.5" y1="10.5" x2="13.5" y2="10.5" {...line} />
      {plus && <Line x1="10.5" y1="7.5" x2="10.5" y2="13.5" {...line} />}
    </SvgIcon>
  );
}
