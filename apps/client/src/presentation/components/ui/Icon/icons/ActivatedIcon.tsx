import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { Path } from 'react-native-svg';

export function ActivatedIcon({ color = 'green', className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" fill="none" className={className} style={style} alt={alt}>
      <Path
        fill={color}
        d="M1.25 7.25C1.25 3.93629 3.93629 1.25 7.25 1.25H16.75C20.0637 1.25 22.75 3.93629 22.75 7.25V16.75C22.75 20.0637 20.0637 22.75 16.75 22.75H7.25C3.93629 22.75 1.25 20.0637 1.25 16.75V7.25Z"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.0183 8.17565C18.2525 8.40985 18.2525 8.78956 18.0183 9.02376L11.6861 15.356C10.8274 16.2147 9.43512 16.2147 8.57639 15.356L5.9757 12.7553C5.7415 12.5211 5.7415 12.1414 5.9757 11.9072C6.2099 11.673 6.58961 11.673 6.82381 11.9072L9.4245 14.5078C9.81483 14.8982 10.4477 14.8982 10.838 14.5078L17.1702 8.17565C17.4044 7.94145 17.7841 7.94145 18.0183 8.17565Z"
        fill="white"
      />
    </SvgIcon>
  );
}
