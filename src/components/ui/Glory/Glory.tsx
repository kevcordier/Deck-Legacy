import { GloryIcon } from '@components/ui/Icon/icon';
import { IconColors } from '@components/ui/Icon/iconColors';

type GloryProps = {
  readonly glory?: number;
  readonly className?: string;
};

export function Glory({ glory, className = '' }: GloryProps) {
  return (
    <div
      className={`text-base-ink relative inline-flex items-center justify-center aspect-square block-full size-10 ${glory && glory < 0 ? 'text-danger' : ''} ${className}`}
    >
      <GloryIcon color={IconColors.gold} className={`fill-primary/90 size-full`} />
      <span className={`font-display absolute font-bold`}>{glory ?? ''}</span>
    </div>
  );
}
