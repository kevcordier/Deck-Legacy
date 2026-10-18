import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { Circle } from 'react-native-svg';

export function DotsVerticalIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon fill="none" viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Circle cx="12" cy="5" r="2" fill={color} />
      <Circle cx="12" cy="12" r="2" fill={color} />
      <Circle cx="12" cy="19" r="2" fill={color} />
    </SvgIcon>
  );
}
