import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { IconColors } from '@components/ui/Icon/iconColors';
import { G, Path } from 'react-native-svg';

/** Ridding the Woods: a leafy tree. */
export function RiddingTheWoodsIcon({ color = IconColors.wood, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" fill="none" className={className} style={style} alt={alt}>
      <G stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <Path
          d="M12 3a4 4 0 0 1 3.9 3.1A4 4 0 0 1 18 14H6a4 4 0 0 1 2.1-7.9A4 4 0 0 1 12 3Z"
          fill={IconColors.leaf}
        />
        <Path d="M12 21v-9" />
        <Path d="M12 16.5 9.5 14M12 14l2.5-2.5" />
        <Path d="M8 21h8" />
      </G>
    </SvgIcon>
  );
}
