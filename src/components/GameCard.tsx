import React from 'react'
import type { CardInstance, CardDef, Resources } from '../engine/types'
import { getActiveState, canAffordCost } from '../engine/types'
import { ResourcePill } from './ui/ResourcePill'
import { getResMeta } from './ui/resourceMeta'
import { ResourceList } from './ui/ResourceList'
import { getEffectiveProductions, tagClass } from './game/cardHelpers'
import { CardStatePreview } from './game/CardStatePreview'

interface GameCardProps {
  instance:         CardInstance
  defs:             Record<number, CardDef>
  currentResources: Resources
  activated:        string[]
  isInTableau:      boolean
  onActivate?:      () => void
  onAction?:        (label: string) => void
  onUpgrade?:       (toStateId?: number) => void
  style?:           React.CSSProperties
  animDelay?:       number
}

export function GameCard({
  instance, defs, currentResources, activated,
  isInTableau, onActivate, onAction, onUpgrade,
  style, animDelay = 0,
}: GameCardProps) {
  const cs  = getActiveState(instance, defs)
  const def = defs[instance.cardId]

  const isActivated    = activated.includes(instance.uid)
  const isBlocked      = instance.blockedBy !== null
  const isEnemy        = cs.tags.some(t => t.toLowerCase() === 'enemy' || t.toLowerCase() === 'ennemy')
  const isPermanent    = def.permanent
  const productions    = getEffectiveProductions(cs, instance)
  const hasProductions = Object.keys(productions).length > 0
  const canActivate    = isInTableau && !isActivated && !isBlocked && hasProductions && !!onActivate
  const track          = cs.track
  const progress       = instance.trackProgress
  const upgrades       = cs.upgrade ?? []
  const actions        = cs.actions ?? []
  const glory          = cs.glory ?? 0
  const resourceOptions = (cs.resources ?? (cs as any).productions ?? (cs as any).production) as Resources[] | undefined
  const hasChoice      = (resourceOptions?.length ?? 0) > 1

  const cardCls = [
    'gc',
    isEnemy     ? 'enemy'     : '',
    isBlocked   ? 'blocked'   : '',
    isActivated ? 'activated' : '',
    isPermanent ? 'permanent' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={cardCls}
      style={{ animationDelay: `${animDelay}ms`, ...style }}
    >

      {/* Blocked overlay */}
      {isBlocked && (
        <div className="gc-blocked-overlay">
          <span className="gc-blocked-label">Bloquée</span>
        </div>
      )}

      {/* Activated shimmer */}
      {isActivated && <div className="gc-shimmer" />}

      {/* Header */}
      <div className={`gc-header${isEnemy ? ' enemy' : ''}`}>
        <div className="gc-name-row">
          <span className={`gc-name${isEnemy ? ' enemy' : ''}`}>
            {instance.deckEntryId !== undefined && (
              <span className="gc-deck-id">#{instance.deckEntryId}</span>
            )}
            {cs.name}
          </span>
          {glory !== 0 && (
            <span className={`gc-glory${glory < 0 ? ' negative' : ''}`}>
              {glory > 0 ? '+' : ''}{glory} ★
            </span>
          )}
        </div>

        <div className="gc-tags">
          {cs.tags.map(t => <span key={t} className={tagClass(t)}>{t}</span>)}
          {isPermanent && <span className="tag tag-permanent">Permanent</span>}
          {cs.stayInPlay && !isPermanent && <span className="tag tag-stay-in-play">Reste en jeu</span>}
        </div>

        <CardStatePreview instance={instance} defs={defs} />
      </div>

      {/* Body */}
      <div className="gc-body">

        {/* Productions */}
        {hasProductions && (
          <div>
            <div className="gc-section-label">PRODUCTION</div>
            <div className="gc-prod-row">
              {isInTableau && !isBlocked
                ? Object.entries(productions).filter(([, v]) => v > 0).map(([k, v]) => {
                    const meta = getResMeta(k)
                    return (
                      <button
                        key={k}
                        onClick={onActivate}
                        disabled={isActivated || !canActivate}
                        title={isActivated ? 'Déjà produit' : `Produire — ${v} ${meta.label}`}
                        className={`res ${meta.cls} gc-produce-btn`}
                      >
                        {meta.icon} {v}
                      </button>
                    )
                  })
                : <ResourceList resources={productions} size="sm" />
              }
            </div>
            {hasChoice && <div className="gc-choice-hint">Au choix</div>}
          </div>
        )}

        {/* Track */}
        {track && (
          <div>
            <div className="gc-section-label">PISTE</div>
            <div className="gc-track-row">
              {track.steps.map(step => {
                const done = progress !== null && step.index <= progress
                return (
                  <div
                    key={step.index}
                    title={step.label}
                    className={`gc-track-step${done ? ' done' : ''}`}
                  >
                    {done ? '×' : ''}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Vignettes */}
        {instance.vignettes.length > 0 && (
          <div className="gc-vignettes">
            {instance.vignettes.map((v, i) => {
              const eff = v.effect
              if (eff.type === 'resource')
                return <ResourcePill key={i} resource={eff.resource} amount={eff.amount} size="sm" />
              if (eff.type === 'glory_points')
                return <span key={i} className="gc-vignette-glory">+{eff.amount}★</span>
              return null
            })}
          </div>
        )}
      </div>

      {/* Actions zone */}
      <div className="gc-actions">

        {/* Action buttons */}
        {!isBlocked && actions.map((action, i) => {
          if (action.trigger === 'on_play') return null
          const affordable = !action.cost || canAffordCost(currentResources, action.cost)
          return (
            <button
              key={i}
              onClick={() => onAction?.(action.label)}
              disabled={!affordable}
              title={action.label}
              className="gc-action-btn"
            >
              <span className="gc-action-arrow">›</span>
              {action.label}
              {action.cost?.resources?.[0] && (
                <span className="gc-action-cost">
                  ({Object.entries(action.cost.resources[0]).map(([k, v]) => `${v} ${k}`).join(', ')})
                </span>
              )}
            </button>
          )
        })}

        {/* Upgrade buttons */}
        {!isBlocked && upgrades.map((upg, i) => {
          const affordable   = canAffordCost(currentResources, upg.cost)
          const targetState  = def.states.find(s => s.id === upg.upgradeTo)
          return (
            <button
              key={i}
              onClick={() => onUpgrade?.(upg.upgradeTo)}
              disabled={!affordable}
              className="gc-upgrade-btn"
            >
              ⬆ → {targetState?.name ?? `État ${upg.upgradeTo}`}
              {upg.cost.resources?.[0] && (
                <span className="gc-action-cost">
                  ({Object.entries(upg.cost.resources[0]).map(([k, v]) => `${v} ${k}`).join(', ')})
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}