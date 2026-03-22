import React, { useState } from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — react-dom types available in project
import { createPortal } from 'react-dom'
import type { CardDef, CardInstance } from '../../engine/types'
import { getEffectiveProductions } from './cardHelpers'
import './CardStatePreview.css'

interface CardStatePreviewProps {
  instance: CardInstance
  defs: Record<number, CardDef>
}

export function CardStatePreview({ instance, defs }: CardStatePreviewProps) {
  const [open, setOpen] = useState(false)
  const def = defs[instance.cardId]
  if (!def || def.states.length <= 1) return null

  return (
    <>
      <button
        onClick={e => {
          e.stopPropagation()
          setOpen(true)
        }}
        title="Voir tous les états"
        className="csp-btn"
      >
        ◎ {def.states.length} états
      </button>

      {open && <CardStatesModal instance={instance} def={def} onClose={() => setOpen(false)} />}
    </>
  )
}

function CardStatesModal({
  instance,
  def,
  onClose,
}: {
  instance: CardInstance
  def: CardDef
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState(instance.stateId)

  return createPortal(
    <div className="csp-overlay" onClick={onClose}>
      <div className="csp-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="csp-modal-header">
          <div className="csp-modal-header-row">
            <div>
              <div className="csp-card-name">{def.name}</div>
              <div className="csp-card-meta">
                {def.states.length} états · #{instance.deckEntryId}
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn-close"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="csp-tabs">
            {def.states.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id)}
                className={`csp-tab${activeTab === s.id ? ' csp-tab--active' : ''}`}
              >
                {s.id === instance.stateId && <span className="csp-tab-dot" />}
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {def.states
          .filter(s => s.id === activeTab)
          .map(cs => {
            const prod = getEffectiveProductions(cs, instance)
            const glory = cs.glory ?? 0
            const upgrades = cs.upgrade ?? []
            const actions = cs.actions ?? []
            const passives =
              cs.passives ?? ((cs as Record<string, unknown>).passifs as typeof cs.passives) ?? []
            const isCurrent = cs.id === instance.stateId

            return (
              <div key={cs.id} className="csp-content">
                {/* Current state indicator */}
                {isCurrent && (
                  <div className="csp-current-badge">
                    <span className="csp-current-dot" />
                    État actuel
                  </div>
                )}

                {/* Tags + glory */}
                <div className="csp-tags-row">
                  {cs.tags.map(t => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                  {cs.stayInPlay && (
                    <span className="tag tag-stay-in-play">Reste en jeu</span>
                  )}
                  {glory !== 0 && (
                    <span className={`csp-glory-badge ${glory < 0 ? 'csp-glory-badge--neg' : 'csp-glory-badge--pos'}`}>
                      {glory > 0 ? '+' : ''}
                      {glory} ★ gloire
                    </span>
                  )}
                </div>

                {/* Productions */}
                {Object.keys(prod).length > 0 && (
                  <Row label="Production">
                    <div className="csp-prod-list">
                      {Object.entries(prod).map(([k, v]) => (
                        <span key={k} className={`res res-${k}`}>
                          {v} {k}
                        </span>
                      ))}
                    </div>
                  </Row>
                )}

                {/* Track */}
                {cs.track && (
                  <Row label="Piste d'avancée">
                    <div className="csp-track-list">
                      {cs.track.steps.map(step => {
                        const reached =
                          instance.trackProgress !== null && step.index <= instance.trackProgress
                        const reward = step.reward
                        return (
                          <div
                            key={step.index}
                            className={`csp-track-step ${reached ? 'csp-track-step--done' : 'csp-track-step--pending'}`}
                          >
                            <span className={`csp-track-icon ${reached ? 'csp-track-icon--done' : 'csp-track-icon--pending'}`}>
                              {reached ? '×' : step.index + 1}
                            </span>
                            <span className="csp-track-label">{step.label}</span>
                            <RewardBadge reward={reward} />
                          </div>
                        )
                      })}
                    </div>
                  </Row>
                )}

                {/* Actions */}
                {actions.length > 0 && (
                  <Row label="Actions">
                    <div className="csp-actions-list">
                      {actions.map((action, i) => (
                        <div key={i} className="csp-action-card">
                          <div className="csp-action-label">
                            {action.trigger === 'on_play' && (
                              <span className="csp-action-play-badge">AU JEU</span>
                            )}
                            {action.label}
                          </div>
                          <div className="csp-action-meta">
                            {action.cost?.resources?.[0] && (
                              <span className="csp-action-cost">
                                Coût :{' '}
                                {Object.entries(action.cost.resources[0])
                                  .map(([k, v]) => `${v} ${k}`)
                                  .join(', ')}
                              </span>
                            )}
                            {action.cost?.destroy && (
                              <span className="csp-action-destroy">
                                + détruire{' '}
                                {action.cost.destroy === 'self'
                                  ? 'cette carte'
                                  : String(action.cost.destroy)}
                              </span>
                            )}
                            {action.endsTurn && (
                              <span className="csp-action-end-turn">FIN DE TOUR</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Row>
                )}

                {/* Upgrades */}
                {upgrades.length > 0 && (
                  <Row label="Améliorations">
                    <div className="csp-upgrades-list">
                      {upgrades.map((upg, i) => {
                        const target = def.states.find(s => s.id === upg.upgradeTo)
                        return (
                          <div key={i} className="csp-upgrade-row">
                            <span className="csp-upgrade-arrow">⬆</span>
                            <span className="csp-upgrade-name">
                              → {target?.name ?? `État ${upg.upgradeTo}`}
                            </span>
                            {upg.cost.resources?.[0] && (
                              <span className="csp-upgrade-cost">
                                {Object.entries(upg.cost.resources[0])
                                  .map(([k, v]) => `${v} ${k}`)
                                  .join(', ')}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </Row>
                )}

                {/* Passives */}
                {(passives ?? []).length > 0 && (
                  <Row label="Effets passifs">
                    <div className="csp-passives-list">
                      {(passives ?? []).map((p, i) => (
                        <div key={i} className="csp-passive">
                          {p.label}
                        </div>
                      ))}
                    </div>
                  </Row>
                )}
              </div>
            )
          })}
      </div>
    </div>,
    document.body,
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="csp-row-label">{label}</div>
      {children}
    </div>
  )
}

function RewardBadge({ reward }: { reward: import('../../engine/types').TrackReward }) {
  if (reward.type === 'resource') {
    return (
      <span className={`res res-${reward.resource} res--sm`}>
        {reward.amount} {reward.resource}
      </span>
    )
  }
  if (reward.type === 'glory_points') {
    return <span className="csp-reward-glory">+{reward.amount} ★</span>
  }
  if (reward.type === 'vignette') {
    return <span className="csp-reward-vignette">Vignette #{reward.vignetteNumber}</span>
  }
  return null
}
