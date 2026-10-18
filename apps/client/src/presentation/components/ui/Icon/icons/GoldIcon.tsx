import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { IconColors } from '@components/ui/Icon/iconColors';
import { OUTLINE, OUTLINE_WIDTH, SHADE, SHINE } from '@components/ui/Icon/iconStrokeConstants';
import { Circle, Path, Polygon } from 'react-native-svg';

/** Coin with a raised rim, an embossed star and a shine. */
export function GoldIcon({ color = IconColors.gold, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Circle cx="12" cy="12" r="10" fill={color} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <Circle cx="12" cy="12" r="7" fill="none" stroke={SHADE} strokeWidth={1.2} />
      <Polygon
        fill={SHADE}
        points="12,7.6 13.3,10.4 16.3,10.6 14,12.6 14.7,15.6 12,14 9.3,15.6 10,12.6 7.7,10.6 10.7,10.4"
      />
      <Path
        stroke={SHINE}
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
        d="M5.5 9.5a7 7 0 0 1 4-4"
      />
    </SvgIcon>
  );
}
