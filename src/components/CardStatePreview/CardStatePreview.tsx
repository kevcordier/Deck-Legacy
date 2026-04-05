import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import type { CardDef, CardInstance } from '@engine/domain/types';
import { tCardName } from '@i18n/cardI18n';
import './CardStatePreview.css';
import { GameCard } from '@components/GameCard';

function EyeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

interface CardStatePreviewProps {
  instance: CardInstance;
  defs: Record<number, CardDef>;
}

export function CardStatePreview({ instance, defs }: CardStatePreviewProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const def = defs[instance.cardId];
  if (!def || def.states.length <= 1) return null;

  return (
    <>
      <button
        onClick={e => {
          e.stopPropagation();
          setOpen(true);
        }}
        title={t('cardPreview.viewAllStates')}
        className="csp-btn"
      >
        <EyeIcon />
      </button>

      {open && (
        <CardStatesModal instance={instance} def={def} defs={defs} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function CardStatesModal({
  instance,
  def,
  defs,
  onClose,
}: {
  instance: CardInstance;
  def: CardDef;
  defs: Record<number, CardDef>;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return createPortal(
    <div className="csp-overlay" onClick={onClose}>
      <div className="csp-panel" onClick={e => e.stopPropagation()}>
        <div className="csp-modal-header">
          <div className="csp-modal-header-row">
            <div>
              <div className="csp-card-name">{tCardName(t, def.id, 1, def.name)}</div>
              <div className="csp-card-meta">
                {t('cardPreview.statesMeta', {
                  count: def.states.length,
                  id: instance.id,
                })}
              </div>
            </div>
            <button onClick={onClose} className="btn-close">
              ✕
            </button>
          </div>
        </div>

        <div className="csp-cards-row">
          {def.states.map(s => {
            const isCurrent = s.id === instance.stateId;
            const fakeInstance: CardInstance = {
              ...instance,
              stateId: s.id,
              trackProgress: isCurrent ? instance.trackProgress : [],
            };
            return (
              <div
                key={s.id}
                className={`csp-state-slot ${isCurrent ? 'csp-state-slot--current' : ''}`}
              >
                <GameCard
                  instance={fakeInstance}
                  defs={defs}
                  currentResources={{}}
                  isOnBoard={false}
                  hideStatePreview
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
