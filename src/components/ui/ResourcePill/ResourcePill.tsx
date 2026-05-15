import { getResMeta } from '@helpers/renderHelpers';
import { useTranslation } from 'react-i18next';

interface ResourcePillProps {
  readonly resource: string;
  readonly className?: string;
}

export function ResourcePill({ resource, className }: ResourcePillProps) {
  const { t } = useTranslation();
  const meta = getResMeta(resource);
  return (
    meta.icon && (
      <meta.icon className={className ?? 'size-8'} color={meta.color} alt={t(meta.label)} />
    )
  );
}
