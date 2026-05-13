import { getResMeta } from '@helpers/renderHelpers';
import { useTranslation } from 'react-i18next';

interface ResourcePillProps {
  readonly resource: string;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
}

const sizeMap = { sm: 'size-5', md: 'size-8', lg: 'size-10' };

export function ResourcePill({ resource, size = 'lg', className }: ResourcePillProps) {
  const { t } = useTranslation();
  const meta = getResMeta(resource);
  return (
    meta.icon && (
      <meta.icon
        className={`${sizeMap[size]} ${className}`}
        color={meta.color}
        alt={t(meta.label)}
      />
    )
  );
}
