import { Divider } from '@components/ui/Divider/Divider';
import { SelectInput } from '@components/ui/Input/SelectInput';
import { TextInput } from '@components/ui/Input/TextInput';
import { Modal } from '@components/ui/Modal/Modal';
import { CardTag } from '@engine/domain/enums';
import { tCardTag } from '@helpers/cardI18n';
import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

export type CardListFilter = {
  search: string;
  tag: string | null;
};

interface CardListModalProps {
  readonly title: ReactNode;
  readonly subtitle?: ReactNode;
  readonly onClose: () => void;
  readonly emptyText?: string;
  readonly children?: ReactNode;
  readonly cardFilter?: CardListFilter;
  readonly onFilterChange?: (filter: CardListFilter) => void;
}

export function CardListModal({
  title,
  subtitle,
  onClose,
  emptyText,
  children,
  cardFilter = { search: '', tag: '' },
  onFilterChange,
}: CardListModalProps) {
  const { t } = useTranslation();

  const modal = (
    <Modal title={title} subtitle={subtitle} onClose={onClose} className="lg:min-w-5xl!">
      <div className="flex flex-col">
        {onFilterChange && (
          <form className="p-4">
            <div className="flex justify-between items-center gap-4 mb-4">
              <TextInput
                value={cardFilter.search ?? ''}
                type="search"
                onChange={e => onFilterChange({ ...cardFilter, search: e.target.value })}
                placeholder={t('cardList.searchPlaceholder')}
              />
              <SelectInput
                value={cardFilter.tag ?? ''}
                onChange={e => onFilterChange({ ...cardFilter, tag: e.target.value })}
                options={[
                  { label: t('cardList.allTags'), value: '' },
                  ...Object.values(CardTag)
                    .map((value: string) => ({
                      label: tCardTag(t, value),
                      value,
                    }))
                    .filter(option => ![CardTag.GOAL].includes(option.value as CardTag))
                    .sort((a, b) => a.label.localeCompare(b.label)),
                ]}
              />
            </div>
            <Divider color="gradient" orientation="horizontal" className="my-4" />
          </form>
        )}
        {children === null ||
        children === undefined ||
        (Array.isArray(children) && children.length === 0) ? (
          <p className="p-2 text-center text-sm text-ink/50 italic">
            {emptyText ?? t('cardList.noCards')}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {children}
          </div>
        )}
      </div>
    </Modal>
  );

  return createPortal(modal, document.body);
}
