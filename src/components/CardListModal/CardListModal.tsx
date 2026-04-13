import { Modal } from '@components/ui/Modal/Modal';
import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface CardListModalProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose: () => void;
  emptyText?: string;
  children?: React.ReactNode;
}

export function CardListModal({
  title,
  subtitle,
  onClose,
  emptyText,
  children,
}: CardListModalProps) {
  const { t } = useTranslation();

  const modal = (
    <Modal title={title} subtitle={subtitle} onClose={onClose} className="lg:min-w-5xl!">
      {React.Children.count(children) === 0 ? (
        <p className="p-2 text-center text-sm text-gray-400 italic">
          {emptyText ?? t('cardList.noCards')}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
      )}
    </Modal>
  );

  return createPortal(modal, document.body);
}
