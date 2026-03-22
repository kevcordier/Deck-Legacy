import React, { useRef, useEffect } from 'react'
import type { GameEvent } from '../engine/types'
import './HistoryTimeline.css'

interface HistoryTimelineProps {
  events: GameEvent[]
  historyIndex: number
  currentTurnStartIndex: number
  onGoto: (i: number) => void
  onRewind: (i: number) => void
  onLive: () => void
}

const EVENT_META: Record<string, { icon: string; color: string; label: string }> = {
  GAME_STARTED: { icon: '⚑', color: '#c9963a', label: 'Début' },
  ROUND_STARTED: { icon: '◎', color: '#c9963a', label: 'Manche' },
  ROUND_ENDED: { icon: '◉', color: '#8a6420', label: 'Fin manche' },
  TURN_STARTED: { icon: '▶', color: '#7a9a7a', label: 'Tour' },
  TURN_ENDED: { icon: '■', color: '#6a7a6a', label: 'Fin tour' },
  CARD_ACTIVATED: { icon: '⟡', color: '#c9963a', label: 'Prod.' },
  ACTION_RESOLVED: { icon: '⚡', color: '#a0c0e0', label: 'Action' },
  UPGRADE_RESOLVED: { icon: '⬆', color: '#d4832a', label: 'Upgrade' },
  UPGRADE_CARD_EFFECT: { icon: '⬆', color: '#d4832a', label: 'Upgrade' },
  PROGRESSED: { icon: '»', color: '#8a9a8a', label: 'Progrès' },
  CARD_BLOCKED: { icon: '⊘', color: '#c04040', label: 'Bloqué' },
  CARD_UNBLOCKED: { icon: '⊙', color: '#40a040', label: 'Débloqué' },
  CARD_DESTROYED: { icon: '✕', color: '#c04040', label: 'Détruit' },
  CARD_DISCOVERED: { icon: '◈', color: '#c9963a', label: 'Découverte' },
  CARD_STATE_CHOSEN: { icon: '◈', color: '#c9963a', label: 'Découverte' },
  CARD_PLAYED_FROM_DISCARD: { icon: '↑', color: '#a0c0e0', label: 'Depuis défausse' },
  CARD_ADDED_TO_DECK: { icon: '+', color: '#8a9a8a', label: 'Pioche' },
  VIGNETTE_ADDED: { icon: '◆', color: '#c9963a', label: 'Vignette' },
  TRACK_ADVANCED: { icon: '→', color: '#a0c0a0', label: 'Piste' },
  CHOICE_MADE: { icon: '✓', color: '#a0a0c0', label: 'Choix' },
  ON_PLAY_TRIGGERED: { icon: '!', color: '#c04040', label: 'Déclencheur' },
}

export function HistoryTimeline({
  events,
  historyIndex,
  currentTurnStartIndex,
  onGoto,
  onRewind,
  onLive,
}: HistoryTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isLive = historyIndex === -1

  useEffect(() => {
    if (isLive && scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [events.length, isLive])

  if (events.length === 0) return null

  return (
    <div className="ht-root">
      {/* Live button */}
      <button
        onClick={onLive}
        className={`ht-live-btn ${isLive ? 'ht-live-btn--on' : 'ht-live-btn--off'}`}
      >
        <span className={`ht-live-dot ${isLive ? 'ht-live-dot--on' : 'ht-live-dot--off'}`} />
        LIVE
      </button>

      {/* Timeline scroll */}
      <div ref={scrollRef} className="ht-scroll">
        {events.map((event, i) => {
          const meta = EVENT_META[event.type] ?? {
            icon: '●',
            color: 'var(--stone)',
            label: event.type,
          }
          const isCurrent = historyIndex === i
          const isPast = historyIndex !== -1 && i <= historyIndex
          const isSection = event.type === 'ROUND_STARTED' || event.type === 'TURN_STARTED'

          return (
            <React.Fragment key={i}>
              {isSection && i > 0 && <div className="ht-separator" />}
              <EventDot
                index={i}
                meta={meta}
                isCurrent={isCurrent}
                isPast={isPast}
                isInCurrentTurn={i >= currentTurnStartIndex && currentTurnStartIndex !== -1}
                isLive={historyIndex === -1}
                onGoto={onGoto}
                onRewind={onRewind}
              />
            </React.Fragment>
          )
        })}
      </div>

      {/* Position indicator */}
      <div className="ht-position">
        {isLive ? `${events.length} evt` : `${historyIndex + 1} / ${events.length}`}
      </div>
    </div>
  )
}

interface EventDotProps {
  index: number
  meta: { icon: string; color: string; label: string }
  isCurrent: boolean
  isPast: boolean
  isInCurrentTurn: boolean
  isLive: boolean
  onGoto: (i: number) => void
  onRewind: (i: number) => void
}

function EventDot({
  index,
  meta,
  isCurrent,
  isPast,
  isInCurrentTurn,
  isLive,
  onGoto,
  onRewind,
}: EventDotProps) {
  const [hovered, setHovered] = React.useState(false)

  return (
    <div className="ht-dot-wrapper">
      <button
        onClick={() => (isLive ? onGoto(index) : onRewind(index))}
        title={isInCurrentTurn && isLive ? `${meta.label} — clic pour revenir ici` : meta.label}
        className="ht-event-btn"
        style={{
          width: isCurrent ? 28 : 20,
          height: isCurrent ? 28 : 20,
          border: isCurrent
            ? `2px solid ${meta.color}`
            : isInCurrentTurn && isLive
              ? `1px solid ${meta.color}cc`
              : `1px solid ${isPast ? meta.color + '80' : 'rgba(255,255,255,.08)'}`,
          background: isCurrent
            ? `${meta.color}22`
            : isInCurrentTurn && isLive && hovered
              ? `${meta.color}22`
              : isPast
                ? `${meta.color}11`
                : 'rgba(255,255,255,.02)',
          color: isCurrent ? meta.color : isPast ? meta.color + 'aa' : 'rgba(255,255,255,.2)',
          fontSize: isCurrent ? 11 : 9,
          boxShadow: isCurrent ? `0 0 8px ${meta.color}44` : 'none',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && isInCurrentTurn && isLive ? '↩' : meta.icon}
      </button>

      {/* Rewind indicator */}
      {isInCurrentTurn && isLive && hovered && (
        <div
          className="ht-tooltip"
          style={{ border: `1px solid ${meta.color}66`, color: meta.color }}
        >
          Revenir ici
        </div>
      )}
    </div>
  )
}
