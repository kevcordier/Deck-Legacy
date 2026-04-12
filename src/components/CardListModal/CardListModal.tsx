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
    <Modal title={title} subtitle={subtitle} onClose={onClose}>
      {cards.length === 0 ? (
        <p className="p-2 text-center text-sm text-gray-400 italic">
          {emptyText ?? t('cardList.noCards')}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {cards.map(inst => (
            <GameCard key={inst.id} instance={inst} />
          ))}
        </div>
      )}
    </Modal>
  );

  return createPortal(modal, document.body);
}
