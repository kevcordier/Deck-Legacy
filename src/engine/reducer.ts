/**
 * @file reducer.ts
 * Reducer pur du moteur de jeu : `(GameState, GameEvent) → GameState`.
 *
 * Toute modification de l'état passe par ce fichier. Les fonctions sont pures
 * (pas d'effet de bord), ce qui permet de rejouer l'historique (`replayEvents`)
 * ou de rembobiner jusqu'à n'importe quel événement (`stateAtIndex`).
 */

import {
  type GameState,
  type GameEvent,
  type CardDef,
  type StickerDef,
  type Sticker,
  type TrackReward,
  type Resources,
  getActiveState,
  mergeResources,
  spendCost,
} from './types';

export const EMPTY_STATE: GameState = {
  deck: [],
  tableau: [],
  discard: [],
  permanents: [],
  instances: {},
  resources: {},
  activated: [],
  stickerStock: {},
  discoveryPile: [],
  round: 0,
  turn: 0,
  gameOver: false,
  pendingChoice: null,
  lastAddedUids: [],
};

/**
 * Libère automatiquement toutes les cartes bloquées par l'une des cartes défaussées.
 * Appelé après chaque événement pouvant retirer un bloqueur du jeu.
 */
function unblockByDiscardedBlockers(state: GameState, discardedUids: string[]): GameState {
  if (discardedUids.length === 0) return state;
  const toUnblock = Object.values(state.instances).filter(
    inst => inst.blockedBy !== null && discardedUids.includes(inst.blockedBy),
  );
  if (toUnblock.length === 0) return state;
  const newInstances = { ...state.instances };
  for (const inst of toUnblock) {
    newInstances[inst.uid] = { ...inst, blockedBy: null };
  }
  return { ...state, instances: newInstances };
}

/**
 * Ajoute une instance découverte à la zone cible (permanents, sommet ou fond du deck)
 * et la retire de la pile de découverte.
 */
function applyDiscoverCard(
  state: GameState,
  instance: GameState['instances'][string],
  addedTo: 'permanents' | 'deck_top' | 'deck_bottom',
): GameState {
  const newInstances = { ...state.instances, [instance.uid]: instance };
  const newDiscovery = state.discoveryPile.filter(uid => uid !== instance.uid);
  if (addedTo === 'permanents')
    return {
      ...state,
      instances: newInstances,
      permanents: [...state.permanents, instance.uid],
      discoveryPile: newDiscovery,
    };
  if (addedTo === 'deck_top')
    return {
      ...state,
      instances: newInstances,
      deck: [instance.uid, ...state.deck],
      discoveryPile: newDiscovery,
    };
  return {
    ...state,
    instances: newInstances,
    deck: [...state.deck, instance.uid],
    discoveryPile: newDiscovery,
  };
}

/**
 * Reducer principal : applique un seul événement à un état et retourne le nouvel état.
 * Chaque `case` est une transformation immutable de `GameState`.
 *
 * @param state   - État courant (ne doit jamais être muté directement)
 * @param event   - Événement décrivant ce qui s'est passé
 * @param defs    - Définitions de cartes chargées depuis `cards.json`
 * @param stickerDefs - Définitions de stickers chargées depuis `sticker.json`
 */
export function reducer(
  state: GameState,
  event: GameEvent,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, StickerDef>,
): GameState {
  switch (event.type) {
    case 'GAME_STARTED': {
      const { initialInstances, discoveryInstances, stickerStock } = event.payload;
      const instances: Record<string, (typeof initialInstances)[0]> = {};
      for (const inst of [...initialInstances, ...discoveryInstances]) {
        instances[inst.uid] = inst;
      }
      return {
        ...EMPTY_STATE,
        instances,
        deck: initialInstances.map(i => i.uid),
        discoveryPile: discoveryInstances.map(i => i.uid),
        stickerStock,
      };
    }

    // Réinitialise le plateau pour une nouvelle manche : mélange deck + défausse,
    // ajoute les nouvelles cartes, remet resources/activated à zéro.
    case 'ROUND_STARTED': {
      const { round, addedCards, permanentUids, deckUids } = event.payload;
      const addedUids = addedCards.map(i => i.uid);
      const newInstances = { ...state.instances };
      for (const inst of addedCards) newInstances[inst.uid] = inst;
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
        lastAddedUids: addedUids,
        discoveryPile: state.discoveryPile.filter(uid => !addedUids.includes(uid)),
        round,
        turn: 0,
      };
    }

    case 'ROUND_ENDED': {
      // Les "reste_en_jeu" du tableau retournent en défausse en fin de manche
      return {
        ...state,
        discard: [...state.discard, ...state.tableau],
        tableau: [],
        resources: {},
        activated: [],
      };
    }

    // Pioche `drawnUids` du deck et les pose dans le tableau. Remet resources/activated à zéro.
    case 'TURN_STARTED': {
      const { turn, drawnUids, remainingDeck } = event.payload;
      return {
        ...state,
        turn,
        deck: remainingDeck,
        tableau: [...state.tableau, ...drawnUids],
        resources: {},
        activated: [],
        lastAddedUids: [],
      };
    }

    // Envoie les cartes non-permanentes en défausse et conserve les persistantes dans le tableau.
    // Libère aussi les cartes bloquées dont le bloqueur vient d'être défaussé.
    case 'TURN_ENDED': {
      const { discardedUids, persistedUids } = event.payload;
      return unblockByDiscardedBlockers(
        {
          ...state,
          discard: [...state.discard, ...discardedUids],
          tableau: persistedUids,
          resources: {},
          activated: [],
        },
        discardedUids,
      );
    }

    // Produit des ressources (base + bonus stickers), marque la carte comme activée,
    // et la défausse immédiatement si elle n'est pas permanente.
    case 'CARD_ACTIVATED': {
      const { cardUid, resourcesGained, discardedUid } = event.payload;
      const instance = state.instances[cardUid];
      const stickerBonus = instance.stickers.reduce<Resources>((acc, v) => {
        if (v.effect.type === 'resource') {
          return mergeResources(acc, { [v.effect.resource]: v.effect.amount });
        }
        return acc;
      }, {});
      const isPermanent = state.permanents.includes(cardUid);
      const next = {
        ...state,
        resources: mergeResources(state.resources, mergeResources(resourcesGained, stickerBonus)),
        activated: [...state.activated, cardUid],
        // Défausse immédiate si non-permanente
        tableau:
          discardedUid && !isPermanent
            ? state.tableau.filter(uid => uid !== discardedUid)
            : state.tableau,
        discard: discardedUid && !isPermanent ? [...state.discard, discardedUid] : state.discard,
      };
      return discardedUid && !isPermanent
        ? unblockByDiscardedBlockers(next, [discardedUid])
        : next;
    }

    // Résout une action : dépense les ressources, défausse les cartes impliquées (activées + carte action),
    // applique l'effet d'upgrade si présent, et efface le choix en attente.
    case 'ACTION_RESOLVED': {
      const {
        cost,
        discardedUids,
        costDiscardedUids = [],
        actionCardUid,
        resourcesGained,
        upgradeEffect,
      } = event.payload;
      const isPermanent = (uid: string) => state.permanents.includes(uid);

      // Gérer cost.destroy
      let extraDestroyedUid: string | null = null;
      if (cost.destroy === 'self') {
        extraDestroyedUid = actionCardUid;
      }

      const allDiscarded = extraDestroyedUid
        ? [...new Set([...discardedUids, extraDestroyedUid])]
        : discardedUids;

      const newInstances = { ...state.instances };
      if (extraDestroyedUid) delete newInstances[extraDestroyedUid];

      if (upgradeEffect) {
        const { cardUid: upUid, toStateId } = upgradeEffect;
        newInstances[upUid] = { ...newInstances[upUid], stateId: toStateId, trackProgress: null };
      }

      const nextState = {
        ...state,
        instances: newInstances,
        deck: state.deck.filter(uid => !costDiscardedUids.includes(uid)),
        tableau: state.tableau.filter(
          uid => !allDiscarded.includes(uid) && !costDiscardedUids.includes(uid),
        ),
        discard: [
          ...state.discard,
          ...allDiscarded.filter(uid => !isPermanent(uid) && !!newInstances[uid]),
          ...costDiscardedUids.filter(uid => !state.discard.includes(uid)),
        ],
        resources: mergeResources(spendCost(state.resources, cost), resourcesGained ?? {}),
        activated: [],
        pendingChoice: null,
      };
      return unblockByDiscardedBlockers(nextState, [...allDiscarded, ...costDiscardedUids]);
    }

    // Améliore une carte vers un nouvel état, dépense les ressources,
    // défausse les autres cartes activées, et envoie la carte upgradée en défausse (si non-permanente).
    case 'UPGRADE_RESOLVED': {
      const { cardUid, toStateId, cost, discardedUids } = event.payload;
      const isPermanentCard = state.permanents.includes(cardUid);
      const instance = state.instances[cardUid];
      const upgraded = { ...instance, stateId: toStateId, trackProgress: null };
      const newInstances = { ...state.instances, [cardUid]: upgraded };
      const newPermanents = isPermanentCard ? state.permanents : state.permanents;
      const newTableau = state.tableau.filter(uid => !discardedUids.includes(uid));
      const newDiscard = [...state.discard, ...discardedUids];
      return {
        ...state,
        instances: newInstances,
        permanents: newPermanents,
        tableau: isPermanentCard ? newTableau : newTableau.filter(uid => uid !== cardUid),
        discard: isPermanentCard ? newDiscard : [...newDiscard, cardUid],
        resources: spendCost(state.resources, cost),
        activated: [],
      };
    }

    case 'PROGRESSED': {
      const { drawnUids, remainingDeck } = event.payload;
      return { ...state, tableau: [...state.tableau, ...drawnUids], deck: remainingDeck };
    }

    case 'CARD_BLOCKED': {
      const { targetUid, blockerUid } = event.payload;
      return {
        ...state,
        instances: {
          ...state.instances,
          [targetUid]: { ...state.instances[targetUid], blockedBy: blockerUid },
        },
      };
    }

    case 'CARD_UNBLOCKED': {
      const { targetUid } = event.payload;
      return {
        ...state,
        instances: {
          ...state.instances,
          [targetUid]: { ...state.instances[targetUid], blockedBy: null },
        },
      };
    }

    case 'CARD_DESTROYED': {
      const { cardUid, fromZone } = event.payload;
      const newInstances = { ...state.instances };
      delete newInstances[cardUid];
      const rm = (arr: string[]) => arr.filter(uid => uid !== cardUid);
      const afterDestroy = {
        ...state,
        instances: newInstances,
        deck: fromZone === 'deck' ? rm(state.deck) : state.deck,
        tableau: fromZone === 'tableau' ? rm(state.tableau) : state.tableau,
        discard: fromZone === 'discard' ? rm(state.discard) : state.discard,
        permanents: fromZone === 'permanents' ? rm(state.permanents) : state.permanents,
      };
      return unblockByDiscardedBlockers(afterDestroy, [cardUid]);
    }

    case 'CARD_STATE_CHOSEN': {
      const { instance, chosenStateId, addedTo } = event.payload;
      return {
        ...applyDiscoverCard(state, { ...instance, stateId: chosenStateId }, addedTo),
        pendingChoice: null,
      };
    }

    case 'CARD_DISCOVERED': {
      const { instance, addedTo } = event.payload;
      return applyDiscoverCard(state, instance, addedTo);
    }

    case 'CARD_ADDED_TO_DECK': {
      const { instance, position } = event.payload;
      if (state.deck.length === 0) return state;
      const newInstances = { ...state.instances, [instance.uid]: instance };
      const newDeck =
        position === 'top' ? [instance.uid, ...state.deck] : [...state.deck, instance.uid];
      return { ...state, instances: newInstances, deck: newDeck };
    }

    // Colle un sticker sur une carte si le slot est disponible et le stock non épuisé.
    // Si le sticker ajoute un tag, celui-ci est aussi propagé dans `instance.tags`.
    case 'STICKER_ADDED': {
      const { cardUid, sticker } = event.payload;
      const instance = state.instances[cardUid];
      const cs = getActiveState(instance, defs);
      const max = cs.maxStickers ?? 0;
      if (instance.stickers.length >= max) return state;
      const newStock = { ...state.stickerStock };
      const remaining = (newStock[sticker.stickerNumber] ?? 0) - 1;
      if (remaining < 0) return state;
      if (remaining === 0) delete newStock[sticker.stickerNumber];
      else newStock[sticker.stickerNumber] = remaining;

      let updatedInstance = { ...instance, stickers: [...instance.stickers, sticker] };
      if (sticker.effect.type === 'add_tag') {
        updatedInstance = {
          ...updatedInstance,
          tags: [...instance.tags, (sticker.effect as any).tag],
        };
      }

      return {
        ...state,
        stickerStock: newStock,
        instances: { ...state.instances, [cardUid]: updatedInstance },
      };
    }

    // Avance la piste de progression d'une carte et applique séquentiellement
    // toutes les récompenses des paliers franchis (ressources, stickers, gloire).
    case 'TRACK_ADVANCED': {
      const { cardUid, toStep, rewards } = event.payload;
      let next: GameState = {
        ...state,
        instances: {
          ...state.instances,
          [cardUid]: { ...state.instances[cardUid], trackProgress: toStep },
        },
      };
      for (const reward of rewards) {
        next = applyTrackReward(next, cardUid, reward, defs, stickerDefs);
      }
      return next;
    }

    case 'CARD_PLAYED_FROM_DISCARD': {
      const { cardUid } = event.payload;
      return {
        ...state,
        discard: state.discard.filter(uid => uid !== cardUid),
        tableau: [...state.tableau, cardUid],
        pendingChoice: null,
      };
    }

    case 'ON_PLAY_TRIGGERED': {
      return state; // effets traités dans useGame via pendingChoice
    }

    case 'UPGRADE_CARD_EFFECT': {
      // Upgrade déclenché comme effet d'action (pas comme action d'upgrade standard)
      const { cardUid, toStateId } = event.payload;
      const instance = state.instances[cardUid];
      if (!instance) return state;
      return {
        ...state,
        instances: {
          ...state.instances,
          [cardUid]: { ...instance, stateId: toStateId, trackProgress: null },
        },
      };
    }

    case 'CHOICE_MADE': {
      // La sélection est traitée côté useGame (dispatch CARD_DISCOVERED pour chaque choix)
      return { ...state, pendingChoice: null };
    }

    default:
      return state;
  }
}

/**
 * Applique une récompense de palier de piste sur l'état.
 * - `resource` : ajoute immédiatement des ressources.
 * - `glory_points` : crée un sticker synthétique (non décompté du stock) pour mémoriser les PG.
 * - `sticker` : consomme un sticker du stock global et le colle sur la carte.
 */
function applyTrackReward(
  state: GameState,
  cardUid: string,
  reward: TrackReward,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, StickerDef>,
): GameState {
  switch (reward.type) {
    case 'resource':
      return {
        ...state,
        resources: mergeResources(state.resources, { [reward.resource]: reward.amount }),
      };
    case 'glory_points': {
      const synth: Sticker = {
        stickerNumber: 0,
        effect: { type: 'glory_points', amount: reward.amount },
      };
      const inst = state.instances[cardUid];
      return {
        ...state,
        instances: {
          ...state.instances,
          [cardUid]: { ...inst, stickers: [...inst.stickers, synth] },
        },
      };
    }
    case 'sticker': {
      const vd = stickerDefs[reward.stickerNumber];
      if (!vd) return state;
      const sticker: Sticker = { stickerNumber: reward.stickerNumber, effect: vd.effect };
      const inst = state.instances[cardUid];
      const cs = getActiveState(inst, defs);
      if (inst.stickers.length >= (cs.maxStickers ?? 0)) return state;
      const newStock = { ...state.stickerStock };
      const rem = (newStock[reward.stickerNumber] ?? 0) - 1;
      if (rem < 0) return state;
      if (rem === 0) delete newStock[reward.stickerNumber];
      else newStock[reward.stickerNumber] = rem;
      return {
        ...state,
        stickerStock: newStock,
        instances: {
          ...state.instances,
          [cardUid]: { ...inst, stickers: [...inst.stickers, sticker] },
        },
      };
    }
    default:
      return state;
  }
}

/**
 * Reconstruit l'état complet en rejouant tous les événements depuis `EMPTY_STATE`.
 * Utilisé au chargement d'une sauvegarde ou après un rembobinage.
 */
export function replayEvents(
  events: GameEvent[],
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, StickerDef>,
): GameState {
  return events.reduce((s, e) => reducer(s, e, defs, stickerDefs), EMPTY_STATE);
}

/**
 * Retourne l'état du jeu après l'application du n-ième événement (index inclusif).
 * Permet de naviguer dans l'historique (rembobinage dans l'EventLog).
 */
export function stateAtIndex(
  events: GameEvent[],
  index: number,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, StickerDef>,
): GameState {
  return replayEvents(events.slice(0, index + 1), defs, stickerDefs);
}
