// ─── Ressources ──────────────────────────────────────────────────────────────

export type Resources = Record<string, number>

// ─── Effets passifs ───────────────────────────────────────────────────────────

export type PassiveEffect = 'reste_en_jeu'

// ─── Vignettes ────────────────────────────────────────────────────────────────

export type VignetteEffect =
  | { type: 'resource'; resource: string; amount: number }
  | { type: 'glory_points'; amount: number }
  | { type: 'add_passive_effect'; effectId: PassiveEffect }
  | { type: 'add_tag'; tag: string }

export type VignetteDef = {
  number: number
  label: string
  description: string
  max: number
  effect: VignetteEffect
}

export type VignetteStock = Record<number, number>

export type Vignette = {
  vignetteNumber: number
  effect: VignetteEffect
}

// ─── Piste d'avancée ─────────────────────────────────────────────────────────

export type TrackReward =
  | { type: 'resource'; resource: string; amount: number }
  | { type: 'vignette'; vignetteNumber: number }
  | { type: 'glory_points'; amount: number }
  | { type: 'effect'; effectId: string }

export type TrackStep = {
  index: number
  label: string
  reward: TrackReward
}

export type TrackDef = { steps: TrackStep[] }

// ─── Ciblage ─────────────────────────────────────────────────────────────────

export type TargetScope =
  | { scope: 'any' }
  | { scope: 'tableau' }
  | { scope: 'deck' }
  | { scope: 'discard' }
  | { scope: 'permanents' }
  | { scope: 'blocked' }
  | { scope: 'friendly' }
  | { scope: 'tagged'; tag: string; zone?: CardZone | 'all' }

// ─── Coût ────────────────────────────────────────────────────────────────────

export type DestroyTarget =
  | 'self'
  | { cardId: number }
  | { tag: string }

export type Cost = {
  resources?: Resources[]   // toujours un tableau, [0] = coût fixe
  discard?: TargetScope[]
  destroy?: DestroyTarget
}

// ─── Choix de ressource ──────────────────────────────────────────────────────

// Un élément dans un tableau de choix de ressources
export type ResourceChoice =
  | Resources                                           // ex: { gold: 1 }
  | { card: { card_scope: 'in_play' | 'tableau' | 'discard'; tags?: string[] } }

// ─── Effets d'action ─────────────────────────────────────────────────────────

export type ActionEffect =
  | { type: 'advance_track'; steps: number }
  | { type: 'add_to_deck'; cardId: number; position: 'top' | 'bottom' }
  | { type: 'discover'; count: number }
  | { type: 'block'; target: TargetScope }
  | { type: 'destroy'; target: TargetScope }
  | { type: 'add_resource'; resource: string | string[]; amount: number }
  | { type: 'add_resource'; resource: string; amount_per_card: number; card_scope: 'in_play' | 'tableau' | 'deck' | 'discard'; tags?: string[] }
  | { type: 'add_resources'; resources: ResourceChoice[] }
  | { type: 'vignette'; vignetteNumber: number; target?: TargetScope }
  | { type: 'boost_production'; target?: TargetScope }
  | { type: 'discover_card'; number: number; cards: number[] }
  | { type: 'upgrade_card'; cardId: 'self' | number; upgradeTo: number }
  | { type: 'play_from_discard'; number: number; tags?: string[] }
  | { type: 'block_card'; number: number; produces?: string[]; tags?: string[] }

// ─── Définitions ─────────────────────────────────────────────────────────────

export type ActionDef = {
  label: string
  cost?: Cost
  effects: ActionEffect[]
  endsTurn?: boolean
  trigger?: 'on_play'        // se déclenche à l'entrée au tableau
  optional?: boolean          // false = le joueur DOIT choisir une cible (skip si aucune)
}

export type UpgradeDef = {
  cost: Cost
  upgradeTo: number   // id d'un state dans la même carte
}

// ─── Passifs ─────────────────────────────────────────────────────────────────

export type CardPassiveEffect =
  | { type: 'can_discard_top_card' }   // permet de défausser le sommet du deck sans défausser cette carte
  | {
    type: 'increase_production'
    target: 'self'
    resource: string
    amount_per_card: number
    card_scope: 'in_play' | 'tableau' | 'deck' | 'discard'
    tags?: string[]
  }

export type CardPassive = {
  label: string
  effects: CardPassiveEffect[]
}

export type CardState = {
  id: number
  name: string
  tags: string[]
  resources?: Resources[]   // 1 élément = production fixe, N éléments = choix du joueur
  productions?: Resources[]   // alias de resources (même comportement)
  production?: Resources[]   // alias singulier de resources
  glory?: number
  stayInPlay?: boolean
  maxVignettes?: number
  track?: TrackDef
  actions?: ActionDef[]
  upgrade?: UpgradeDef[]   // 1 élément = upgrade unique, N éléments = choix du joueur
  passives?: CardPassive[]
  passifs?: CardPassive[]   // alias français
}

export type CardDef = {
  id: number
  name: string
  permanent?: boolean
  chooseState?: boolean   // le joueur choisit l'état au moment de la découverte
  states: CardState[]
}

// ─── Instance de carte en jeu ─────────────────────────────────────────────────

export type CardInstance = {
  uid: string
  cardId: number
  stateId: number
  deckEntryId?: number   // id dans deck.json (ex: 1..23)
  vignettes: Vignette[]
  blockedBy: string | null
  trackProgress: number | null
  tags: string[]
}

// ─── État du jeu ─────────────────────────────────────────────────────────────

export type GameState = {
  deck: string[]
  tableau: string[]
  discard: string[]
  permanents: string[]
  instances: Record<string, CardInstance>
  resources: Resources
  activated: string[]
  vignetteStock: VignetteStock
  discoveryPile: string[]
  round: number
  turn: number
  gameOver: boolean
  pendingChoice: PendingChoice | null
  lastAddedUids: string[]   // cartes ajoutées au début de la manche courante
}

export type CardZone = 'deck' | 'tableau' | 'discard' | 'permanents'
export type TurnEndReason = 'action' | 'upgrade' | 'voluntary' | 'no_cards'

// ─── Événements ──────────────────────────────────────────────────────────────

export type GameEvent =
  | { type: 'GAME_STARTED'; payload: { initialInstances: CardInstance[]; discoveryInstances: CardInstance[]; vignetteStock: VignetteStock } }
  | { type: 'ROUND_STARTED'; payload: { round: number; addedCards: CardInstance[]; permanentUids: string[]; deckUids: string[] } }
  | { type: 'ROUND_ENDED'; payload: { round: number } }
  | { type: 'TURN_STARTED'; payload: { turn: number; drawnUids: string[]; remainingDeck: string[] } }
  | { type: 'TURN_ENDED'; payload: { reason: TurnEndReason; discardedUids: string[]; persistedUids: string[] } }
  | { type: 'CARD_ACTIVATED'; payload: { cardUid: string; resourcesGained: Resources; discardedUid?: string } }
  | { type: 'ACTION_RESOLVED'; payload: { activatedUids: string[]; actionCardUid: string; actionId: string; cost: Cost; discardedUids: string[]; endsTurn: boolean; resourcesGained: Resources; upgradeEffect?: { cardUid: string; toStateId: number } } }
  | { type: 'UPGRADE_RESOLVED'; payload: { activatedUids: string[]; cardUid: string; fromStateId: number; toStateId: number; cost: Cost; discardedUids: string[] } }
  | { type: 'PROGRESSED'; payload: { drawnUids: string[]; remainingDeck: string[] } }
  | { type: 'CARD_BLOCKED'; payload: { blockerUid: string; targetUid: string } }
  | { type: 'CARD_UNBLOCKED'; payload: { blockerUid: string; targetUid: string } }
  | { type: 'CARD_DESTROYED'; payload: { cardUid: string; fromZone: CardZone } }
  | { type: 'CARD_DISCOVERED'; payload: { instance: CardInstance; addedTo: 'permanents' | 'deck_top' | 'deck_bottom' } }
  | { type: 'CARD_STATE_CHOSEN'; payload: { instance: CardInstance; chosenStateId: number; addedTo: 'permanents' | 'deck_top' | 'deck_bottom' } }
  | { type: 'ON_PLAY_TRIGGERED'; payload: { cardUid: string; actionLabel: string } }
  | { type: 'CARD_ADDED_TO_DECK'; payload: { instance: CardInstance; position: 'top' | 'bottom' } }
  | { type: 'VIGNETTE_ADDED'; payload: { cardUid: string; vignette: Vignette } }
  | { type: 'TRACK_ADVANCED'; payload: { cardUid: string; fromStep: number | null; toStep: number; stepsAdvanced: number; rewards: TrackReward[] } }
  | { type: 'UPGRADE_CARD_EFFECT'; payload: { cardUid: string; toStateId: number } }
  | { type: 'CARD_PLAYED_FROM_DISCARD'; payload: { cardUid: string } }
  | { type: 'CHOICE_MADE'; payload: { kind: 'discover_card'; actionCardUid: string; chosenCardIds: number[] } | { kind: 'choose_upgrade'; cardUid: string; chosenUpgradeTo: number } }

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getActiveState(
  instance: CardInstance,
  defs: Record<number, CardDef>,
): CardState {
  const def = defs[instance.cardId]
  if (!def) throw new Error(`Card def not found: ${instance.cardId}`)
  const state = def.states.find(s => s.id === instance.stateId)
  if (!state) throw new Error(`State ${instance.stateId} not found on card ${instance.cardId}`)
  return state
}

export function getEffectivePassiveEffects(
  instance: CardInstance,
  defs: Record<number, CardDef>,
): PassiveEffect[] {
  const state = getActiveState(instance, defs)
  const fromState: PassiveEffect[] = state.stayInPlay ? ['reste_en_jeu'] : []
  const fromVignettes = instance.vignettes
    .filter(v => v.effect.type === 'add_passive_effect')
    .map(v => (v.effect as { type: 'add_passive_effect'; effectId: PassiveEffect }).effectId)
  return [...new Set([...fromState, ...fromVignettes])]
}

export function hasEffect(
  instance: CardInstance,
  defs: Record<number, CardDef>,
  effect: PassiveEffect,
): boolean {
  return getEffectivePassiveEffects(instance, defs).includes(effect)
}

export function hasTag(instance: CardInstance, tag: string): boolean {
  return instance.tags.includes(tag)
}

export function mergeResources(a: Resources, b: Resources): Resources {
  const result = { ...a }
  for (const [k, v] of Object.entries(b)) {
    result[k] = (result[k] ?? 0) + v
  }
  return result
}

export function canAffordCost(available: Resources, cost: Cost): boolean {
  if (!cost.resources?.[0]) return true
  return Object.entries(cost.resources[0]).every(([k, v]) => (available[k] ?? 0) >= v)
}

export function spendCost(available: Resources, cost: Cost): Resources {
  if (!cost.resources?.[0]) return available
  const result = { ...available }
  for (const [k, v] of Object.entries(cost.resources[0])) {
    result[k] = (result[k] ?? 0) - v
    if (result[k] <= 0) delete result[k]
  }
  return result
}

export function resolveTargets(filter: TargetScope, state: GameState): string[] {
  switch (filter.scope) {
    case 'any':
      return [...state.deck, ...state.discard, ...state.tableau, ...state.permanents]
    case 'tableau': return state.tableau
    case 'deck': return state.deck
    case 'discard': return state.discard
    case 'permanents': return state.permanents
    case 'blocked':
      return [...state.tableau, ...state.permanents]
        .filter(uid => state.instances[uid]?.blockedBy !== null)
    case 'friendly':
      return [...state.tableau, ...state.permanents]
        .filter(uid => !state.instances[uid]?.tags.includes('Enemy'))
    case 'tagged': {
      const pool = !filter.zone || filter.zone === 'all'
        ? [...state.deck, ...state.discard, ...state.tableau, ...state.permanents]
        : (state[filter.zone] as string[])
      return pool.filter(uid => state.instances[uid]?.tags.includes(filter.tag))
    }
  }
}

export function computeScore(state: GameState, defs: Record<number, CardDef>): number {
  const allUids = [...state.deck, ...state.discard, ...state.tableau, ...state.permanents]
  return allUids.reduce((total, uid) => {
    const instance = state.instances[uid]
    if (!instance) return total
    const cs = getActiveState(instance, defs)
    const vignetteGlory = instance.vignettes
      .filter(v => v.effect.type === 'glory_points')
      .reduce((sum, v) => sum + (v.effect as { type: 'glory_points'; amount: number }).amount, 0)
    return total + (cs.glory ?? 0) + vignetteGlory
  }, 0)
}

// ─── Choix en attente (sélection joueur requise) ──────────────────────────────

export type PendingChoice =
  | {
    kind: 'discover_card'
    actionCardUid: string
    actionLabel: string
    candidates: number[]
    pickCount: number
  }
  | {
    kind: 'choose_upgrade'
    cardUid: string
    options: UpgradeDef[]
  }
  | {
    kind: 'play_from_discard'
    actionCardUid: string
    candidates: string[]
    pickCount: number
  }
  | {
    kind: 'choose_resource'
    source: 'activation' | 'action'
    cardUid: string
    options: Resources[]
  }
  | {
    kind: 'choose_state'
    instance: CardInstance        // instance créée mais state pas encore fixé
    addedTo: 'permanents' | 'deck_top' | 'deck_bottom'
    options: CardState[]         // états disponibles au choix
  }
  | {
    kind: 'copy_production'
    actionCardUid: string
    candidates: string[]
  }
  | {
    kind: 'block_card'
    blockerUid: string
    candidates: string[]
    actionLabel: string
  }