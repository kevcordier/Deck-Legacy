import { Modal } from '@components/ui/Modal/Modal';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface CardListModalProps {
  readonly title: ReactNode;
  readonly subtitle?: ReactNode;
  readonly onClose: () => void;
  readonly emptyText?: string;
  readonly children?: ReactNode;
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
      {children === null ||
      children === undefined ||
      (Array.isArray(children) && children.length === 0) ? (
        <p className="p-2 text-center text-sm text-ink/50 italic">
          {emptyText ?? t('cardList.noCards')}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
      )}
    </Modal>
  );

  return createPortal(modal, document.body);
}
