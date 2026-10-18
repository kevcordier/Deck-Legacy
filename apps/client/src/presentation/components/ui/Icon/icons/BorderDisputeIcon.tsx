import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { IconColors } from '@components/ui/Icon/iconColors';
import { G, Line, Path } from 'react-native-svg';

/** Border Dispute: two crossed swords. */
export function BorderDisputeIcon({ color = IconColors.iron, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" fill="none" className={className} style={style} alt={alt}>
      <G stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
        <Line x1="13" y1="19" x2="19" y2="13" />
        <Line x1="16" y1="16" x2="20" y2="20" />
        <Line x1="19" y1="21" x2="21" y2="19" />
        <Path d="M14.5 6.5 18 3h3v3l-3.5 3.5" />
        <Line x1="5" y1="14" x2="9" y2="18" />
        <Line x1="7" y1="17" x2="4" y2="20" />
        <Line x1="3" y1="19" x2="5" y2="21" />
      </G>
    </SvgIcon>
  );
}
