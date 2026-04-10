import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CardListModal } from '@components/CardListModal/CardListModal';
import { getActiveState } from '@engine/application/cardHelpers';
import { GameCard } from '@components/GameCard/GameCard';
import { useGame } from '@hooks/useGame';
import { Title } from '@components/ui/Title/Title';
import { Button } from '@components/ui/Button/Button';
import type { CardInstance } from '@engine/domain/types';

export function DeckViewer({
  title,
  emptyText,
  deck,
  displayedCard,
  isSheet = false,
}: {
  title: string;
  emptyText?: string;
  deck: CardInstance[];
  displayedCard?: CardInstance;
  isSheet?: boolean;
}) {
  const { defs } = useGame();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section
      className={`bg-background scrollbar flex shrink-0 flex-col ${isSheet ? 'w-full' : 'h-full w-64'}`}
    >
      <div className="border-b-border flex min-h-11 items-center justify-between border-b p-2">
        <Title level={4}>{title}</Title>
        {deck.length <= 1 ? (
          <span className="font-display text-xs">{deck.length}</span>
        ) : (
          <div className="flex items-center gap-2">
            <Button onClick={() => setModalOpen(true)} size="xs" variant="text" color="ink">
              {t('deckViewer.viewAll')}
            </Button>
            <Button onClick={() => setOpen(o => !o)} size="xs" variant="outlined" color="ink">
              {open ? '▲' : '▼'} {deck.length}
            </Button>
          </div>
        )}
      </div>
      {deck.length > 0 ? (
        <React.Fragment>
          {displayedCard && (
            <div className="flex flex-col items-center p-2">
              <GameCard instance={displayedCard} size="sm" />
            </div>
          )}
          {open && deck.length > 1 && (
            <div className="border-border flex flex-col gap-1 border-t p-2">
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
          {modalOpen && (
            <CardListModal
              title={t('deckViewer.title')}
              subtitle={t('deckViewer.modalSubtitle', { count: deck.length })}
              cards={deck}
              onClose={() => setModalOpen(false)}
              emptyText={t('deckViewer.emptyDeck')}
            />
          )}
        </React.Fragment>
      ) : (
        emptyText && <p className="p-2 text-center text-sm text-gray-400 italic">{emptyText}</p>
      )}
    </section>
  );
}
