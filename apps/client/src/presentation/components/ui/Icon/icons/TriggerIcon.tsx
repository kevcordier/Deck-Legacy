import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { OUTLINE } from '@components/ui/Icon/iconStrokeConstants';
import { Polygon } from 'react-native-svg';

export function TriggerIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    // Room around the bolt for its outline (the viewBox is 512 wide: 24 px ≈ 21 units per px).
    <SvgIcon viewBox="-24 -24 560 560" className={className} style={style} alt={alt}>
      <Polygon
        fill={color}
        stroke={OUTLINE}
        strokeWidth={28}
        strokeLinejoin="round"
        points="386.415,193.208 287.481,193.208 359.434,0 161.566,0 125.585,280.151 206.528,280.151 170.557,512"
      />
    </SvgIcon>
  );
}
