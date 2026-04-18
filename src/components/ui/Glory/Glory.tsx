import { GloryIcon } from '@components/ui/Icon/icon';
import { IconColors } from '@components/ui/Icon/iconColors';

type GloryProps = {
  readonly glory: number;
  readonly size?: 'xs' | 'sm' | 'md' | 'lg';
};

export function Glory({ glory, size = 'md' }: GloryProps) {
  const iconClasses = { xs: 'size-5', sm: 'size-7', md: 'size-10', lg: 'size-15' }[size];
  const textClasses = { xs: 'text-[9px]', sm: 'text-xs', md: 'text-lg', lg: 'text-2xl' }[size];
  return (
    <div
      className={`text-base-ink relative inline-flex items-center justify-center ${glory < 0 ? 'text-danger' : ''}`}
    >
      <GloryIcon color={IconColors.gold} className={`${iconClasses} fill-amber-200/90`} />
      <span className={`font-display absolute font-bold ${textClasses}`}>
        {glory > 0 ? '+' : ''}
        {glory}
      </span>
    </div>
  );
}
