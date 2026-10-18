import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { IconColors } from '@components/ui/Icon/iconColors';
import { OUTLINE, OUTLINE_WIDTH, SHADE, SHINE } from '@components/ui/Icon/iconStrokeConstants';
import { Path } from 'react-native-svg';

/** Rock with a lit facet and cracks. */
export function StoneIcon({ color = IconColors.stone, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Path
        fill={color}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_WIDTH}
        strokeLinejoin="round"
        d="M2.5 19.5l2.5-8 4.5-5.5 5.5 1 4.5 4 2 8.5z"
      />
      <Path fill={SHINE} d="M5 11.5l4.5-5.5 1.5 6z" />
      <Path fill={SHADE} d="M15 7l4.5 4 2 8.5-6-3z" />
      <Path
        stroke={SHADE}
        strokeWidth={0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        d="M11 12l4.5 4.5M11 12l-3.5 7.5"
      />
    </SvgIcon>
  );
}
