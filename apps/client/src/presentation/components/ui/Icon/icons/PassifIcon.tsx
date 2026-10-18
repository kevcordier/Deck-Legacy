import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { G, Path } from 'react-native-svg';

export function PassifIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 16 16" className={className} style={style} alt={alt}>
      <G transform="translate(6.025 -1038.1)">
        <Path
          fill={color}
          d="M-2.025 1042.1a4 4 0 0 0 0 8c2 0 4-1 5-4-1-3-3-4-5-4zm0 2s2 0 3 2c-1 2-3 2-3 2a2 2 0 1 1 0-4z"
        />
        <Path
          fill={color}
          d="M5.975 1042.1a4 4 0 0 1 0 8c-2 0-4-1-5-4 1-3 3-4 5-4zm0 2s-2 0-3 2c1 2 3 2 3 2a2 2 0 1 0 0-4z"
        />
      </G>
    </SvgIcon>
  );
}
