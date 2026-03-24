import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { type CardInstance, type CardDef, type Resources } from '@engine/types';
import './CardListModal.css';
import { GameCard } from '@components/GameCard';

interface CardListModalProps {
  title: string;
  subtitle?: string;
  cards: CardInstance[];
  defs: Record<number, CardDef>;
  onClose: () => void;
  emptyText?: string;
}

export function CardListModal({
  title,
  subtitle,
  cards,
  defs,
  onClose,
  emptyText,
}: CardListModalProps) {
  const { t } = useTranslation();

  const modal = (
    <div onClick={onClose} className="clm-overlay">
      <div onClick={e => e.stopPropagation()} className="clm-panel">
        {/* Header */}
        <div className="clm-header">
          <div className="clm-header-info">
            <div className="clm-title">{title}</div>
            {subtitle && <div className="clm-subtitle">{subtitle}</div>}
          </div>

          <button onClick={onClose} className="btn-close">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="clm-content">
          {cards.length === 0 ? (
            <div className="clm-empty">{emptyText ?? t('cardList.noCards')}</div>
          ) : (
            <div className="clm-grid">
              {cards.map((inst, i) => (
                <GameCard
                  key={inst.uid}
                  instance={inst}
                  defs={defs}
                  currentResources={{} as Resources}
                  activated={[]}
                  isInTableau={false}
                  animDelay={Math.min(i * 30, 300)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
