import type { IconProps } from '@components/ui/Icon/IconProps';
import { MagnifierIcon } from '@components/ui/Icon/MagnifierIcon';

export function ZoomInIcon(props: IconProps) {
  return <MagnifierIcon {...props} plus />;
}
