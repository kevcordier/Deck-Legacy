import type { PendingChoice, CardDef, Resources } from '../engine/types'
import { GameCard } from './GameCard'
import { ResourceChoice } from './ResourceDisplay'
import './PendingChoiceModal.css'
import './game/PreviewCard.css'

interface PendingChoiceModalProps {
  choice: PendingChoice
  defs: Record<number, CardDef>
  instances: Record<string, import('../engine/types').CardInstance>
  currentResources: Resources
  activated: string[]
  // resolvers
  onDiscoverCard: (ids: number[]) => void
  onChooseUpgrade: (toStateId: number) => void
  onPlayFromDiscard: (uids: string[]) => void
  onChooseResource: (r: Resources) => void
  onChooseState: (stateId: number) => void
  onCopyProduction: (uid: string) => void
  onBlockCard: (uid: string) => void
}

export function PendingChoiceModal({
  choice,
  defs,
  instances,
  currentResources,
  activated,
  onDiscoverCard,
  onChooseUpgrade,
  onPlayFromDiscard,
  onChooseResource,
  onChooseState,
  onCopyProduction,
  onBlockCard,
}: PendingChoiceModalProps) {
  // ── discover_card ──────────────────────────────────────────────────────
  if (choice.kind === 'discover_card') {
    return (
      <div className="pcm-overlay">
        <div className="pcm-panel">
          <div className="pcm-title">Découvrir une carte</div>
          <div className="pcm-subtitle">
            Choisissez {choice.pickCount} carte{choice.pickCount > 1 ? 's' : ''} à découvrir
          </div>
          <div className="pcm-card-grid">
            {choice.candidates.map(cardId => {
              const def = defs[cardId]
              if (!def)
                return (
                  <div
                    key={cardId}
                    className="pcm-card-placeholder"
                    onClick={() => onDiscoverCard([cardId])}
                  >
                    <span className="pcm-placeholder-name">Carte #{cardId}</span>
                    <span className="pcm-placeholder-label">À découvrir</span>
                  </div>
                )
              const state = def.states[0]
              return (
                <div
                  key={cardId}
                  onClick={() => onDiscoverCard([cardId])}
                  className="pcm-card-clickable"
                >
                  <PreviewCard def={def} state={state} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── choose_state ───────────────────────────────────────────────────────
  if (choice.kind === 'choose_state') {
    const def = defs[choice.instance.cardId]
    return (
      <div className="pcm-overlay">
        <div className="pcm-panel">
          <div className="pcm-title">Choisir un état</div>
          <div className="pcm-subtitle">
            Cette carte a deux faces. Choisissez celle que vous voulez jouer.
          </div>
          <div className="pcm-card-grid">
            {choice.options.map(state => (
              <div
                key={state.id}
                onClick={() => onChooseState(state.id)}
                className="pcm-card-clickable"
              >
                <PreviewCard def={def} state={state} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── choose_upgrade ─────────────────────────────────────────────────────
  if (choice.kind === 'choose_upgrade') {
    const instance = instances[choice.cardUid]
    const def = defs[instance?.cardId ?? 0]
    return (
      <div className="pcm-overlay">
        <div className="pcm-panel">
          <div className="pcm-title">Choisir une amélioration</div>
          <div className="pcm-subtitle">Plusieurs chemins sont disponibles pour cette carte.</div>
          <div className="pcm-card-grid">
            {choice.options.map((upg, i) => {
              const targetState = def?.states.find(s => s.id === upg.upgradeTo)
              return (
                <div
                  key={i}
                  onClick={() => onChooseUpgrade(upg.upgradeTo)}
                  style={{ cursor: 'pointer' }}
                >
                  {targetState && <PreviewCard def={def} state={targetState} />}
                  <div className="pcm-upgrade-cost">
                    Coût :{' '}
                    {Object.entries(upg.cost.resources?.[0] ?? {})
                      .map(([k, v]) => `${v} ${k}`)
                      .join(', ') || 'Gratuit'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── choose_resource ────────────────────────────────────────────────────
  if (choice.kind === 'choose_resource') {
    return (
      <div className="pcm-overlay">
        <div className="pcm-panel">
          <div className="pcm-title">Choisir une ressource</div>
          <div className="pcm-subtitle">
            {choice.source === 'activation'
              ? 'Quelle ressource voulez-vous produire ?'
              : 'Quelle ressource voulez-vous gagner ?'}
          </div>
          <ResourceChoice options={choice.options} onSelect={onChooseResource} />
        </div>
      </div>
    )
  }

  // ── play_from_discard ──────────────────────────────────────────────────
  if (choice.kind === 'play_from_discard') {
    return (
      <div className="pcm-overlay">
        <div className="pcm-panel">
          <div className="pcm-title">Jouer depuis la défausse</div>
          <div className="pcm-subtitle">
            Choisissez {choice.pickCount} carte{choice.pickCount > 1 ? 's' : ''} à rejouer depuis
            votre défausse.
          </div>
          <div className="pcm-card-grid">
            {choice.candidates.map(uid => {
              const inst = instances[uid]
              if (!inst) return null
              return (
                <div
                  key={uid}
                  onClick={() => onPlayFromDiscard([uid])}
                  className="pcm-card-clickable"
                >
                  <GameCard
                    instance={inst}
                    defs={defs}
                    currentResources={currentResources}
                    activated={activated}
                    isInTableau={false}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── copy_production ────────────────────────────────────────────────────
  if (choice.kind === 'copy_production') {
    return (
      <div className="pcm-overlay">
        <div className="pcm-panel">
          <div className="pcm-title">Copier une production</div>
          <div className="pcm-subtitle">Choisissez une carte dont vous allez copier la production.</div>
          <div className="pcm-card-grid">
            {choice.candidates.map(uid => {
              const inst = instances[uid]
              if (!inst) return null
              return (
                <div
                  key={uid}
                  onClick={() => onCopyProduction(uid)}
                  className="pcm-card-clickable"
                >
                  <GameCard
                    instance={inst}
                    defs={defs}
                    currentResources={currentResources}
                    activated={activated}
                    isInTableau={false}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── block_card ─────────────────────────────────────────────────────────
  if (choice.kind === 'block_card') {
    return (
      <div className="pcm-overlay">
        <div className="pcm-panel">
          <div className="pcm-title">Bloquer une carte</div>
          <div className="pcm-subtitle">{choice.actionLabel}</div>
          <div className="pcm-card-grid">
            {choice.candidates.map(uid => {
              const inst = instances[uid]
              if (!inst) return null
              return (
                <div
                  key={uid}
                  onClick={() => onBlockCard(uid)}
                  className="pcm-card-clickable"
                >
                  <GameCard
                    instance={inst}
                    defs={defs}
                    currentResources={currentResources}
                    activated={activated}
                    isInTableau={false}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return null
}

// ── Shared preview card ───────────────────────────────────────────────────

function PreviewCard({ def: _def, state }: { def: CardDef; state: import('../engine/types').CardState }) {
  const glory = state.glory ?? 0
  const productions = (state.resources ??
    (state as any).productions ??
    (state as any).production) as Resources[] | undefined
  const prod = productions?.[0] ?? {}

  return (
    <div className="pc-root">
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
            {Array.isArray(state.upgrade) ? state.upgrade.length : 1} upgrade
            {(Array.isArray(state.upgrade) ? state.upgrade.length : 1) > 1 ? 's' : ''} disponible
            {(Array.isArray(state.upgrade) ? state.upgrade.length : 1) > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}
