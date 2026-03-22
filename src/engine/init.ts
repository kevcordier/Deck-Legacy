import type { CardDef, CardInstance, GameEvent, VignetteDef, VignetteStock } from './types'
import cardsData from '../data/cards.json'
import deckData from '../data/deck.json'
import vignettesData from '../data/vignettes.json'

// ─── Chargement ───────────────────────────────────────────────────────────────

export function loadCardDefs(): Record<number, CardDef> {
  const defs: Record<number, CardDef> = {}
  for (const card of cardsData.cards as unknown as CardDef[]) {
    defs[card.id] = card
  }
  return defs
}

// Entrée du deck de départ (id unique + cardId)
export type DeckEntry = { id: number; cardId: number }

export function loadVignetteDefs(): Record<number, VignetteDef> {
  const defs: Record<number, VignetteDef> = {}
  for (const v of vignettesData.vignettes as unknown as VignetteDef[]) {
    defs[v.number] = v
  }
  return defs
}

export function loadInitialVignetteStock(): VignetteStock {
  return vignettesData.globalStock as unknown as VignetteStock
}

// ─── UID ──────────────────────────────────────────────────────────────────────

let uidCounter = 0
export function generateUid(cardId: number, stateId: number): string {
  return `c${cardId}s${stateId}_${++uidCounter}_${Math.random().toString(36).slice(2, 5)}`
}
export function resetUidCounter(): void {
  uidCounter = 0
}

// ─── Création d'instance ─────────────────────────────────────────────────────

export function createInstance(
  cardId: number,
  stateId: number,
  defs: Record<number, CardDef>,
): CardInstance {
  const def = defs[cardId]
  if (!def) throw new Error(`Card def not found: ${cardId}`)
  const state = def.states.find(s => s.id === stateId)
  if (!state) throw new Error(`State ${stateId} not found on card ${cardId}`)
  return {
    uid: generateUid(cardId, stateId),
    cardId,
    stateId,
    vignettes: [],
    blockedBy: null,
    trackProgress: null,
    tags: [],
  }
}

// ─── Mélange Fisher-Yates ─────────────────────────────────────────────────────

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── GAME_STARTED ─────────────────────────────────────────────────────────────

export function buildGameStartedEvent(defs: Record<number, CardDef>): {
  event: GameEvent
  starterInstances: CardInstance[]
  discoveryInstances: CardInstance[]
} {
  resetUidCounter()

  // Deck de départ : les 10 premières entrées de deck.json (par ordre d'id)
  const starterInstances: CardInstance[] = (deckData.deck as { id: number; cardId: number }[])
    .sort((a, b) => a.id - b.id)
    .slice(0, 10)
    .map(entry => ({
      ...createInstance(entry.cardId, defs[entry.cardId].states[0].id, defs),
      deckEntryId: entry.id,
    }))

  // Pile découverte : entrées deck.json avec id > 10, mélangées
  const discoveryInstances: CardInstance[] = shuffle(
    (deckData.deck as { id: number; cardId: number }[])
      .filter(e => e.id > 10)
      .sort((a, b) => a.id - b.id)
      .map(e => ({
        ...createInstance(e.cardId, defs[e.cardId].states[0].id, defs),
        deckEntryId: e.id,
      })),
  )

  return {
    event: {
      type: 'GAME_STARTED',
      payload: {
        initialInstances: starterInstances,
        discoveryInstances,
        vignetteStock: loadInitialVignetteStock(),
      },
    },
    starterInstances,
    discoveryInstances,
  }
}

// ─── ROUND_STARTED ───────────────────────────────────────────────────────────

export function buildRoundStartedEvent(
  round: number,
  deckUids: string[],
  discardUids: string[],
  currentPermanents: string[],
  addedCardUids: string[],
  instances: Record<string, CardInstance>,
  defs: Record<number, CardDef>,
): GameEvent {
  const newPermanents: string[] = []
  const newDeckCards: string[] = []

  for (const uid of addedCardUids) {
    const inst = instances[uid]
    if (defs[inst.cardId]?.permanent) newPermanents.push(uid)
    else newDeckCards.push(uid)
  }

  const allDeckUids = shuffle([...deckUids, ...discardUids, ...newDeckCards])

  return {
    type: 'ROUND_STARTED',
    payload: {
      round,
      addedCards: addedCardUids.map(uid => instances[uid]),
      permanentUids: [...currentPermanents, ...newPermanents],
      deckUids: allDeckUids,
    },
  }
}

// ─── TURN_STARTED ────────────────────────────────────────────────────────────

export function buildTurnStartedEvent(turn: number, deck: string[], count: number = 4): GameEvent {
  const toDraw = Math.min(count, deck.length)
  const drawnUids = deck.slice(0, toDraw)
  const remainingDeck = deck.slice(toDraw)
  return { type: 'TURN_STARTED', payload: { turn, drawnUids, remainingDeck } }
}

// ─── TURN_ENDED ──────────────────────────────────────────────────────────────

export function buildTurnEndedEvent(
  tableau: string[],
  instances: Record<string, CardInstance>,
  defs: Record<number, CardDef>,
  reason: import('./types').TurnEndReason,
): GameEvent {
  const persistedUids = tableau.filter(uid => {
    const inst = instances[uid]
    if (!inst) return false
    const state = defs[inst.cardId]?.states.find(s => s.id === inst.stateId)
    const fromState = state?.stayInPlay ?? false
    const fromVignette = inst.vignettes.some(
      v => v.effect.type === 'add_passive_effect' && (v.effect as any).effectId === 'reste_en_jeu',
    )
    return fromState || fromVignette
  })
  const discardedUids = tableau.filter(uid => !persistedUids.includes(uid))
  return { type: 'TURN_ENDED', payload: { reason, discardedUids, persistedUids } }
}

// ─── TRACK_ADVANCED ──────────────────────────────────────────────────────────

export function buildTrackAdvancedEvent(
  cardUid: string,
  currentProgress: number | null,
  stepsToAdvance: number,
  defs: Record<number, CardDef>,
  instances: Record<string, CardInstance>,
): GameEvent | null {
  const instance = instances[cardUid]
  const def = defs[instance.cardId]
  const state = def?.states.find(s => s.id === instance.stateId)
  if (!state?.track) return null

  const maxStep = state.track.steps.length - 1
  const fromStep = currentProgress
  const toStep = Math.min((fromStep ?? -1) + stepsToAdvance, maxStep)
  if (toStep === fromStep) return null

  const startIdx = (fromStep ?? -1) + 1
  const rewards = state.track.steps
    .filter(s => s.index >= startIdx && s.index <= toStep)
    .map(s => s.reward)

  return {
    type: 'TRACK_ADVANCED',
    payload: {
      cardUid,
      fromStep,
      toStep,
      stepsAdvanced: toStep - (fromStep ?? -1),
      rewards,
    },
  }
}
