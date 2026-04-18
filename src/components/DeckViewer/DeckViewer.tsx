import { CardListModal } from '@components/CardListModal/CardListModal';
import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import { Title } from '@components/ui/Title/Title';
import { getActiveState } from '@engine/application/cardHelpers';
import type { CardInstance } from '@engine/domain/types';
import { useGame } from '@hooks/useGame';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

type DeckViewerProps = {
  readonly title: string;
  readonly icon: ReactNode;
  readonly emptyText?: string;
  readonly deck: CardInstance[];
  readonly displayedCard?: CardInstance;
  readonly isSheet?: boolean;
  readonly footer?: ReactNode;
};

export function DeckViewer({
  title,
  icon,
  emptyText,
  deck,
  displayedCard,
  isSheet = false,
  footer,
}: DeckViewerProps) {
  const { defs } = useGame();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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
          {displayedCard && (
            <div className="@container flex min-w-xs flex-col items-center p-2 lg:min-w-0">
              <GameCard instance={displayedCard} className="w-full" />
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
                    <span className="truncate text-xs font-semibold">{cs.name}</span>
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
        <CardListModal
          title={t('deckViewer.title')}
          subtitle={t('deckViewer.modalSubtitle', { count: deck.length })}
          onClose={() => setModalOpen(false)}
          emptyText={t('deckViewer.emptyDeck')}
        >
          {deck.map(inst => (
            <div key={inst.id} className="@container">
              <GameCard instance={inst} className="w-full" />
            </div>
          ))}
        </CardListModal>
      )}
    </section>
  );
}
