import type { Resources } from '../engine/types'
import { getResMeta } from './ResourceDisplay'
import './ResourceBar.css'
import '../styles/game.css'

interface ResourceBarProps {
  resources: Resources
  score: number
  round: number
  turn: number
  deckSize: number
  discardSize: number
}

export function ResourceBar({
  resources,
  score,
  round,
  turn,
  deckSize,
  discardSize,
}: ResourceBarProps) {
  const entries = Object.entries(resources).filter(([, v]) => v > 0)

  return (
    <div className="rb-root">
      {/* Round/Turn info */}
      <div className="rb-group">
        <Stat label="Manche" value={round || '—'} />
        <div className="rb-divider" />
        <Stat label="Tour" value={turn || '—'} />
      </div>

      <div className="rb-divider" />

      {/* Resources */}
      <div className="rb-resources">
        {entries.length === 0 ? (
          <span className="rb-empty">Aucune ressource</span>
        ) : (
          entries.map(([k, v]) => {
            const meta = getResMeta(k)
            return (
              <div key={k} className="rb-resource-item">
                <span className="rb-resource-icon">{meta.icon}</span>
                <span className="rb-resource-value">{v}</span>
                <span className="rb-resource-label">{meta.label}</span>
              </div>
            )
          })
        )}
      </div>

      <div className="rb-divider" />

      {/* Deck / Discard */}
      <div className="rb-group">
        <Stat label="Pioche" value={deckSize} color="var(--cream-d)" />
        <Stat label="Défausse" value={discardSize} color="var(--stone)" />
      </div>

      <div className="rb-divider" />

      {/* Score */}
      <div className="rb-score">
        <span className="rb-score-icon">★</span>
        <span className="rb-score-value">{score}</span>
        <span className="rb-score-label">Gloire</span>
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="stat">
      <div className="stat-value" style={color ? { color } : undefined}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
