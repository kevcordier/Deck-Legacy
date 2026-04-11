import { getResMeta } from '@helpers/renderHelpers';
import { useTranslation } from 'react-i18next';

interface ResourcePillProps {
  resource: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function ResourcePill({ resource, size = 'md' }: ResourcePillProps) {
  const { t } = useTranslation();
  const meta = getResMeta(resource);
  return (
    meta.icon && (
      <meta.icon
        className={`${meta.cls} ${size === 'xs' ? 'size-4' : size === 'sm' ? 'size-7' : size === 'lg' ? 'size-12' : 'size-10'}`}
        alt={t(meta.label)}
      />
    )
  );
}
