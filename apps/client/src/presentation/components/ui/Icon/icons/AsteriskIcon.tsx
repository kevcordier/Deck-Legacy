import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { G, Line } from 'react-native-svg';

export function AsteriskIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <G stroke={color} strokeWidth={3} strokeLinecap="round">
        <Line x1="12" y1="3" x2="12" y2="21" />
        <Line x1="4.2" y1="7.5" x2="19.8" y2="16.5" />
        <Line x1="4.2" y1="16.5" x2="19.8" y2="7.5" />
      </G>
    </SvgIcon>
  );
}
