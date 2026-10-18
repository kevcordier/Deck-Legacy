import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { IconColors } from '@components/ui/Icon/iconColors';
import { Circle, G, Line, Path } from 'react-native-svg';

/** The Water Mill: a mill wheel above the water. */
export function WaterMillIcon({ color = IconColors.wood, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" fill="none" className={className} style={style} alt={alt}>
      <G stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="10" r="7" />
        <Circle cx="12" cy="10" r="1.5" />
        <Line x1="12" y1="3" x2="12" y2="17" />
        <Line x1="5" y1="10" x2="19" y2="10" />
        <Line x1="7.05" y1="5.05" x2="16.95" y2="14.95" />
        <Line x1="16.95" y1="5.05" x2="7.05" y2="14.95" />
        <Path d="M2 20.5c1.67 0 1.67-1 3.33-1s1.67 1 3.34 1 1.66-1 3.33-1 1.67 1 3.33 1 1.67-1 3.34-1 1.66 1 3.33 1" />
      </G>
    </SvgIcon>
  );
}
