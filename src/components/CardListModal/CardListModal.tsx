import { GameCard } from '@components/GameCard/GameCard';
import { Modal } from '@components/ui/Modal/Modal';
import type { CardInstance } from '@engine/domain/types';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

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
    <Modal title={title} subtitle={subtitle} onClose={onClose} className="lg:min-w-2xl">
      {cards.length === 0 ? (
        <p className="p-2 text-center text-sm text-gray-400 italic">
          {emptyText ?? t('cardList.noCards')}
        </p>
      ) : (
        <div className="@container">
          <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
            {cards.map(inst => (
              <GameCard key={inst.id} instance={inst} />
            ))}
          </div>
        </div>
      )}
    </Modal>
  );

  return createPortal(modal, document.body);
}
