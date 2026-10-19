import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { IconColors } from '@components/ui/Icon/iconColors';
import { G, Path } from 'react-native-svg';

/** Merchants: a pair of scales. */
export function MerchantsIcon({ color = IconColors.gold, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" fill="none" className={className} style={style} alt={alt}>
      <G stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 3v17M8 20h8M5 6h14" />
        <Path d="M5 6 2.5 13h5L5 6ZM19 6l-2.5 7h5L19 6Z" />
        <Path d="M2.5 13a2.5 2.5 0 0 0 5 0M16.5 13a2.5 2.5 0 0 0 5 0" />
      </G>
    </SvgIcon>
  );
}
