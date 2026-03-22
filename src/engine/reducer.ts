import type { GameState, GameEvent, CardDef, VignetteDef, Vignette, TrackReward, Resources } from './types'
import { getActiveState, mergeResources, spendCost } from './types'

export const EMPTY_STATE: GameState = {
  deck: [], tableau: [], discard: [], permanents: [],
  instances: {}, resources: {}, activated: [],
  vignetteStock: {}, discoveryPile: [],
  round: 0, turn: 0, gameOver: false, pendingChoice: null, lastAddedUids: [],
}

export function reducer(
  state: GameState,
  event: GameEvent,
  defs: Record<number, CardDef>,
  vignetteDefs: Record<number, VignetteDef>,
): GameState {
  switch (event.type) {

    case 'GAME_STARTED': {
      const { initialInstances, discoveryInstances, vignetteStock } = event.payload
      const instances: Record<string, typeof initialInstances[0]> = {}
      for (const inst of [...initialInstances, ...discoveryInstances]) {
        instances[inst.uid] = inst
      }
      return {
        ...EMPTY_STATE,
        instances,
        deck: initialInstances.map(i => i.uid),
        discoveryPile: discoveryInstances.map(i => i.uid),
        vignetteStock,
      }
    }

    case 'ROUND_STARTED': {
      const { round, addedCards, permanentUids, deckUids } = event.payload
      const newInstances = { ...state.instances }
      for (const inst of addedCards) newInstances[inst.uid] = inst
      return {
        ...state,
        instances: newInstances,
        deck: deckUids,
        discard: [],
        tableau: [],
        permanents: permanentUids,
        resources: {},
        activated: [],
        pendingChoice: null,
        lastAddedUids: addedCards.map(i => i.uid),
        round,
        turn: 0,
      }
    }

    case 'ROUND_ENDED': {
      // Les "reste_en_jeu" du tableau retournent en défausse en fin de manche
      return {
        ...state,
        discard: [...state.discard, ...state.tableau],
        tableau: [],
        resources: {},
        activated: [],
      }
    }

    case 'TURN_STARTED': {
      const { turn, drawnUids, remainingDeck } = event.payload
      return {
        ...state,
        turn,
        deck: remainingDeck,
        tableau: [...state.tableau, ...drawnUids],
        resources: {},
        activated: [],
        lastAddedUids: [],
      }
    }

    case 'TURN_ENDED': {
      const { discardedUids, persistedUids } = event.payload
      return {
        ...state,
        discard: [...state.discard, ...discardedUids],
        tableau: persistedUids,
        resources: {},
        activated: [],
      }
    }

    case 'CARD_ACTIVATED': {
      const { cardUid, resourcesGained, discardedUid } = event.payload
      const instance = state.instances[cardUid]
      const vignetteBonus = instance.vignettes.reduce<Resources>((acc, v) => {
        if (v.effect.type === 'resource') {
          return mergeResources(acc, { [v.effect.resource]: v.effect.amount })
        }
        return acc
      }, {})
      const isPermanent = state.permanents.includes(cardUid)
      return {
        ...state,
        resources: mergeResources(state.resources, mergeResources(resourcesGained, vignetteBonus)),
        activated: [...state.activated, cardUid],
        // Défausse immédiate si non-permanente
        tableau: discardedUid && !isPermanent
          ? state.tableau.filter(uid => uid !== discardedUid)
          : state.tableau,
        discard: discardedUid && !isPermanent
          ? [...state.discard, discardedUid]
          : state.discard,
      }
    }

    case 'ACTION_RESOLVED': {
      const { cost, discardedUids, actionCardUid, resourcesGained, upgradeEffect } = event.payload
      const isPermanent = (uid: string) => state.permanents.includes(uid)

      // Gérer cost.destroy
      let extraDestroyedUid: string | null = null
      if (cost.destroy === 'self') {
        extraDestroyedUid = actionCardUid
      }

      const allDiscarded = extraDestroyedUid
        ? [...new Set([...discardedUids, extraDestroyedUid])]
        : discardedUids

      const newInstances = { ...state.instances }
      if (extraDestroyedUid) delete newInstances[extraDestroyedUid]

      if (upgradeEffect) {
        const { cardUid: upUid, toStateId } = upgradeEffect
        newInstances[upUid] = { ...newInstances[upUid], stateId: toStateId, trackProgress: null }
      }

      return {
        ...state,
        instances: newInstances,
        tableau: state.tableau.filter(uid => !allDiscarded.includes(uid)),
        discard: [...state.discard, ...allDiscarded.filter(uid => !isPermanent(uid) && !!newInstances[uid])],
        resources: mergeResources(spendCost(state.resources, cost), resourcesGained ?? {}),
        activated: [],
        pendingChoice: null,
      }
    }

    case 'UPGRADE_RESOLVED': {
      const { cardUid, toStateId, cost, discardedUids } = event.payload
      const isPermanentCard = state.permanents.includes(cardUid)
      const instance = state.instances[cardUid]
      const upgraded = { ...instance, stateId: toStateId, trackProgress: null }
      const newInstances = { ...state.instances, [cardUid]: upgraded }
      const newPermanents = isPermanentCard ? state.permanents : state.permanents
      const newTableau = state.tableau.filter(uid => !discardedUids.includes(uid))
      const newDiscard = [
        ...state.discard,
        ...discardedUids,
      ]
      return {
        ...state,
        instances: newInstances,
        permanents: newPermanents,
        tableau: isPermanentCard ? newTableau : newTableau.filter(uid => uid !== cardUid),
        discard: isPermanentCard ? newDiscard : [...newDiscard, cardUid],
        resources: spendCost(state.resources, cost),
        activated: [],
      }
    }

    case 'PROGRESSED': {
      const { drawnUids, remainingDeck } = event.payload
      return { ...state, tableau: [...state.tableau, ...drawnUids], deck: remainingDeck }
    }

    case 'CARD_BLOCKED': {
      const { targetUid, blockerUid } = event.payload
      return {
        ...state,
        instances: {
          ...state.instances,
          [targetUid]: { ...state.instances[targetUid], blockedBy: blockerUid },
        },
      }
    }

    case 'CARD_UNBLOCKED': {
      const { targetUid } = event.payload
      return {
        ...state,
        instances: {
          ...state.instances,
          [targetUid]: { ...state.instances[targetUid], blockedBy: null },
        },
      }
    }

    case 'CARD_DESTROYED': {
      const { cardUid, fromZone } = event.payload
      const newInstances = { ...state.instances }
      delete newInstances[cardUid]
      const rm = (arr: string[]) => arr.filter(uid => uid !== cardUid)
      return {
        ...state,
        instances: newInstances,
        deck: fromZone === 'deck' ? rm(state.deck) : state.deck,
        tableau: fromZone === 'tableau' ? rm(state.tableau) : state.tableau,
        discard: fromZone === 'discard' ? rm(state.discard) : state.discard,
        permanents: fromZone === 'permanents' ? rm(state.permanents) : state.permanents,
      }
    }

    case 'CARD_STATE_CHOSEN': {
      const { instance, chosenStateId, addedTo } = event.payload
      const finalInstance = { ...instance, stateId: chosenStateId }
      const newInstances = { ...state.instances, [finalInstance.uid]: finalInstance }
      const newDiscovery = state.discoveryPile.filter(uid => uid !== finalInstance.uid)
      if (addedTo === 'permanents')
        return { ...state, instances: newInstances, permanents: [...state.permanents, finalInstance.uid], discoveryPile: newDiscovery }
      if (addedTo === 'deck_top')
        return { ...state, instances: newInstances, deck: [finalInstance.uid, ...state.deck], discoveryPile: newDiscovery }
      return { ...state, instances: newInstances, deck: [...state.deck, finalInstance.uid], discoveryPile: newDiscovery }
    }

    case 'CARD_DISCOVERED': {
      const { instance, addedTo } = event.payload
      const newInstances = { ...state.instances, [instance.uid]: instance }
      const newDiscovery = state.discoveryPile.filter(uid => uid !== instance.uid)
      if (addedTo === 'permanents')
        return { ...state, instances: newInstances, permanents: [...state.permanents, instance.uid], discoveryPile: newDiscovery }
      if (addedTo === 'deck_top')
        return { ...state, instances: newInstances, deck: [instance.uid, ...state.deck], discoveryPile: newDiscovery }
      return { ...state, instances: newInstances, deck: [...state.deck, instance.uid], discoveryPile: newDiscovery }
    }

    case 'CARD_ADDED_TO_DECK': {
      const { instance, position } = event.payload
      if (state.deck.length === 0) return state
      const newInstances = { ...state.instances, [instance.uid]: instance }
      const newDeck = position === 'top'
        ? [instance.uid, ...state.deck]
        : [...state.deck, instance.uid]
      return { ...state, instances: newInstances, deck: newDeck }
    }

    case 'VIGNETTE_ADDED': {
      const { cardUid, vignette } = event.payload
      const instance = state.instances[cardUid]
      const cs = getActiveState(instance, defs)
      const max = cs.maxVignettes ?? 0
      if (instance.vignettes.length >= max) return state
      const newStock = { ...state.vignetteStock }
      const remaining = (newStock[vignette.vignetteNumber] ?? 0) - 1
      if (remaining < 0) return state
      if (remaining === 0) delete newStock[vignette.vignetteNumber]
      else newStock[vignette.vignetteNumber] = remaining

      let updatedInstance = { ...instance, vignettes: [...instance.vignettes, vignette] }
      if (vignette.effect.type === 'add_tag') {
        updatedInstance = { ...updatedInstance, tags: [...instance.tags, (vignette.effect as any).tag] }
      }

      return { ...state, vignetteStock: newStock, instances: { ...state.instances, [cardUid]: updatedInstance } }
    }

    case 'TRACK_ADVANCED': {
      const { cardUid, toStep, rewards } = event.payload
      let next: GameState = {
        ...state,
        instances: {
          ...state.instances,
          [cardUid]: { ...state.instances[cardUid], trackProgress: toStep },
        },
      }
      for (const reward of rewards) {
        next = applyTrackReward(next, cardUid, reward, defs, vignetteDefs)
      }
      return next
    }

    case 'CARD_PLAYED_FROM_DISCARD': {
      const { cardUid } = event.payload
      return {
        ...state,
        discard: state.discard.filter(uid => uid !== cardUid),
        tableau: [...state.tableau, cardUid],
        pendingChoice: null,
      }
    }

    case 'ON_PLAY_TRIGGERED': {
      return state  // effets traités dans useGame via pendingChoice
    }

    case 'UPGRADE_CARD_EFFECT': {
      // Upgrade déclenché comme effet d'action (pas comme action d'upgrade standard)
      const { cardUid, toStateId } = event.payload
      const instance = state.instances[cardUid]
      if (!instance) return state
      return {
        ...state,
        instances: {
          ...state.instances,
          [cardUid]: { ...instance, stateId: toStateId, trackProgress: null },
        },
      }
    }

    case 'CHOICE_MADE': {
      // La sélection est traitée côté useGame (dispatch CARD_DISCOVERED pour chaque choix)
      return { ...state, pendingChoice: null }
    }

    default:
      return state
  }
}

function applyTrackReward(
  state: GameState,
  cardUid: string,
  reward: TrackReward,
  defs: Record<number, CardDef>,
  vignetteDefs: Record<number, VignetteDef>,
): GameState {
  switch (reward.type) {
    case 'resource':
      return { ...state, resources: mergeResources(state.resources, { [reward.resource]: reward.amount }) }
    case 'glory_points': {
      const synth: Vignette = { vignetteNumber: 0, effect: { type: 'glory_points', amount: reward.amount } }
      const inst = state.instances[cardUid]
      return { ...state, instances: { ...state.instances, [cardUid]: { ...inst, vignettes: [...inst.vignettes, synth] } } }
    }
    case 'vignette': {
      const vd = vignetteDefs[reward.vignetteNumber]
      if (!vd) return state
      const vignette: Vignette = { vignetteNumber: reward.vignetteNumber, effect: vd.effect }
      const inst = state.instances[cardUid]
      const cs = getActiveState(inst, defs)
      if (inst.vignettes.length >= (cs.maxVignettes ?? 0)) return state
      const newStock = { ...state.vignetteStock }
      const rem = (newStock[reward.vignetteNumber] ?? 0) - 1
      if (rem < 0) return state
      if (rem === 0) delete newStock[reward.vignetteNumber]
      else newStock[reward.vignetteNumber] = rem
      return { ...state, vignetteStock: newStock, instances: { ...state.instances, [cardUid]: { ...inst, vignettes: [...inst.vignettes, vignette] } } }
    }
    default: return state
  }
}

export function replayEvents(events: GameEvent[], defs: Record<number, CardDef>, vignetteDefs: Record<number, VignetteDef>): GameState {
  return events.reduce((s, e) => reducer(s, e, defs, vignetteDefs), EMPTY_STATE)
}

export function stateAtIndex(events: GameEvent[], index: number, defs: Record<number, CardDef>, vignetteDefs: Record<number, VignetteDef>): GameState {
  return replayEvents(events.slice(0, index + 1), defs, vignetteDefs)
}