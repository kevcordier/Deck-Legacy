import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CardListModal } from '@components/CardListModal';
import { getActiveState, getEffectiveProductions } from '@engine/application/cardHelpers';
import './DiscardPile.css';
import { GameCard } from '@components/GameCard';
import type { CardInstance, CardDef } from '@engine/domain/types';
import { useGame } from '@hooks/useGame';

interface DiscardPileProps {
  discard: number[];
  instances: Record<number, CardInstance>;
  defs: Record<number, CardDef>;
}

export function DiscardPile({ discard, instances, defs }: DiscardPileProps) {
  const { t } = useTranslation();
  const { stickerDefs: stickers } = useGame(); // for up to date stickers with glory values
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const topId = discard[discard.length - 1]; // last discarded = top of pile
  const topInst = topId ? instances[topId] : null;

  const discardForModal = [...discard]
    .reverse()
    .map(id => instances[id])
    .filter(Boolean) as CardInstance[];

  if (discard.length === 0)
    return (
      <div className="dp-col">
        <div className="dp-header">
          <span className="dp-title">{t('discardPile.title')}</span>
          <span className="dp-count">0</span>
        </div>
        <div className="dp-empty">{t('discardPile.empty')}</div>
      </div>
    );

  return (
    <div className="dp-col">
      <div className="dp-header">
        <span className="dp-title">{t('discardPile.title')}</span>
        <div className="dp-header-btns">
          <button onClick={() => setModalOpen(true)} className="btn-view-all">
            {t('discardPile.viewAll')}
          </button>
          <button onClick={() => setOpen(o => !o)} className={`btn-toggle${open ? ' open' : ''}`}>
            {open ? '▲' : '▼'} {discard.length}
          </button>
        </div>
      </div>

      {/* Top card (most recently discarded) */}
      {topInst && (
        <div className="dp-top-card">
          <GameCard
            instance={topInst}
            defs={defs}
            currentResources={{}}
            isOnBoard={false}
            style={{ width: '100%' }}
          />
        </div>
      )}

      {/* Full list — most recent first */}
      {open && discard.length > 1 && (
        <div className="dp-list">
          <div className="dp-list-label">{t('discardPile.allCards')}</div>
          {[...discard].reverse().map((id, i) => {
            const inst = instances[id];
            if (!inst) return null;
            const cs = getActiveState(inst, defs);
            const prod = getEffectiveProductions(cs, inst, stickers);
            const glory = cs.glory ?? 0;
            return (
              <div
                key={`${id}-${i}`}
                className="dp-row"
                style={{ animationDelay: `${Math.min(i * 15, 200)}ms` }}
              >
                <span className="dp-row-id">#{inst.id}</span>
                <span className="dp-row-name">{cs.name}</span>
                <div className="dp-row-prods">
                  {Object.entries(prod)
                    .slice(0, 2)
                    .map(([k, v]) => (
                      <span key={k} className={`res res-${k} res--xs`}>
                        {v}
                      </span>
                    ))}
                  {glory !== 0 && (
                    <span
                      className={`dp-row-glory ${glory < 0 ? 'dp-row-glory--neg' : 'dp-row-glory--pos'}`}
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
          title={t('discardPile.title')}
          subtitle={t('discardPile.modalSubtitle', { count: discard.length })}
          cards={discardForModal}
          defs={defs}
          onClose={() => setModalOpen(false)}
          emptyText={t('discardPile.emptyDiscard')}
        />
      )}
    </div>
  );
}
