import { useState, useMemo } from 'react'
import type { CardInstance, CardDef } from '../engine/types'
import { getActiveState } from '../engine/types'
import { GameCard } from './GameCard'
import { CardListModal } from './game/CardListModal'
import { getEffectiveProductions } from './game/cardHelpers'
import './DeckViewer.css'

interface DeckViewerProps {
  deck: string[]
  instances: Record<string, CardInstance>
  defs: Record<number, CardDef>
}

export function DeckViewer({ deck, instances, defs }: DeckViewerProps) {
  const [open, setOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const topUid = deck[0]
  const topInst = topUid ? instances[topUid] : null

  // List sorted by deckEntryId (not deck order) — no info leak on next card
  const sortedList = useMemo(() => {
    return [...deck]
      .map(uid => instances[uid])
      .filter(Boolean)
      .sort((a, b) => (a.deckEntryId ?? 9999) - (b.deckEntryId ?? 9999))
  }, [deck, instances])

  if (deck.length === 0)
    return (
      <div className="dv-col">
        <div className="dv-header">
          <span className="dv-title">Pioche</span>
          <span className="dv-count">0</span>
        </div>
        <div className="dv-empty">Vide</div>
      </div>
    )

  return (
    <div className="dv-col">
      <div className="dv-header">
        <span className="dv-title">Pioche</span>
        <div className="dv-header-btns">
          <button onClick={() => setModalOpen(true)} className="btn-view-all">
            ⊞ Voir tout
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
            activated={[]}
            isInTableau={false}
            style={{ width: '100%' }}
          />
        </div>
      )}

      {/* Remaining list sorted by id */}
      {open && deck.length > 1 && (
        <div className="dv-list">
          <div className="dv-list-label">Cartes restantes — triées par numéro</div>
          {sortedList.slice(1).map((inst, i) => {
            const cs = getActiveState(inst, defs)
            const prod = getEffectiveProductions(cs, inst)
            const glory = cs.glory ?? 0
            return (
              <div
                key={inst.uid}
                className="dv-row"
                style={{ animationDelay: `${i * 15}ms` }}
              >
                <span className="dv-row-id">#{inst.deckEntryId}</span>
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
                    <span className={`dv-row-glory ${glory < 0 ? 'dv-row-glory--neg' : 'dv-row-glory--pos'}`}>
                      {glory > 0 ? '+' : ''}
                      {glory}★
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
      {modalOpen && (
        <CardListModal
          title="Pioche"
          subtitle={`${deck.length} carte${deck.length > 1 ? 's' : ''} — triées par numéro`}
          cards={sortedList}
          defs={defs}
          onClose={() => setModalOpen(false)}
          emptyText="La pioche est vide"
        />
      )}
    </div>
  )
}
