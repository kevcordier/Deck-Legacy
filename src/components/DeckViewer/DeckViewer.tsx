import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CardListModal } from '@components/CardListModal/CardListModal';
import { getActiveState, getEffectiveProductions } from '@engine/application/cardHelpers';
import './DeckViewer.css';
import { GameCard } from '@components/GameCard';
import type { CardInstance, CardDef, Sticker } from '@engine/domain/types';

interface DeckViewerProps {
  deck: number[];
  instances: Record<number, CardInstance>;
  defs: Record<number, CardDef>;
  stickers?: Record<number, Sticker>;
}

export function DeckViewer({ deck, instances, defs, stickers = {} }: DeckViewerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const topId = deck[0];
  const topInst = topId ? instances[topId] : null;

  const sortedList = useMemo(() => {
    return [...deck]
      .map(id => instances[id])
      .filter(Boolean)
      .sort((a, b) => (a.id ?? 9999) - (b.id ?? 9999));
  }, [deck, instances]);

  if (deck.length === 0)
    return (
      <div className="dv-col">
        <div className="dv-header">
          <span className="dv-title">{t('deckViewer.title')}</span>
          <span className="dv-count">0</span>
        </div>
        <div className="dv-empty">{t('deckViewer.empty')}</div>
      </div>
    );

  return (
    <div className="dv-col">
      <div className="dv-header">
        <span className="dv-title">{t('deckViewer.title')}</span>
        <div className="dv-header-btns">
          <button onClick={() => setModalOpen(true)} className="btn-view-all">
            {t('deckViewer.viewAll')}
          </button>
          <button onClick={() => setOpen(o => !o)} className={`btn-toggle${open ? ' open' : ''}`}>
            {open ? '▲' : '▼'} {deck.length}
          </button>
        </div>
      </div>

      {/* Top card */}
      {topInst && (
        <div className="dv-top-card">
          <GameCard
            instance={topInst}
            defs={defs}
            currentResources={{}}
            isOnBoard={false}
            style={{ width: '100%' }}
          />
        </div>
      )}

      {/* Remaining list sorted by id */}
      {open && deck.length > 1 && (
        <div className="dv-list">
          <div className="dv-list-label">{t('deckViewer.remainingCards')}</div>
          {sortedList.slice(1).map((inst, i) => {
            const cs = getActiveState(inst, defs);
            const base = cs.productions?.[0] || {};
            const prod = getEffectiveProductions(base, inst, stickers);
            const glory = cs.glory ?? 0;
            return (
              <div key={inst.id} className="dv-row" style={{ animationDelay: `${i * 15}ms` }}>
                <span className="dv-row-id">#{inst.id}</span>
                <span className="dv-row-name">{cs.name}</span>
                <div className="dv-row-prods">
                  {Object.entries(prod)
                    .slice(0, 2)
                    .map(([k, v]) => (
                      <span key={k} className={`res res-${k} res--xs`}>
                        {v}
                      </span>
                    ))}
                  {glory !== 0 && (
                    <span
                      className={`dv-row-glory ${glory < 0 ? 'dv-row-glory--neg' : 'dv-row-glory--pos'}`}
                    >
                      {glory > 0 ? '+' : ''}
                      {glory}★
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {modalOpen && (
        <CardListModal
          title={t('deckViewer.title')}
          subtitle={t('deckViewer.modalSubtitle', { count: deck.length })}
          cards={sortedList}
          defs={defs}
          onClose={() => setModalOpen(false)}
          emptyText={t('deckViewer.emptyDeck')}
        />
      )}
    </div>
  );
}
