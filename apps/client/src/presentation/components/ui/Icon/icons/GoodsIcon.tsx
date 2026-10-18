import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { IconColors } from '@components/ui/Icon/iconColors';
import { OUTLINE, OUTLINE_WIDTH, SHADE, SHINE } from '@components/ui/Icon/iconStrokeConstants';
import { Path } from 'react-native-svg';

/** Barrel: staves, two hoops and a shine. */
export function GoodsIcon({ color = IconColors.wood, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Path
        fill={color}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_WIDTH}
        strokeLinejoin="round"
        d="M6.5 2.5h11q3 9.5 0 19h-11q-3-9.5 0-19z"
      />
      <Path
        stroke={SHADE}
        strokeWidth={0.9}
        fill="none"
        d="M10 2.5q-1.2 9.5 0 19M14 2.5q1.2 9.5 0 19"
      />
      <Path
        stroke={SHINE}
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
        d="M7.2 8q-.7 4 0 8"
      />
      <Path
        stroke={OUTLINE}
        strokeWidth={1.6}
        strokeLinecap="round"
        d="M4.9 7.5h14.2M4.9 16.5h14.2"
      />
    </SvgIcon>
  );
}
