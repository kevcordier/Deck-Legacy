import { getResMeta } from '@helpers/renderHelpers';
import { useTranslation } from 'react-i18next';

interface ResourcePillProps {
  readonly resource: string;
  readonly size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'size-5', md: 'size-8', lg: 'size-10' };

export function ResourcePill({ resource, size = 'lg' }: ResourcePillProps) {
  const { t } = useTranslation();
  const meta = getResMeta(resource);
  return meta.icon && <meta.icon className={`${meta.cls} ${sizeMap[size]}`} alt={t(meta.label)} />;
}
