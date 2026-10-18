import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { Path } from 'react-native-svg';

export function EyeIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon fill="none" viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Path
        fill={color}
        fillRule="evenodd"
        d="M11.994 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m0-2.006a1.494 1.494 0 1 1 0-2.988 1.494 1.494 0 0 1 0 2.988"
        clipRule="evenodd"
      />
      <Path
        fill={color}
        fillRule="evenodd"
        d="M12 5C7.189 5 3.917 7.609 2.19 9.48a3.68 3.68 0 0 0 0 5.04C3.916 16.391 7.188 19 12 19s8.083-2.609 9.81-4.48a3.68 3.68 0 0 0 0-5.04C20.084 7.609 16.812 5 12 5m-8.341 5.837C5.189 9.18 7.967 7 12 7s6.812 2.18 8.341 3.837a1.68 1.68 0 0 1 0 2.326C18.811 14.82 16.033 17 12 17s-6.812-2.18-8.341-3.837a1.68 1.68 0 0 1 0-2.326"
        clipRule="evenodd"
      />
    </SvgIcon>
  );
}
