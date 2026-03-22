import { useState } from 'react'
// @ts-ignore — react-dom types available in project
import { createPortal } from 'react-dom'
import type { CardInstance, CardDef, Resources } from '../../engine/types'
import { getActiveState } from '../../engine/types'
import { GameCard } from '../GameCard'
import { getEffectiveProductions } from './cardHelpers'
import './CardListModal.css'

interface CardListModalProps {
  title: string
  subtitle?: string
  cards: CardInstance[]
  defs: Record<number, CardDef>
  onClose: () => void
  emptyText?: string
}

export function CardListModal({
  title,
  subtitle,
  cards,
  defs,
  onClose,
  emptyText,
}: CardListModalProps) {
  const [view, setView] = useState<'list' | 'grid'>('list')

  const modal = (
    <div onClick={onClose} className="clm-overlay">
      <div onClick={e => e.stopPropagation()} className="clm-panel">
        {/* Header */}
        <div className="clm-header">
          <div className="clm-header-info">
            <div className="clm-title">{title}</div>
            {subtitle && <div className="clm-subtitle">{subtitle}</div>}
          </div>

          {/* View toggle */}
          <div className="clm-view-toggle">
            {(['list', 'grid'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`clm-view-btn${view === v ? ' active' : ''}`}
              >
                {v === 'list' ? '≡ Liste' : '⊞ Cartes'}
              </button>
            ))}
          </div>

          <button onClick={onClose} className="btn-close">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="clm-content">
          {cards.length === 0 ? (
            <div className="clm-empty">{emptyText ?? 'Aucune carte'}</div>
          ) : view === 'grid' ? (
            <div className="clm-grid">
              {cards.map((inst, i) => (
                <GameCard
                  key={inst.uid}
                  instance={inst}
                  defs={defs}
                  currentResources={{} as Resources}
                  activated={[]}
                  isInTableau={false}
                  animDelay={Math.min(i * 30, 300)}
                />
              ))}
            </div>
          ) : (
            <div className="clm-list">
              {cards.map((inst, i) => {
                const cs = getActiveState(inst, defs)
                const prod = getEffectiveProductions(cs, inst)
                const glory = cs.glory ?? 0
                return (
                  <div
                    key={inst.uid}
                    className="clm-list-row"
                    style={{ animationDelay: `${Math.min(i * 15, 200)}ms` }}
                  >
                    {/* Number badge */}
                    <span className="clm-row-badge">#{inst.deckEntryId}</span>

                    {/* Tags */}
                    <div className="clm-row-tags">
                      {cs.tags.slice(0, 2).map(t => (
                        <span key={t} className="tag tag--xs">{t}</span>
                      ))}
                    </div>

                    {/* Name */}
                    <span className="clm-row-name">{cs.name}</span>

                    {/* State */}
                    {inst.stateId > 1 && (
                      <span className="clm-row-state">niv.{inst.stateId}</span>
                    )}

                    {/* Vignettes */}
                    {inst.vignettes.length > 0 && (
                      <span className="clm-row-vignettes">◆×{inst.vignettes.length}</span>
                    )}

                    {/* Productions */}
                    <div className="clm-row-prods">
                      {Object.entries(prod).map(([k, v]) => (
                        <span
                          key={k}
                          className={`res res-${k} res--sm`}
                        >
                          {v}
                        </span>
                      ))}
                    </div>

                    {/* Glory */}
                    {glory !== 0 && (
                      <span className={`clm-row-glory ${glory < 0 ? 'clm-row-glory--neg' : 'clm-row-glory--pos'}`}>
                        {glory > 0 ? '+' : ''}
                        {glory}★
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
