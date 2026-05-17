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
import { tCardTag } from '@helpers/cardI18n';
import { useGame } from '@hooks/useGame';
import { useTutorial } from '@hooks/useTutorial';
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
  readonly variant?: 'full' | 'left' | 'right';
  readonly pinned?: boolean;
  readonly onTogglePinned?: () => void;
  readonly footer?: ReactNode;
  readonly deckName?: 'draw' | 'discard' | 'destroyed';
};

export function DeckViewer({
  title,
  icon,
  emptyText,
  deck,
  displayedCards,
  variant = 'full',
  pinned,
  onTogglePinned,
  footer,
  deckName,
}: DeckViewerProps) {
  const { defs } = useGame();
  const { t } = useTranslation();
  const { run, nextStep } = useTutorial();
  const [modalOpen, setModalOpen] = useState(false);
  const [cardFilter, setCardFilter] = useState<CardListFilter>({
    search: '',
    tag: '',
  });
  const isLeft = variant === 'left';

  const cardFilterFn = (inst: CardInstance) => {
    const cs = getActiveState(inst, defs);
    return (
      t(`names.${cs.name}`, { ns: 'cards' })
        ?.toString()
        .toLowerCase()
        .includes(cardFilter.search.toLowerCase()) &&
      (cardFilter.tag === '' || cs.tags?.includes(cardFilter.tag as CardTag))
    );
  };

  const openIcon = isLeft ? '▶︎' : '◀︎';
  const closeIcon = isLeft ? '◀︎' : '▶︎';

  const elementClass = 'hidden @min-[10rem]/section:inline-flex';

  const tourDataId = deckName
    ? {
        draw: 'draw-viewer-open',
        discard: 'discard-viewer-open',
        destroyed: 'destroyed-viewer-open',
      }[deckName]
    : undefined;

  return (
    <section
      className={`bg-background scrollbar @container/section group/section flex shrink-0 flex-col w-full`}
    >
      <div
        className={`border-b-border flex min-h-11 items-center justify-between flex-nowrap border-b p-2 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
      >
        {variant !== 'full' && (
          <button
            data-tour={isLeft ? 'draw-viewer-pin' : 'discard-viewer-pin'}
            onClick={onTogglePinned}
            className="text-ink/40 hover:text-ink text-xs leading-none transition-colors"
            title={pinned ? t('deckViewer.unpinPanel') : t('deckViewer.pinPanel')}
            aria-label={pinned ? t('deckViewer.unpinPanel') : t('deckViewer.pinPanel')}
          >
            {pinned ? closeIcon : openIcon}
          </button>
        )}
        <div className="inline-flex items-center gap-2">
          <Title level={4}>
            {icon}{' '}
            <span className={`${elementClass}`}>
              {title} ({deck.length})
            </span>
          </Title>
          {deck.length > 1 && (
            <Button
              className={elementClass}
              onClick={() => {
                if (run) {
                  nextStep();
                }
                setModalOpen(true);
              }}
              size="xs"
              variant="text"
              color="ink"
              data-tour={tourDataId}
            >
              {t('deckViewer.viewAll')}
            </Button>
          )}
        </div>
      </div>

      {deck.length > 0 ? (
        <>
          {displayedCards && displayedCards.length > 0 && (
            <div
              className={`@container flex min-w-xs flex-col items-center p-2 lg:min-w-0 ${elementClass}`}
            >
              {displayedCards.map(displayedCard => (
                <GameCard key={displayedCard.id} instance={displayedCard} className="w-full" />
              ))}
            </div>
          )}
        </>
      ) : (
        emptyText && (
          <p className={`p-2 text-center text-sm text-ink/50 italic ${elementClass}`}>
            {emptyText}
          </p>
        )
      )}
      {footer && <div className={`border-t-border mt-auto border-t p-2`}>{footer}</div>}

      {modalOpen && (
        <Modal
          title={t('deckViewer.title')}
          subtitle={t('deckViewer.modalSubtitle', { count: deck.length })}
          onClose={() => {
            setModalOpen(false);
            setCardFilter({ search: '', tag: '' });
            if (run) {
              nextStep();
            }
          }}
          label={deckName}
        >
          <div className="flex flex-col" data-tour={'deck-viewer'}>
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
                    { label: t('cardList.allTags'), value: '' as const },
                    ...deck
                      .reduce((acc, inst) => {
                        const cs = getActiveState(inst, defs);
                        cs.tags?.forEach(tag => {
                          if (![CardTag.GOAL].includes(tag) && !acc.includes(tag)) {
                            acc.push(tag);
                          }
                        });
                        return acc;
                      }, [] as string[])
                      .map((value: string) => ({
                        label: tCardTag(t, value),
                        value,
                      }))
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
                  <div className={`@container min-w-60`} key={inst.id}>
                    <GameCard instance={inst} />
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
