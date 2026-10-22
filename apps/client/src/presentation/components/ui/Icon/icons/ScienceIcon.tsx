import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { IconColors } from '@components/ui/Icon/iconColors';
import { OUTLINE, OUTLINE_WIDTH, SHINE } from '@components/ui/Icon/iconStrokeConstants';
import { Path } from 'react-native-svg';

/** Round flask with a blue liquid and a shine. */
export function ScienceIcon({ color = IconColors.science, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Path
        fill="#e9eef2"
        stroke={OUTLINE}
        strokeWidth={OUTLINE_WIDTH}
        strokeLinejoin="round"
        d="M9.5 2.5h5v5.2a7.5 7.5 0 1 1-5 0z"
      />
      <Path
        fill={color}
        stroke={OUTLINE}
        strokeWidth={0.8}
        d="M5.6 13.2h12.8a6.4 6.4 0 1 1-12.8 0z"
      />
      <Path
        stroke={SHINE}
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
        d="M7.6 15.5q.6 2.4 2.6 3.3"
      />
      <Path stroke={OUTLINE} strokeWidth={1.6} strokeLinecap="round" d="M8.6 2.5h6.8" />
    </SvgIcon>
  );
}
