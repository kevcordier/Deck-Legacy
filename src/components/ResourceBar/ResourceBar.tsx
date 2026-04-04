import { useTranslation } from 'react-i18next';
import type { Resources } from '@engine/domain/types';
import { GloryIcon } from '@components/Icon';
import './ResourceBar.css';
import { ResourcePill } from '@components/Resource/ResourcePill';

interface ResourceBarProps {
  resources: Resources;
  score: number;
  round: number;
  turn: number;
  deckSize: number;
  discardSize: number;
}

export function ResourceBar({
  resources,
  score,
  round,
  turn,
  deckSize,
  discardSize,
}: ResourceBarProps) {
  const { t } = useTranslation();
  const entries = Object.entries(resources).filter(([, v]) => v > 0);

  return (
    <div className="rb-root">
      {/* Round/Turn info */}
      <div className="rb-group">
        <Stat label={t('resourceBar.round')} value={round || '—'} />
        <div className="rb-divider" />
        <Stat label={t('resourceBar.turn')} value={turn || '—'} />
      </div>

      <div className="rb-divider" />

      {/* Resources */}
      <div className="rb-resources">
        {entries.length === 0 ? (
          <span className="rb-empty">{t('resourceBar.noResources')}</span>
        ) : (
          entries.map(([k, v]) => {
            return (
              <div key={k} className="rb-resource-item">
                <span className="rb-resource-value">{v}</span>
                <ResourcePill key={k} resource={k} size="sm" />
              </div>
            );
          })
        )}
      </div>

      <div className="rb-divider" />

      {/* Deck / Discard */}
      <div className="rb-group">
        <Stat label={t('resourceBar.deck')} value={deckSize} color="var(--cream-d)" />
        <Stat label={t('resourceBar.discard')} value={discardSize} color="var(--stone)" />
      </div>

      <div className="rb-divider" />

      {/* Score */}
      <div className="rb-score">
        <div className="rb-score-badge">
          <GloryIcon color="#e8b85a" />
          <span className="rb-score-value">{score}</span>
        </div>
        <span className="rb-score-label">{t('resourceBar.glory')}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="stat">
      <div className="stat-value" style={color ? { color } : undefined}>
        {value}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
