import { useRef, useEffect } from 'react'
import type { GameEvent, Resources } from '../engine/types'
import './EventLog.css'

interface EventLogProps {
  events: GameEvent[]
}

export function EventLog({ events }: EventLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events.length])

  return (
    <div className="el-root">
      <div className="el-scroll">
        {events.map((evt, i) => {
          const meta = formatEvent(evt)
          return (
            <div
              key={i}
              className="el-entry"
              style={{ borderLeft: `2px solid ${meta.color}33` }}
            >
              <span className="el-index">{i + 1}</span>
              <span className="el-dot" style={{ background: meta.color }} />
              <span className="el-label" style={{ color: meta.color }}>
                {meta.label}
              </span>
              {meta.detail && (
                <span className="el-detail">{meta.detail}</span>
              )}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

// ── Event formatters ──────────────────────────────────────────────────────────

function res(r: Resources): string {
  return Object.entries(r)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${v} ${k}`)
    .join(', ')
}

const COLORS: Record<string, string> = {
  GAME_STARTED: '#c9963a',
  ROUND_STARTED: '#c9963a',
  ROUND_ENDED: '#8a6420',
  TURN_STARTED: '#7a9a7a',
  TURN_ENDED: '#6a7a6a',
  CARD_ACTIVATED: '#c9963a',
  ACTION_RESOLVED: '#a0c0e0',
  UPGRADE_RESOLVED: '#d4832a',
  UPGRADE_CARD_EFFECT: '#d4832a',
  PROGRESSED: '#8a9a8a',
  CARD_BLOCKED: '#c04040',
  CARD_UNBLOCKED: '#40a040',
  CARD_DESTROYED: '#c04040',
  CARD_DISCOVERED: '#c9963a',
  CARD_STATE_CHOSEN: '#c9963a',
  CARD_PLAYED_FROM_DISCARD: '#a0c0e0',
  CARD_ADDED_TO_DECK: '#8a9a8a',
  VIGNETTE_ADDED: '#c0a8e8',
  TRACK_ADVANCED: '#90c890',
  CHOICE_MADE: '#a0a0c0',
}

function formatEvent(evt: GameEvent): { label: string; detail?: string; color: string } {
  const color = COLORS[evt.type] ?? '#8a8478'
  const p = evt.payload as any

  switch (evt.type) {
    case 'GAME_STARTED':
      return { label: 'Partie démarrée', detail: `${p.deckSize ?? '?'} cartes`, color }

    case 'ROUND_STARTED':
      return {
        label: `Manche ${p.round}`,
        detail: p.addedCardUids?.length ? `+${p.addedCardUids.length} découverte(s)` : undefined,
        color,
      }

    case 'ROUND_ENDED':
      return { label: 'Manche terminée', color }

    case 'TURN_STARTED':
      return {
        label: `Tour ${p.turn}`,
        detail: `Pioche : ${p.drawnUids?.length ?? 0} cartes`,
        color,
      }

    case 'TURN_ENDED':
      return { label: 'Fin de tour', detail: p.reason, color }

    case 'CARD_ACTIVATED': {
      const gained = p.resourcesGained ? res(p.resourcesGained as Resources) : ''
      const discarded = p.discardedUid ? ' → défausse' : ''
      return {
        label: 'Production',
        detail: gained ? `${gained}${discarded}` : discarded || undefined,
        color,
      }
    }

    case 'ACTION_RESOLVED': {
      const gained = p.resourcesGained ? res(p.resourcesGained as Resources) : ''
      return { label: 'Action', detail: gained ? `+${gained}` : p.actionId, color }
    }

    case 'UPGRADE_RESOLVED':
    case 'UPGRADE_CARD_EFFECT':
      return { label: 'Amélioration', detail: `→ état ${p.toStateId}`, color }

    case 'PROGRESSED':
      return { label: 'Progression', detail: `+${p.drawnUids?.length ?? 2} cartes`, color }

    case 'CARD_BLOCKED':
      return { label: 'Carte bloquée', color }

    case 'CARD_UNBLOCKED':
      return { label: 'Carte débloquée', color }

    case 'CARD_DESTROYED':
      return { label: 'Carte détruite', color }

    case 'CARD_DISCOVERED':
      return { label: 'Découverte', color }

    case 'CARD_STATE_CHOSEN':
      return { label: 'État choisi', detail: `état ${p.chosenStateId}`, color }

    case 'CARD_PLAYED_FROM_DISCARD':
      return { label: 'Depuis défausse', color }

    case 'CARD_ADDED_TO_DECK':
      return { label: 'Ajout pioche', color }

    case 'VIGNETTE_ADDED':
      return { label: 'Vignette', detail: `#${p.vignetteNumber}`, color }

    case 'TRACK_ADVANCED':
      return { label: 'Piste', detail: `étape ${p.newProgress}`, color }

    case 'CHOICE_MADE':
      return { label: 'Choix', color }

    default:
      return { label: evt.type.replace(/_/g, ' ').toLowerCase(), color }
  }
}
