import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { G, Path } from 'react-native-svg';

export function UpgradeIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 512 512" className={className} style={style} alt={alt}>
      <G transform="translate(256 256) scale(0.85) translate(-256 -256)">
        <Path d="M256.003 0 18.618 316.508h134.983V512H358.4V316.508h134.982z" fill={color} />
      </G>
    </SvgIcon>
  );
}
