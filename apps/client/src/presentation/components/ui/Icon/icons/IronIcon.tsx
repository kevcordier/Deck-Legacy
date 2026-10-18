import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { IconColors } from '@components/ui/Icon/iconColors';
import { OUTLINE, OUTLINE_WIDTH, SHADE, SHINE } from '@components/ui/Icon/iconStrokeConstants';
import { Path } from 'react-native-svg';

/** Ingot in three-quarter view: lit top with a stamp, front face, shaded right side. */
export function IronIcon({ color = IconColors.iron, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Path
        fill={color}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_WIDTH}
        strokeLinejoin="round"
        d="M1.5 18.5L4.5 12.5L9.5 8H19L22.5 14L15 18.5Z"
      />
      <Path fill={SHINE} d="M4.5 12.5L9.5 8H19L13.5 12.5Z" />
      <Path fill={SHADE} d="M13.5 12.5L19 8L22.5 14L15 18.5Z" />
      <Path
        fill="none"
        stroke={OUTLINE}
        strokeWidth={0.8}
        strokeLinejoin="round"
        d="M4.5 12.5H13.5L19 8M13.5 12.5L15 18.5"
      />
      <Path fill="none" stroke={SHADE} strokeWidth={0.8} d="M10 9.6h4.6l-1.6 1.3h-4.6z" />
      <Path stroke={SHINE} strokeWidth={1} strokeLinecap="round" d="M4.2 16.8h7" />
    </SvgIcon>
  );
}
