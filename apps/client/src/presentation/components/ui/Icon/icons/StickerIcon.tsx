import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { Path } from 'react-native-svg';

/** Round sticker whose bottom-right edge peels off (sticker stock). */
export function StickerIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon fill="none" viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Path d="M21 12A9 9 0 1 0 12 21" stroke={color} strokeWidth={2} strokeLinecap="round" />
      {/* Flap folded back over the sticker, along the line between the two arc ends. */}
      <Path
        d="M12 21L21 12Q12.8 12.8 12 21Z"
        fill={color}
        fillOpacity={0.25}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
}
