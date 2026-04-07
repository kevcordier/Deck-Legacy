import { GloryIcon, IconColors } from '@components/ui/Icon';

type GloryProps = {
  glory: number;
  size?: 'sm' | 'md' | 'lg';
};

export function Glory({ glory, size = 'md' }: GloryProps) {
  return (
    <div
      className={`text-base-ink relative inline-flex items-center justify-center ${glory < 0 ? 'text-danger' : ''}`}
    >
      <GloryIcon
        color={IconColors.gold}
        className={`${size === 'sm' ? 'size-7' : size === 'lg' ? 'size-15' : 'size-10'} fill-amber-200/90`}
      />
      <span
        className={`font-display absolute font-bold ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-2xl' : 'text-lg'}`}
      >
        {glory > 0 ? '+' : ''}
        {glory}
      </span>
    </div>
  );
}
