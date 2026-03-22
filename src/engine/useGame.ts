import { useState, useCallback, useMemo, useEffect } from 'react'
import type { GameState, GameEvent, CardDef, VignetteDef, Resources } from './types'
import { reducer, EMPTY_STATE, replayEvents } from './reducer'
import { saveGame, loadSave, deleteSave, hasSave } from './persistence'
import {
  loadCardDefs, loadVignetteDefs, buildGameStartedEvent,
  buildRoundStartedEvent, buildTurnStartedEvent, buildTurnEndedEvent,
  buildTrackAdvancedEvent, createInstance,
} from './init'
import { getActiveState, canAffordCost, computeScore, mergeResources } from './types'

export type GameHook = {
  state: GameState
  events: GameEvent[]
  defs: Record<number, CardDef>
  vignetteDefs: Record<number, VignetteDef>
  score: number
  canDiscardTopCard: boolean
  hasSave: boolean
  loadGame: () => void
  deleteSave: () => void
  startGame: () => void
  startRound: () => void
  startTurn: () => void
  activateCard: (cardUid: string, chosenResource?: Resources) => void
  resolveAction: (actionCardUid: string, actionId: string) => void
  resolveUpgrade: (cardUid: string, chosenUpgradeTo?: number) => void
  progress: () => void
  endTurnVoluntary: () => void
  discardTopCard: () => void
  resolveChoice: (chosenCardIds: number[]) => void
  resolvePlayFromDiscard: (chosenUids: string[]) => void
  resolveResourceChoice: (chosen: Resources) => void
  resolveCopyProduction: (targetUid: string) => void
  resolveChooseState: (chosenStateId: number) => void
  resolveBlockCard: (targetUid: string) => void
  currentTurnStartIndex: number
  rewindToEvent: (index: number) => void
}

export function useGame(): GameHook {
  const defs = useMemo(() => loadCardDefs(), [])
  const vignetteDefs = useMemo(() => loadVignetteDefs(), [])

  const [events, setEvents] = useState<GameEvent[]>([])
  const [liveState, setLiveState] = useState<GameState>(EMPTY_STATE)
  // Auto-save après chaque événement
  useEffect(() => {
    if (events.length > 0) {
      saveGame(events, liveState)
    }
  }, [events.length])  // eslint-disable-line react-hooks/exhaustive-deps

  const state = liveState

  const score = useMemo(() => computeScore(state, defs), [state, defs])

  const canDiscardTopCard = useMemo(() => {
    const inPlay = [...state.tableau, ...state.permanents]
    return inPlay.some(uid => {
      const inst = state.instances[uid]
      if (!inst) return false
      const cs = getActiveState(inst, defs)
      return (cs.passives ?? (cs as any).passifs ?? []).some(
        (p: any) => p.effects?.some((e: any) => e.type === 'can_discard_top_card')
      )
    })
  }, [state, defs])

  const dispatch = useCallback((event: GameEvent) => {
    setLiveState(prev => {
      const next = reducer(prev, event, defs, vignetteDefs)
      return next
    })
    setEvents(prev => [...prev, event])
  }, [defs, vignetteDefs])

  const loadGame = useCallback(() => {
    const save = loadSave()
    if (!save || save.events.length === 0) return
    const restored = replayEvents(save.events, defs, vignetteDefs)
    setEvents(save.events)
    setLiveState(restored)
  }, [defs, vignetteDefs])

  const deleteSaveCallback = useCallback(() => {
    deleteSave()
    setEvents([])
    setLiveState(EMPTY_STATE)
  }, [])

  const startGame = useCallback(() => {
    const { event } = buildGameStartedEvent(defs)
    const newState = reducer(EMPTY_STATE, event, defs, vignetteDefs)
    setLiveState(newState)
    setEvents([event])
  }, [defs, vignetteDefs])

  const startRound = useCallback(() => {
    const isFirstRound = liveState.round === 0
    // Toujours en ordre ascendant de deckEntryId
    const addedCardUids = !isFirstRound
      ? [...liveState.discoveryPile]
        .sort((a, b) => {
          const idA = liveState.instances[a]?.deckEntryId ?? 9999
          const idB = liveState.instances[b]?.deckEntryId ?? 9999
          return idA - idB
        })
        .slice(0, 2)
      : []
    const roundEvent = buildRoundStartedEvent(
      liveState.round + 1,
      liveState.deck,
      liveState.discard,
      liveState.permanents,
      addedCardUids,
      liveState.instances,
      defs,
    )
    dispatch(roundEvent)

    // Pioche automatique : calculer le nouveau state après ROUND_STARTED
    const stateAfterRound = reducer(liveState, roundEvent, defs, vignetteDefs)
    // Les cartes "reste_en_jeu" persistées sont déjà dans stateAfterRound.tableau
    const turnEvent = buildTurnStartedEvent(
      stateAfterRound.turn + 1,
      stateAfterRound.deck,
    )
    dispatch(turnEvent)
  }, [liveState, defs, vignetteDefs, dispatch])

  // Vérifie et déclenche les on_play triggers pour les cartes nouvellement ajoutées au tableau
  const checkOnPlayTriggers = useCallback((newUids: string[], currentState: GameState) => {
    for (const uid of newUids) {
      const inst = currentState.instances[uid]
      if (!inst) continue
      const cs = getActiveState(inst, defs)
      const triggers = (cs.actions ?? []).filter(a => a.trigger === 'on_play')
      for (const action of triggers) {
        for (const effect of action.effects) {
          if (effect.type === 'block_card') {
            // Trouver candidats : cartes au tableau avec les productions demandées
            const candidates = currentState.tableau.filter(tuid => {
              if (tuid === uid) return false
              const tinst = currentState.instances[tuid]
              if (!tinst) return false
              const tcs = getActiveState(tinst, defs)
              const produces = effect.produces ?? []
              if (produces.length === 0) return true
              const cardResources = Object.keys(tcs.resources?.[0] ?? {})
              return produces.some((r: string) => cardResources.includes(r))
            })
            if (candidates.length === 0) continue  // aucune cible → skip
            if (action.optional === false) {
              // Forcer le choix
              const choice: import('./types').PendingChoice = {
                kind: 'block_card',
                blockerUid: uid,
                candidates,
                actionLabel: action.label,
              }
              setLiveState(prev => ({ ...prev, pendingChoice: choice }))
            }
          }
        }
      }
    }
  }, [defs])

  const startTurn = useCallback(() => {
    const event = buildTurnStartedEvent(liveState.turn + 1, liveState.deck)
    dispatch(event)
    // Déclencher on_play pour les nouvelles cartes piochées
    const newState = reducer(liveState, event, defs, vignetteDefs)
    checkOnPlayTriggers((event.payload as { drawnUids: string[] }).drawnUids, newState)
  }, [liveState, defs, vignetteDefs, dispatch, checkOnPlayTriggers])

  const activateCard = useCallback((cardUid: string, chosenResource?: Resources) => {
    const instance = liveState.instances[cardUid]
    if (!instance || instance.blockedBy) return
    if (liveState.activated.includes(cardUid)) return
    const cs = getActiveState(instance, defs)

    // resources avec N > 1 options = le joueur doit choisir
    if ((cs.resources?.length ?? 0) > 1) {
      if (chosenResource === undefined) {
        setLiveState(prev => ({
          ...prev,
          pendingChoice: {
            kind: 'choose_resource',
            source: 'activation',
            cardUid,
            options: cs.resources!,
          },
        }))
        return
      }
      dispatch({ type: 'CARD_ACTIVATED', payload: { cardUid, resourcesGained: chosenResource } })
      return
    }

    // Calcul des bonus passifs (ex: +1 gold par Person en jeu)
    const passiveBonus = (cs.passives ?? cs.passifs ?? []).reduce<Resources>((acc, passive) => {
      for (const eff of passive.effects) {
        if (eff.type === 'increase_production') {
          const zones = eff.card_scope === 'in_play'
            ? [...liveState.tableau, ...liveState.permanents]
            : (liveState[eff.card_scope as 'tableau' | 'deck' | 'discard'] as string[])
          const count = zones.filter(uid => {
            const inst = liveState.instances[uid]
            if (!inst) return false
            const s = getActiveState(inst, defs)
            return !eff.tags || eff.tags.every((t: string) => s.tags.includes(t))
          }).length
          acc = mergeResources(acc, { [eff.resource]: eff.amount_per_card * count })
        }
      }
      return acc
    }, {})

    const baseResources = (cs.resources ?? cs.productions ?? cs.production)?.[0] ?? {}
    const totalResources = mergeResources(baseResources, passiveBonus)

    const isPermanent = liveState.permanents.includes(cardUid)
    dispatch({
      type: 'CARD_ACTIVATED',
      payload: {
        cardUid,
        resourcesGained: totalResources,
        discardedUid: isPermanent ? undefined : cardUid,
      },
    })
  }, [liveState, defs, dispatch])

  const resolveAction = useCallback((actionCardUid: string, actionId: string) => {
    const instance = liveState.instances[actionCardUid]
    if (!instance || instance.blockedBy) return
    const cs = getActiveState(instance, defs)
    const action = cs.actions?.find(a => a.label === actionId)
    if (!action) return
    if (action.cost && !canAffordCost(liveState.resources, action.cost)) return

    const isPermanent = (uid: string) => liveState.permanents.includes(uid)
    const allInvolved = [...liveState.activated, actionCardUid]
    const discardedUids = allInvolved.filter(uid => !isPermanent(uid))

    // Compute all immediate resource gains before dispatching
    let resourcesGained: Resources = {}
    let upgradeEffect: { cardUid: string; toStateId: number } | undefined
    const deferredEffects: typeof action.effects = []

    for (const effect of action.effects) {
      if (effect.type === 'add_resources') {
        const choices = effect.resources as any[]
        const cardTargets = choices.filter((r: any) => r.card)
        const resourceOptions = choices.filter((r: any) => !r.card) as Resources[]
        if (cardTargets.length === 0 && resourceOptions.length === 1) {
          resourcesGained = mergeResources(resourcesGained, resourceOptions[0])
          continue
        }
      }
      if (effect.type === 'add_resource' && 'amount_per_card' in effect) {
        const zones = (effect as any).card_scope === 'in_play'
          ? [...liveState.tableau, ...liveState.permanents]
          : (liveState[(effect as any).card_scope as 'tableau' | 'deck' | 'discard'] as string[])
        const tags: string[] = (effect as any).tags ?? []
        const count = zones.filter(uid => {
          const inst = liveState.instances[uid]
          if (!inst) return false
          const s = getActiveState(inst, defs)
          return tags.length === 0 || tags.every(t => s.tags.includes(t))
        }).length
        resourcesGained = mergeResources(resourcesGained, { [(effect as any).resource]: (effect as any).amount_per_card * count })
        continue
      }
      if (effect.type === 'upgrade_card') {
        const targetUid = (effect as any).cardId === 'self' ? actionCardUid : null
        if (targetUid) {
          upgradeEffect = { cardUid: targetUid, toStateId: (effect as any).upgradeTo }
        }
        continue
      }
      deferredEffects.push(effect)
    }

    dispatch({
      type: 'ACTION_RESOLVED',
      payload: { activatedUids: liveState.activated, actionCardUid, actionId, cost: action.cost ?? {}, discardedUids, endsTurn: action.endsTurn ?? false, resourcesGained, upgradeEffect },
    })

    // Traiter les effets différés (choices, complex effects)
    for (const effect of deferredEffects) {
      if (effect.type === 'advance_track') {
        const trackEvent = buildTrackAdvancedEvent(actionCardUid, instance.trackProgress, effect.steps, defs, liveState.instances)
        if (trackEvent) dispatch(trackEvent)
      }
      if (effect.type === 'add_resource' && Array.isArray((effect as any).resource)) {
        setLiveState(prev => ({
          ...prev,
          pendingChoice: {
            kind: 'choose_resource',
            source: 'action',
            cardUid: actionCardUid,
            options: (effect.resource as string[]).map(r => ({ [r]: (effect as any).amount })),
          },
        }))
        continue
      }
      if (effect.type === 'add_resource' && 'amount_per_card' in effect) {
        const zones = (effect as any).card_scope === 'in_play'
          ? [...liveState.tableau, ...liveState.permanents]
          : (liveState[(effect as any).card_scope as 'tableau' | 'deck' | 'discard'] as string[])
        const tags: string[] = (effect as any).tags ?? []
        const count = zones.filter(uid => {
          const inst = liveState.instances[uid]
          if (!inst) return false
          const s = getActiveState(inst, defs)
          return tags.length === 0 || tags.every(t => s.tags.includes(t))
        }).length
        setLiveState(prev => ({
          ...prev,
          resources: mergeResources(prev.resources, { [(effect as any).resource]: (effect as any).amount_per_card * count }),
        }))
        continue
      }
      if (effect.type === 'add_resources') {
        const choices = effect.resources as any[]
        const cardTargets = choices.filter((r: any) => r.card)
        const resourceOptions = choices.filter((r: any) => !r.card) as Resources[]

        if (cardTargets.length > 0) {
          // copy_production : le joueur cible une carte
          const scope = cardTargets[0].card.card_scope ?? 'in_play'
          const tags = cardTargets[0].card.tags as string[] | undefined
          const zoneUids = scope === 'in_play'
            ? [...liveState.tableau, ...liveState.permanents]
            : scope === 'discard' ? liveState.discard : liveState.tableau
          const candidates = tags
            ? zoneUids.filter(uid => {
              const inst = liveState.instances[uid]
              if (!inst) return false
              const cs = getActiveState(inst, defs)
              return tags.every((t: string) => cs.tags.includes(t))
            })
            : zoneUids
          setLiveState(prev => ({
            ...prev,
            pendingChoice: { kind: 'copy_production', actionCardUid, candidates },
          }))
        } else if (resourceOptions.length > 0) {
          // choose_resource : le joueur choisit 1 option parmi la liste
          setLiveState(prev => ({
            ...prev,
            pendingChoice: { kind: 'choose_resource', source: 'action', cardUid: actionCardUid, options: resourceOptions },
          }))
        }
        continue
      }

      if (effect.type === 'play_from_discard') {
        // Filtrer la défausse par tags si spécifiés
        const candidates = liveState.discard.filter(uid => {
          if (!effect.tags || effect.tags.length === 0) return true
          const inst = liveState.instances[uid]
          if (!inst) return false
          const cs = getActiveState(inst, defs)
          return effect.tags.some((tag: string) => cs.tags.includes(tag))
        })
        setLiveState(prev => ({
          ...prev,
          pendingChoice: {
            kind: 'play_from_discard',
            actionCardUid,
            candidates,
            pickCount: effect.number,
          },
        }))
      }
      if (effect.type === 'discover_card') {
        // Mettre en attente la sélection du joueur
        dispatch({
          type: 'PENDING_CHOICE' as any,
          payload: {},
        } as any)
        setLiveState(prev => ({
          ...prev,
          pendingChoice: {
            actionCardUid,
            actionLabel: action.label,
            kind: 'discover_card',
            candidates: effect.cards,
            pickCount: effect.number,
          },
        }))
      }
    }

    if (action.endsTurn) {
      const newTableau = liveState.tableau.filter(uid => !discardedUids.includes(uid))
      const endEvt = buildTurnEndedEvent(newTableau, liveState.instances, defs, 'action')
      dispatch(endEvt)
      const stateAfterTurn = reducer(liveState, endEvt, defs, vignetteDefs)
      if (stateAfterTurn.deck.length > 0) {
        dispatch(buildTurnStartedEvent(stateAfterTurn.turn + 1, stateAfterTurn.deck))
      }
    }
  }, [liveState, defs, dispatch])

  const resolveUpgrade = useCallback((cardUid: string, chosenUpgradeTo?: number) => {
    const instance = liveState.instances[cardUid]
    if (!instance || instance.blockedBy) return
    const cs = getActiveState(instance, defs)
    if (!cs.upgrade || cs.upgrade.length === 0) return

    // N > 1 options = choix multiple → demander sélection si pas encore choisie
    if (cs.upgrade.length > 1) {
      if (chosenUpgradeTo === undefined) {
        setLiveState(prev => ({
          ...prev,
          pendingChoice: { kind: 'choose_upgrade', cardUid, options: cs.upgrade as any[] },
        }))
        return
      }
      const chosen = cs.upgrade.find(u => u.upgradeTo === chosenUpgradeTo)
      if (!chosen || !canAffordCost(liveState.resources, chosen.cost)) return
      // Continuer avec le choix sélectionné
      const isPermanent = (uid: string) => liveState.permanents.includes(uid)
      const allInvolved = [...liveState.activated, cardUid]
      const discardedUids = allInvolved.filter(uid => !isPermanent(uid) && uid !== cardUid)
      dispatch({ type: 'UPGRADE_RESOLVED', payload: { activatedUids: liveState.activated, cardUid, fromStateId: instance.stateId, toStateId: chosenUpgradeTo, cost: chosen.cost, discardedUids } })
      const newTableau = liveState.tableau.filter(uid => !discardedUids.includes(uid) && uid !== cardUid)
      dispatch(buildTurnEndedEvent(newTableau, liveState.instances, defs, 'upgrade'))
      return
    }

    const upgrade = cs.upgrade[0]
    if (!canAffordCost(liveState.resources, upgrade.cost)) return

    const isPermanent = (uid: string) => liveState.permanents.includes(uid)
    const allInvolved = [...liveState.activated, cardUid]
    const discardedUids = allInvolved.filter(uid => !isPermanent(uid) && uid !== cardUid)

    dispatch({
      type: 'UPGRADE_RESOLVED',
      payload: {
        activatedUids: liveState.activated,
        cardUid,
        fromStateId: instance.stateId,
        toStateId: upgrade.upgradeTo,
        cost: upgrade.cost,
        discardedUids,
      },
    })

    const newTableau = liveState.tableau.filter(uid => !discardedUids.includes(uid) && uid !== cardUid)
    const endEvt = buildTurnEndedEvent(newTableau, liveState.instances, defs, 'upgrade')
    dispatch(endEvt)
    const stateAfterTurn = reducer(liveState, endEvt, defs, vignetteDefs)
    if (stateAfterTurn.deck.length > 0) {
      dispatch(buildTurnStartedEvent(stateAfterTurn.turn + 1, stateAfterTurn.deck))
    }
  }, [liveState, defs, dispatch])

  const progress = useCallback(() => {
    const { deck } = liveState
    if (deck.length === 0) return
    const count = Math.min(2, deck.length)
    const drawnUids = deck.slice(0, count)
    const remainingDeck = deck.slice(count)
    const event = { type: 'PROGRESSED' as const, payload: { drawnUids, remainingDeck } }
    dispatch(event)
    const newState = reducer(liveState, event, defs, vignetteDefs)
    checkOnPlayTriggers(drawnUids, newState)
  }, [liveState, defs, vignetteDefs, dispatch, checkOnPlayTriggers])

  const resolveChoice = useCallback((chosenCardIds: number[]) => {
    const pending = liveState.pendingChoice
    if (!pending || pending.kind !== 'discover_card') return
    // Créer une instance pour chaque carte choisie et la découvrir
    for (const cardId of chosenCardIds) {
      const def = defs[cardId]
      if (!def) continue
      const instance = createInstance(cardId, def.states[0].id, defs)
      const addedTo = def.permanent ? 'permanents' as const : 'deck_top' as const
      dispatch({ type: 'CARD_DISCOVERED', payload: { instance, addedTo } })
    }
    dispatch({ type: 'CHOICE_MADE', payload: { actionCardUid: pending.actionCardUid, kind: 'discover_card', chosenCardIds } })
  }, [liveState.pendingChoice, defs, dispatch])

  const resolveResourceChoice = useCallback((chosenResource: Resources) => {
    const pending = liveState.pendingChoice
    if (!pending || pending.kind !== 'choose_resource') return
    if (pending.source === 'activation') {
      dispatch({ type: 'CARD_ACTIVATED', payload: { cardUid: pending.cardUid, resourcesGained: chosenResource } })
    } else {
      // source === 'action' : on applique directement les ressources
      setLiveState(prev => ({
        ...prev,
        resources: mergeResources(prev.resources, chosenResource),
        pendingChoice: null,
      }))
      return
    }
    setLiveState(prev => ({ ...prev, pendingChoice: null }))
  }, [liveState.pendingChoice, dispatch])

  const resolveBlockCard = useCallback((targetUid: string) => {
    const pending = liveState.pendingChoice as any
    if (!pending || pending.kind !== 'block_card') return
    dispatch({ type: 'CARD_BLOCKED', payload: { blockerUid: pending.blockerUid, targetUid } })
    setLiveState(prev => ({ ...prev, pendingChoice: null }))
  }, [liveState.pendingChoice, dispatch])

  const resolveCopyProduction = useCallback((targetUid: string) => {
    const pending = liveState.pendingChoice
    if (!pending || pending.kind !== 'copy_production') return
    const targetInst = liveState.instances[targetUid]
    if (!targetInst) return
    const cs = getActiveState(targetInst, defs)
    // Gain resources[0] + vignette resource bonuses
    const baseResources = (cs.resources ?? cs.productions ?? cs.production)?.[0] ?? {}
    const vignetteBonus = targetInst.vignettes.reduce<Resources>((acc, v) => {
      if (v.effect.type === 'resource') return mergeResources(acc, { [v.effect.resource]: v.effect.amount })
      return acc
    }, {})
    const total = mergeResources(baseResources, vignetteBonus)
    setLiveState(prev => ({
      ...prev,
      resources: mergeResources(prev.resources, total),
      pendingChoice: null,
    }))
  }, [liveState.pendingChoice, liveState.instances, defs])

  // resolveChooseState : player picks a state when discovering a chooseState card
  const resolveChooseState = useCallback((chosenStateId: number) => {
    const pending = liveState.pendingChoice
    if (!pending || pending.kind !== 'choose_state') return
    dispatch({
      type: 'CARD_STATE_CHOSEN',
      payload: { instance: pending.instance, chosenStateId, addedTo: pending.addedTo },
    })
  }, [liveState.pendingChoice, dispatch])

  const resolvePlayFromDiscard = useCallback((chosenUids: string[]) => {
    const pending = liveState.pendingChoice
    if (!pending || pending.kind !== 'play_from_discard') return
    for (const uid of chosenUids) {
      dispatch({ type: 'CARD_PLAYED_FROM_DISCARD', payload: { cardUid: uid } })
    }
    setLiveState(prev => ({ ...prev, pendingChoice: null }))
  }, [liveState.pendingChoice, dispatch])


  const discardTopCard = useCallback(() => {
    if (!canDiscardTopCard) return
    if (liveState.deck.length === 0) return
    const cardUid = liveState.deck[0]
    dispatch({ type: 'CARD_DESTROYED', payload: { cardUid, fromZone: 'deck' } })
  }, [canDiscardTopCard, liveState.deck, dispatch])

  const endTurnVoluntary = useCallback(() => {
    const endEvt = buildTurnEndedEvent(liveState.tableau, liveState.instances, defs, 'voluntary')
    dispatch(endEvt)
    const stateAfterTurn = reducer(liveState, endEvt, defs, vignetteDefs)
    if (stateAfterTurn.deck.length > 0) {
      dispatch(buildTurnStartedEvent(stateAfterTurn.turn + 1, stateAfterTurn.deck))
    }
  }, [liveState, defs, vignetteDefs, dispatch])

  // Index de la dernière pioche (TURN_STARTED ou PROGRESSED)
  const currentTurnStartIndex = useMemo(() => {
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].type === 'TURN_STARTED' || events[i].type === 'PROGRESSED') return i
    }
    return -1
  }, [events])

  // Revenir à un événement dans le tour courant et tronquer le log
  const rewindToEvent = useCallback((index: number) => {
    if (currentTurnStartIndex === -1) return
    // Minimum : garder TURN_STARTED (la pioche) — on ne peut pas remonter avant
    const clampedIndex = Math.max(index, currentTurnStartIndex)
    if (clampedIndex >= events.length) return
    const truncated = events.slice(0, clampedIndex + 1)
    const rewound = replayEvents(truncated, defs, vignetteDefs)
    setEvents(truncated)
    setLiveState(rewound)
  }, [events, currentTurnStartIndex, defs, vignetteDefs])


  return {
    state, events, defs, vignetteDefs, score, canDiscardTopCard,
    hasSave: hasSave(), loadGame, deleteSave: deleteSaveCallback,
    startGame, startRound, startTurn, activateCard, resolveAction, resolveUpgrade,
    progress, endTurnVoluntary, discardTopCard, resolveChoice, resolvePlayFromDiscard, resolveResourceChoice,
    resolveCopyProduction, resolveChooseState, resolveBlockCard,
    currentTurnStartIndex, rewindToEvent,
  }
}