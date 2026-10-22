import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { IconColors } from '@components/ui/Icon/iconColors';
import { OUTLINE, OUTLINE_WIDTH, SHADE, SHINE } from '@components/ui/Icon/iconStrokeConstants';
import { Path } from 'react-native-svg';

/** Leaf with its central vein and a shine. */
export function HerbIcon({ color = IconColors.leaf, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Path
        fill={color}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_WIDTH}
        strokeLinejoin="round"
        d="M4 20C3 10 9 3.5 20.5 3.5 21 15 14 21 4 20z"
      />
      <Path stroke={SHADE} strokeWidth={1} fill="none" d="M4 20Q11 13 17.5 6.5" />
      <Path
        stroke={SHINE}
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
        d="M8 11.5q2-4.5 7-5.8"
      />
    </SvgIcon>
  );
}
