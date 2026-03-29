import { useTranslation } from 'react-i18next';
import { getResMeta } from '@engine/application/resourceHelpers';
import './ResourcePill.css';

interface ResourcePillProps {
  resource: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ResourcePill({ resource, size = 'md' }: ResourcePillProps) {
  const { t } = useTranslation();
  const meta = getResMeta(resource);
  return (
    meta.iconUrl && (
      <img
        src={meta.iconUrl}
        className={`res-icon ${meta.cls} res-${size}`}
        title={t(meta.label)}
        alt={t(meta.label)}
      />
    )
  );
}
