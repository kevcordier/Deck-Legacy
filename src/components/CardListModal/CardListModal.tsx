import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import './CardListModal.css';
import { GameCard } from '@components/GameCard';
import type { CardInstance } from '@engine/domain/types';

interface CardListModalProps {
  title: string;
  subtitle?: string;
  cards: CardInstance[];
  onClose: () => void;
  emptyText?: string;
}

export function CardListModal({ title, subtitle, cards, onClose, emptyText }: CardListModalProps) {
  const { t } = useTranslation();

  const modal = (
    <div onClick={onClose} className="clm-overlay">
      <div onClick={e => e.stopPropagation()} className="clm-panel">
        <div className="clm-header">
          <div className="clm-header-info">
            <div className="clm-title">{title}</div>
            {subtitle && <div className="clm-subtitle">{subtitle}</div>}
          </div>

          <button onClick={onClose} className="btn-close">
            ✕
          </button>
        </div>

        <div className="clm-content">
          {cards.length === 0 ? (
            <div className="clm-empty">{emptyText ?? t('cardList.noCards')}</div>
          ) : (
            <div className="clm-grid">
              {cards.map(inst => (
                <GameCard key={inst.id} instance={inst} size="sm" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
