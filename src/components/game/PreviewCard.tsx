import type { CardDef, CardState, Resources } from '../../engine/types'
import './PreviewCard.css'

interface PreviewCardProps {
  def: CardDef
  state: CardState
}

export function PreviewCard({ def: _def, state }: PreviewCardProps) {
  const glory = state.glory ?? 0
  const productions = (state.resources ??
    (state as Record<string, unknown>).productions ??
    (state as Record<string, unknown>).production) as Resources[] | undefined
  const prod = productions?.[0] ?? {}

  return (
    <div className="pc-root">
      {/* Header */}
      <div className="pc-header">
        <div className="pc-name">{state.name}</div>
        <div className="pc-tags">
          {state.tags.map(t => (
            <span key={t} className="tag tag--xs">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="pc-body">
        {Object.entries(prod).length > 0 && (
          <div className="pc-prod-list">
            {Object.entries(prod).map(([k, v]) => (
              <span key={k} className={`res res-${k} res--sm`}>
                {v} {k}
              </span>
            ))}
          </div>
        )}

        {glory !== 0 && (
          <div className={`pc-glory ${glory < 0 ? 'pc-glory--neg' : 'pc-glory--pos'}`}>
            {glory > 0 ? '+' : ''}
            {glory} ★
          </div>
        )}

        {state.upgrade && (
          <div className="pc-upgrade-hint">
            {Array.isArray(state.upgrade) ? state.upgrade.length : 1} upgrade disponible
          </div>
        )}
      </div>
    </div>
  )
}
