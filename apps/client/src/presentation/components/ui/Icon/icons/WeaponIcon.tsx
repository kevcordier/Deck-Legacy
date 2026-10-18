import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { IconColors } from '@components/ui/Icon/iconColors';
import { OUTLINE, OUTLINE_WIDTH, SHINE } from '@components/ui/Icon/iconStrokeConstants';
import { Circle, G, Path, Rect } from 'react-native-svg';

/** Sword, point up and to the right: steel blade, gold guard, leather grip. */
export function WeaponIcon({ color = IconColors.iron, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <G
        transform="rotate(45 12 12)"
        stroke={OUTLINE}
        strokeWidth={OUTLINE_WIDTH}
        strokeLinejoin="round"
      >
        <Path fill={color} d="M10.2 15.5V4.5L12 1.2l1.8 3.3v11z" />
        <Path fill={SHINE} stroke="none" d="M12 2.4v13.1h1.8v-11z" />
        <Rect x="7.5" y="15.5" width="9" height="2" rx="1" fill={IconColors.gold} />
        <Rect x="11" y="17.5" width="2" height="3.6" fill={IconColors.wood} />
        <Circle cx="12" cy="22" r="1.3" fill={IconColors.gold} />
      </G>
    </SvgIcon>
  );
}
