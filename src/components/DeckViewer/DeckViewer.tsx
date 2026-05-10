import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import { Divider } from '@components/ui/Divider/Divider';
import { SelectInput } from '@components/ui/Input/SelectInput';
import { TextInput } from '@components/ui/Input/TextInput';
import { Modal } from '@components/ui/Modal/Modal';
import { Title } from '@components/ui/Title/Title';
import { getActiveState } from '@engine/application/cardHelpers';
import { CardTag } from '@engine/domain/enums';
import type { CardInstance } from '@engine/domain/types';
import { tCardName, tCardTag } from '@helpers/cardI18n';
import { useGame } from '@hooks/useGame';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

type CardListFilter = {
  search: string;
  tag: string | null;
};

type DeckViewerProps = {
  readonly title: string;
  readonly icon: ReactNode;
  readonly emptyText?: string;
  readonly deck: CardInstance[];
  readonly displayedCards?: CardInstance[];
  readonly isSheet?: boolean;
  readonly footer?: ReactNode;
};

export function DeckViewer({
  title,
  icon,
  emptyText,
  deck,
  displayedCards,
  isSheet = false,
  footer,
}: DeckViewerProps) {
  const { defs } = useGame();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [cardFilter, setCardFilter] = useState<CardListFilter>({
    search: '',
    tag: '',
  });

  const cardFilterFn = (inst: CardInstance) => {
    const cs = getActiveState(inst, defs);
    return (
      t(`names.${inst.cardId}_${cs.id}`, { ns: 'cards' })
        ?.toString()
        .toLowerCase()
        .includes(cardFilter.search.toLowerCase()) &&
      (cardFilter.tag === '' || cs.tags?.includes(cardFilter.tag as CardTag))
    );
  };

  return (
    <section
      className={`bg-background scrollbar flex shrink-0 flex-col ${isSheet ? 'w-full' : 'h-full w-48 xl:w-64'}`}
    >
      <div className="border-b-border flex min-h-11 items-center justify-between border-b p-2">
        <Title level={4}>
          {icon} {title}
        </Title>
        {deck.length <= 1 ? (
          <span className="font-display text-xs">{deck.length}</span>
        ) : (
          <div className="flex items-center gap-2">
            <Button onClick={() => setModalOpen(true)} size="xs" variant="text" color="ink">
              {t('deckViewer.viewAll')}
            </Button>
            <Button
              onClick={() => setOpen(o => !o)}
              size="xs"
              variant="outlined"
              color="ink"
              className="hidden lg:inline"
            >
              {open ? '▲' : '▼'} {deck.length}
            </Button>
          </div>
        )}
      </div>
      {deck.length > 0 ? (
        <>
          {displayedCards && displayedCards.length > 0 && (
            <div className="@container flex min-w-xs flex-col items-center p-2 lg:min-w-0">
              {displayedCards.map(displayedCard => (
                <GameCard key={displayedCard.id} instance={displayedCard} className="w-full" />
              ))}
            </div>
          )}
          {deck.length > 1 && (
            <div
              className={`border-border min-w-xs grow flex-col gap-1 p-2 lg:min-w-0 lg:border-t ${open ? 'flex' : 'flex lg:hidden'}`}
            >
              <p className="font-display text-ink/90 text-center text-xs uppercase">
                {t('deckViewer.remainingCards')}
              </p>
              {deck.slice(1).map((inst, i) => {
                const cs = getActiveState(inst, defs);
                return (
                  <div
                    key={inst.id}
                    className="bg-border/20 border-border flex items-stretch gap-2 rounded-md border px-2 py-1"
                    style={{ animationDelay: `${i * 15}ms` }}
                  >
                    <span className="min-w-4.5 text-xs">#{inst.id}</span>
                    <span className="truncate text-xs font-semibold">
                      {tCardName(t, cs.name || '')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        emptyText && <p className="p-2 text-center text-sm text-ink/50 italic">{emptyText}</p>
      )}
      {footer && <div className="border-t-border mt-auto border-t p-2">{footer}</div>}
      {modalOpen && (
        <Modal
          title={t('deckViewer.title')}
          subtitle={t('deckViewer.modalSubtitle', { count: deck.length })}
          onClose={() => {
            setModalOpen(false);
            setCardFilter({ search: '', tag: '' });
          }}
        >
          <div className="flex flex-col">
            <form className="py-4">
              <div className="flex justify-between items-center gap-4 mb-4">
                <TextInput
                  value={cardFilter.search ?? ''}
                  type="search"
                  onChange={e => setCardFilter({ ...cardFilter, search: e.target.value })}
                  placeholder={t('cardList.searchPlaceholder')}
                />
                <SelectInput
                  value={cardFilter.tag ?? ''}
                  onChange={e => setCardFilter({ ...cardFilter, tag: e.target.value })}
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
            {deck.length === 0 ? (
              <p className="p-2 text-center text-sm text-ink/50 italic">
                {t('deckViewer.emptyDeck')}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {deck.filter(cardFilterFn).map(inst => (
                  <div key={inst.id}>
                    <GameCard instance={inst} className="w-full" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </section>
  );
}
