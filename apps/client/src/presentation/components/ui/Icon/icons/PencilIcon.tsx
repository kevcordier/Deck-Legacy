import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { Path } from 'react-native-svg';

export function PencilIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon fill="none" viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Path
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 20h4L19.3 8.7a1.4 1.4 0 0 0 0-2l-2-2a1.4 1.4 0 0 0-2 0L4 16zM14 6l4 4"
      />
    </SvgIcon>
  );
}
