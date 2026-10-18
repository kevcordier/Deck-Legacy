import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { Path } from 'react-native-svg';

/** Action that may be used repeatedly: the activated square with a loop instead of the check. */
export function UnlimitedIcon({ color = 'green', className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" fill="none" className={className} style={style} alt={alt}>
      <Path
        fill={color}
        d="M1.25 7.25C1.25 3.93629 3.93629 1.25 7.25 1.25H16.75C20.0637 1.25 22.75 3.93629 22.75 7.25V16.75C22.75 20.0637 20.0637 22.75 16.75 22.75H7.25C3.93629 22.75 1.25 20.0637 1.25 16.75V7.25Z"
      />
      <Path
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 12a5 5 0 1 1-1.46-3.54M17 6.5v3h-3"
      />
    </SvgIcon>
  );
}
