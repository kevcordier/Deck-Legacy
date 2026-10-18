import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { IconColors } from '@components/ui/Icon/iconColors';
import { OUTLINE, OUTLINE_WIDTH, SHADE, SHINE } from '@components/ui/Icon/iconStrokeConstants';
import { Circle, Ellipse, Path } from 'react-native-svg';

/** Log seen from its cut end: bark, rings and a lighter cut face. */
export function WoodIcon({ color = IconColors.wood, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Path
        fill={color}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_WIDTH}
        strokeLinejoin="round"
        d="M6.5 4.5h12a4 7.5 0 0 1 0 15h-12z"
      />
      <Path
        stroke={SHADE}
        strokeWidth={1}
        strokeLinecap="round"
        d="M11 8.5h6.5M12.5 15.5h5.5M10.5 12h3"
      />
      <Ellipse cx="6.5" cy="12" rx="5" ry="7.5" fill={color} />
      <Ellipse
        cx="6.5"
        cy="12"
        rx="5"
        ry="7.5"
        fill={SHINE}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_WIDTH}
      />
      <Ellipse cx="6.5" cy="12" rx="2.8" ry="4.3" fill="none" stroke={SHADE} strokeWidth={0.9} />
      <Circle cx="6.5" cy="12" r="1" fill={SHADE} />
    </SvgIcon>
  );
}
