import { useState, useRef, useEffect } from 'react'
import { useGame } from '../engine/useGame'
import type { CardInstance } from '../engine/types'
import { GameCard } from './GameCard'
import { ResourceBar } from './ResourceBar'
import { PendingChoiceModal } from './PendingChoiceModal'
import { Section } from './layout/Section'
import { CardRow } from './layout/CardRow'
import { EmptyState } from './layout/EmptyState'
import { PillBtn } from './ui/PillBtn'
import { DeckViewer } from './DeckViewer'
import { DiscardPile } from './DiscardPile'
import { EventLog } from './EventLog'

export function GameBoard() {
  const game = useGame()
  const {
    state: gs,
    events,
    defs,
    score,
    hasSave,
    loadGame,
    deleteSave,
    startGame,
    startRound,
    activateCard,
    resolveAction,
    resolveUpgrade,
    progress,
    endTurnVoluntary,
    currentTurnStartIndex,
    rewindToEvent,
    resolveChoice,
    resolvePlayFromDiscard,
    resolveResourceChoice,
    resolveCopyProduction,
    resolveChooseState,
    resolveBlockCard,
    canDiscardTopCard,
    discardTopCard,
  } = game

  const [logOpen, setLogOpen] = useState(false)
  const [drawnUids, setDrawnUids] = useState<Set<string>>(new Set())
  const [leavingCards, setLeavingCards] = useState<Map<string, { inst: CardInstance; i: number }>>(
    new Map(),
  )
  const prevTableauRef = useRef<string[]>([])
  const prevDiscardRef = useRef<string[]>([])

  useEffect(() => {
    const prevTableau = prevTableauRef.current
    const prevDiscard = prevDiscardRef.current

    const newlyDrawn = gs.tableau.filter(uid => !prevTableau.includes(uid))
    if (newlyDrawn.length > 0) {
      setDrawnUids(new Set(newlyDrawn))
      const t = setTimeout(() => setDrawnUids(new Set()), 500)
      prevTableauRef.current = gs.tableau
      return () => clearTimeout(t)
    }

    const newlyDiscarded = gs.discard.filter(uid => !prevDiscard.includes(uid))
    if (newlyDiscarded.length > 0) {
      const leaving = new Map<string, { inst: CardInstance; i: number }>()
      newlyDiscarded.forEach((uid, i) => {
        const inst = gs.instances[uid]
        if (inst) leaving.set(uid, { inst, i })
      })
      setLeavingCards(leaving)
      const t = setTimeout(() => setLeavingCards(new Map()), 350)
      prevDiscardRef.current = gs.discard
      return () => clearTimeout(t)
    }

    prevTableauRef.current = gs.tableau
    prevDiscardRef.current = gs.discard
  }, [gs.tableau, gs.discard])

  const isGameStarted = gs.round > 0 || gs.deck.length > 0
  const deckEmpty = gs.deck.length === 0
  const canRewind = events.slice(currentTurnStartIndex + 1).length > 0

  type Phase = 'pregame' | 'preround' | 'playing'
  let phase: Phase = 'pregame'
  if (!isGameStarted) phase = 'pregame'
  else if (gs.round === 0) phase = 'preround'
  else if (gs.tableau.length === 0 && deckEmpty) phase = 'preround'
  else phase = 'playing'

  return (
    <div className="gb-root">
      {/* ── Header ── */}
      <header className="gb-header">
        <div className="gb-logo">⚜ Chroniques</div>

        <div className="gb-header-actions">
          {canDiscardTopCard && (
            <PillBtn onClick={discardTopCard} variant="ghost">
              Défausser sommet
            </PillBtn>
          )}
          {phase === 'pregame' && (
            <PillBtn onClick={startGame} variant="gold">
              Nouvelle partie
            </PillBtn>
          )}
          {phase === 'preround' && (
            <PillBtn onClick={startRound} variant="gold">
              {gs.round === 0 ? 'Démarrer' : 'Nouvelle manche'}
            </PillBtn>
          )}
          {phase === 'playing' && (
            <>
              {canRewind && (
                <button
                  className="btn-rewind-header"
                  onClick={() => rewindToEvent(events.length - 2)}
                  title="Annuler la dernière action"
                >
                  ↩
                </button>
              )}
              <PillBtn onClick={progress} disabled={deckEmpty} variant="ghost">
                {`›› Progresser${!deckEmpty ? ` (+${Math.min(2, gs.deck.length)})` : ''}`}
              </PillBtn>
              <PillBtn onClick={endTurnVoluntary} variant="ghost">
                Fin de tour
              </PillBtn>
            </>
          )}
        </div>
      </header>

      {/* ── Resource bar ── */}
      {isGameStarted && (
        <ResourceBar
          resources={gs.resources}
          score={score}
          round={gs.round}
          turn={gs.turn}
          deckSize={gs.deck.length}
          discardSize={gs.discard.length}
        />
      )}

      {/* ── 3-column body ── */}
      <div className="gb-body">
        <div className="gb-sidebar">
          <DeckViewer deck={gs.deck} instances={gs.instances} defs={defs} />
        </div>

        <main className="gb-main">
          {/* Pregame */}
          {phase === 'pregame' && (
            <EmptyState
              title="Chroniques"
              subtitle="Un jeu de construction de deck"
              action={
                <div className="gb-save-actions">
                  {hasSave && (
                    <PillBtn onClick={loadGame} variant="gold" large>
                      ▶ Reprendre la partie
                    </PillBtn>
                  )}
                  <PillBtn onClick={startGame} variant={hasSave ? 'ghost' : 'gold'} large>
                    {hasSave ? '↺ Nouvelle partie' : '⚜ Commencer'}
                  </PillBtn>
                  {hasSave && (
                    <button className="btn-delete-save" onClick={deleteSave}>
                      Supprimer la sauvegarde
                    </button>
                  )}
                </div>
              }
            />
          )}

          {/* Preround — first */}
          {phase === 'preround' && gs.round === 0 && (
            <EmptyState
              title="Prêt à jouer"
              subtitle={`Deck de ${gs.deck.length} cartes mélangées`}
              action={
                <PillBtn onClick={startRound} variant="gold" large>
                  ▶ Démarrer la partie
                </PillBtn>
              }
            />
          )}

          {/* Preround — end of round */}
          {phase === 'preround' && gs.round > 0 && (
            <div className="gb-preround">
              <div className="gb-preround-header">
                <div className="gb-preround-divider" />
                <div className="gb-preround-title">Manche {gs.round} terminée</div>
                <div className="gb-preround-subtitle">
                  2 nouvelles cartes ajoutées à votre pioche
                </div>
              </div>

              {gs.lastAddedUids.length > 0 && (
                <div className="gb-preround-cards">
                  {gs.lastAddedUids.map((uid: string, i: number) => {
                    const inst = gs.instances[uid]
                    if (!inst) return null
                    return (
                      <GameCard
                        key={uid}
                        instance={inst}
                        defs={defs}
                        currentResources={{}}
                        activated={[]}
                        isInTableau={false}
                        animDelay={i * 100}
                      />
                    )
                  })}
                </div>
              )}

              <PillBtn onClick={startRound} variant="gold" large>
                ▶ Nouvelle manche
              </PillBtn>
            </div>
          )}

          {/* Permanentes */}
          {gs.permanents.length > 0 && (
            <Section
              title="Permanentes"
              subtitle={`${gs.permanents.length} carte${gs.permanents.length > 1 ? 's' : ''}`}
            >
              <CardRow>
                {gs.permanents.map((uid, i) => {
                  const inst = gs.instances[uid]
                  if (!inst) return null
                  return (
                    <div
                      key={uid}
                      className={drawnUids.has(uid) ? 'card-draw' : ''}
                      style={{ animationDelay: drawnUids.has(uid) ? `${i * 60}ms` : undefined }}
                    >
                      <GameCard
                        instance={inst}
                        defs={defs}
                        currentResources={gs.resources}
                        activated={gs.activated}
                        isInTableau={true}
                        onActivate={() => activateCard(uid)}
                        onAction={label => resolveAction(uid, label)}
                        onUpgrade={id => resolveUpgrade(uid, id)}
                      />
                    </div>
                  )
                })}
              </CardRow>
            </Section>
          )}

          {/* Tableau */}
          {gs.tableau.length > 0 && (
            <Section
              title="Tableau"
              subtitle={`${gs.tableau.length} carte${gs.tableau.length > 1 ? 's' : ''} · ${gs.activated.length} activée${gs.activated.length > 1 ? 's' : ''}`}
            >
              <CardRow>
                {gs.tableau.map((uid, i) => {
                  const inst = gs.instances[uid]
                  if (!inst) return null
                  return (
                    <div
                      key={uid}
                      className={drawnUids.has(uid) ? 'card-draw' : ''}
                      style={{ animationDelay: drawnUids.has(uid) ? `${i * 60}ms` : undefined }}
                    >
                      <GameCard
                        instance={inst}
                        defs={defs}
                        currentResources={gs.resources}
                        activated={gs.activated}
                        isInTableau={true}
                        onActivate={() => activateCard(uid)}
                        onAction={label => resolveAction(uid, label)}
                        onUpgrade={id => resolveUpgrade(uid, id)}
                      />
                    </div>
                  )
                })}
              </CardRow>
            </Section>
          )}

          {/* Discard exit animations */}
          {leavingCards.size > 0 && (
            <div className="gb-discard-overlay">
              {Array.from(leavingCards.entries()).map(([uid, entry]) => {
                const { inst, i } = entry as { inst: CardInstance; i: number }
                return (
                  <div key={uid} className="card-discard" style={{ animationDelay: `${i * 40}ms` }}>
                    <GameCard
                      instance={inst}
                      defs={defs}
                      currentResources={{}}
                      activated={[]}
                      isInTableau={false}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </main>

        <div className="gb-sidebar gb-sidebar-right">
          <DiscardPile discard={gs.discard} instances={gs.instances} defs={defs} />
        </div>
      </div>

      {/* ── Event log ── */}
      {events.length > 0 && (
        <div className="gb-log-wrapper">
          <button
            className={`gb-log-toggle${logOpen ? ' open' : ''}`}
            onClick={() => setLogOpen(o => !o)}
          >
            <span>Journal — {events.length} événements</span>
            <span className="gb-log-toggle-arrow">{logOpen ? '▼' : '▲'}</span>
          </button>
          {logOpen && (
            <div className="gb-log-body">
              <EventLog events={events} />
            </div>
          )}
        </div>
      )}

      {/* ── Pending choice modal ── */}
      {gs.pendingChoice && (
        <PendingChoiceModal
          choice={gs.pendingChoice}
          defs={defs}
          instances={gs.instances}
          currentResources={gs.resources}
          activated={gs.activated}
          onDiscoverCard={resolveChoice}
          onChooseUpgrade={id =>
            resolveUpgrade(
              gs.pendingChoice!.kind === 'choose_upgrade' ? (gs.pendingChoice as any).cardUid : '',
              id,
            )
          }
          onPlayFromDiscard={resolvePlayFromDiscard}
          onChooseResource={resolveResourceChoice}
          onChooseState={resolveChooseState}
          onCopyProduction={resolveCopyProduction}
          onBlockCard={resolveBlockCard}
        />
      )}
    </div>
  )
}
