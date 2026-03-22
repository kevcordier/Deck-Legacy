import { useState } from 'react'
import type { CardInstance, CardDef } from '../engine/types'
import { getActiveState } from '../engine/types'
import { GameCard } from './GameCard'
import { CardListModal } from './game/CardListModal'
import { getEffectiveProductions } from './game/cardHelpers'
import './DiscardPile.css'

interface DiscardPileProps {
  discard: string[]
  instances: Record<string, CardInstance>
  defs: Record<number, CardDef>
}

export function DiscardPile({ discard, instances, defs }: DiscardPileProps) {
  const [open, setOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const topUid = discard[discard.length - 1] // last discarded = top of pile
  const topInst = topUid ? instances[topUid] : null

  const discardForModal = [...discard]
    .reverse()
    .map(uid => instances[uid])
    .filter(Boolean) as import('../engine/types').CardInstance[]

  if (discard.length === 0)
    return (
      <div className="dp-col">
        <div className="dp-header">
          <span className="dp-title">Défausse</span>
          <span className="dp-count">0</span>
        </div>
        <div className="dp-empty">Vide</div>
      </div>
    )

  return (
    <div className="dp-col">
      <div className="dp-header">
        <span className="dp-title">Défausse</span>
        <div className="dp-header-btns">
          <button onClick={() => setModalOpen(true)} className="btn-view-all">
            ⊞ Voir tout
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
            activated={[]}
            isInTableau={false}
            style={{ width: '100%' }}
          />
        </div>
      )}

      {/* Full list — most recent first */}
      {open && discard.length > 1 && (
        <div className="dp-list">
          <div className="dp-list-label">Toutes les cartes</div>
          {[...discard].reverse().map((uid, i) => {
            const inst = instances[uid]
            if (!inst) return null
            const cs = getActiveState(inst, defs)
            const prod = getEffectiveProductions(cs, inst)
            const glory = cs.glory ?? 0
            return (
              <div
                key={`${uid}-${i}`}
                className="dp-row"
                style={{ animationDelay: `${Math.min(i * 15, 200)}ms` }}
              >
                <span className="dp-row-id">#{inst.deckEntryId}</span>
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
                    <span className={`dp-row-glory ${glory < 0 ? 'dp-row-glory--neg' : 'dp-row-glory--pos'}`}>
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
          title="Défausse"
          subtitle={`${discard.length} carte${discard.length > 1 ? 's' : ''} — plus récente en premier`}
          cards={discardForModal}
          defs={defs}
          onClose={() => setModalOpen(false)}
          emptyText="La défausse est vide"
        />
      )}
    </div>
  )
}
