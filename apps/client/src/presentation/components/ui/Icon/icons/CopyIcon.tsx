import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { Path } from 'react-native-svg';

export function CopyIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon fill="none" viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Path
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        d="M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1Z"
      />
      <Path
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 5V4a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1"
      />
    </SvgIcon>
  );
}
