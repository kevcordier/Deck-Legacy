/**
 * @file choiceHandlers.ts
 * Résolution des choix interactifs du joueur (`PendingChoice`).
 *
 * Chaque fonction est appelée après qu'un `PendingChoice` a été affiché dans l'UI
 * et que le joueur a fait sa sélection. Elles retournent un `ActionResult` sans muter l'état.
 *
 * Correspondance PendingChoice → handler :
 *   discover_card      → computeResolveChoice
 *   choose_state       → computeResolveChooseState
 *   choose_resource    → computeResolveResourceChoice
 *   copy_production    → computeResolveCopyProduction
 *   block_card         → computeResolveBlockCard
 *   play_from_discard  → computeResolvePlayFromDiscard
 *   discard_for_cost   → computeResolveDiscardCost
 */

import {
  type GameState,
  type CardDef,
  type StickerDef,
  type Resources,
  type ActionResult,
  PENDING_UNCHANGED,
  getActiveState,
  mergeResources,
  resolveTargets,
} from './types';
import { createInstance } from './init';
import { computeResolveAction } from './cardActions';

// ─── Découverte de carte ──────────────────────────────────────────────────────

/**
 * Résout un choix de découverte (`discover_card`) : le joueur a sélectionné les cartes à ajouter à son deck.
 *
 * - Cherche l'instance existante dans `discoveryPile` pour chaque cardId choisi.
 * - Si la carte requiert un choix d'état (`chooseState`), suspend sur `choose_state`.
 * - Produit un `CARD_DISCOVERED` par carte, puis un `CHOICE_MADE` final.
 */
export function computeResolveChoice(
  state: GameState,
  chosenCardIds: number[],
  defs: Record<number, CardDef>,
): ActionResult {
  const pending = state.pendingChoice;
  if (!pending || pending.kind !== 'discover_card')
    return { events: [], pendingChoice: PENDING_UNCHANGED };

  const usedUids = new Set<string>();
  const events: ActionResult['events'] = [];

  for (const cardId of chosenCardIds) {
    const def = defs[cardId];
    if (!def) continue;
    const existingUid = state.discoveryPile.find(
      uid => state.instances[uid]?.cardId === cardId && !usedUids.has(uid),
    );
    const instance = existingUid
      ? state.instances[existingUid]
      : createInstance(cardId, def.states[0].id, defs);
    if (existingUid) usedUids.add(existingUid);
    const addedTo = def.permanent ? ('permanents' as const) : ('deck_top' as const);

    if (def.chooseState && def.states.length > 1) {
      return {
        events,
        pendingChoice: { kind: 'choose_state', instance, addedTo, options: def.states },
      };
    }

    events.push({ type: 'CARD_DISCOVERED', payload: { instance, addedTo } });
  }

  events.push({
    type: 'CHOICE_MADE',
    payload: { actionCardUid: pending.actionCardUid, kind: 'discover_card', chosenCardIds },
  });

  return { events, pendingChoice: PENDING_UNCHANGED };
}

// ─── Choix d'état de carte ────────────────────────────────────────────────────

/**
 * Résout un choix d'état de carte (`choose_state`) : le joueur a choisi quel état activer.
 * Si d'autres cartes attendent encore un choix d'état (`remaining`), enchaîne sur le suivant.
 * Sinon, efface le `pendingChoice`.
 */
export function computeResolveChooseState(state: GameState, chosenStateId: number): ActionResult {
  const pending = state.pendingChoice;
  if (!pending || pending.kind !== 'choose_state')
    return { events: [], pendingChoice: PENDING_UNCHANGED };

  const stateChosenEvent = {
    type: 'CARD_STATE_CHOSEN' as const,
    payload: { instance: pending.instance, chosenStateId, addedTo: pending.addedTo },
  };

  const remaining = pending.remaining ?? [];
  if (remaining.length > 0) {
    const [next, ...rest] = remaining;
    return {
      events: [stateChosenEvent],
      pendingChoice: { kind: 'choose_state', ...next, remaining: rest },
    };
  }

  return { events: [stateChosenEvent], pendingChoice: null };
}

// ─── Choix de ressource ───────────────────────────────────────────────────────

/**
 * Résout un choix de ressource (`choose_resource`).
 * - Source `activation` : produit un `CARD_ACTIVATED` avec la ressource choisie.
 * - Source `action` : applique directement les ressources via `resourceDelta` (sans événement persisté).
 */
export function computeResolveResourceChoice(state: GameState, chosen: Resources): ActionResult {
  const pending = state.pendingChoice;
  if (!pending || pending.kind !== 'choose_resource')
    return { events: [], pendingChoice: PENDING_UNCHANGED };
  if (pending.source === 'activation') {
    return {
      events: [
        { type: 'CARD_ACTIVATED', payload: { cardUid: pending.cardUid, resourcesGained: chosen } },
      ],
      pendingChoice: null,
    };
  }
  // source === 'action' : ressources ajoutées directement sans événement
  return { events: [], pendingChoice: null, resourceDelta: chosen };
}

// ─── Copie de production ──────────────────────────────────────────────────────

/**
 * Résout un effet de copie de production (`copy_production`) :
 * le joueur a choisi quelle carte copier. Retourne les ressources copiées
 * (base + bonus stickers de la cible) via `resourceDelta`, sans émettre d'événement.
 */
export function computeResolveCopyProduction(
  state: GameState,
  targetUid: string,
  defs: Record<number, CardDef>,
): ActionResult {
  const pending = state.pendingChoice;
  if (!pending || pending.kind !== 'copy_production')
    return { events: [], pendingChoice: PENDING_UNCHANGED };
  const targetInst = state.instances[targetUid];
  if (!targetInst) return { events: [], pendingChoice: PENDING_UNCHANGED };
  const cs = getActiveState(targetInst, defs);
  const baseResources = cs.productions?.[0] ?? {};
  const stickerBonus = targetInst.stickers.reduce<Resources>((acc, v) => {
    if (v.effect.type === 'resource')
      return mergeResources(acc, { [v.effect.resource]: v.effect.amount });
    return acc;
  }, {});
  return {
    events: [],
    pendingChoice: null,
    resourceDelta: mergeResources(baseResources, stickerBonus),
  };
}

// ─── Blocage de carte ─────────────────────────────────────────────────────────

/**
 * Résout un choix de blocage (`block_card`) : applique `CARD_BLOCKED` sur la cible choisie.
 * La carte bloquée ne peut plus être activée ni déclencher ses actions jusqu'à ce que le bloqueur quitte le jeu.
 */
export function computeResolveBlockCard(state: GameState, targetUid: string): ActionResult {
  const pending = state.pendingChoice;
  if (!pending || pending.kind !== 'block_card')
    return { events: [], pendingChoice: PENDING_UNCHANGED };
  return {
    events: [{ type: 'CARD_BLOCKED', payload: { blockerUid: pending.blockerUid, targetUid } }],
    pendingChoice: null,
  };
}

// ─── Rejouer depuis la défausse ───────────────────────────────────────────────

/**
 * Résout le choix de rejouer des cartes depuis la défausse (`play_from_discard`).
 * Produit un `CARD_PLAYED_FROM_DISCARD` par carte sélectionnée (les remet dans le tableau).
 */
export function computeResolvePlayFromDiscard(
  state: GameState,
  chosenUids: string[],
): ActionResult {
  const pending = state.pendingChoice;
  if (!pending || pending.kind !== 'play_from_discard')
    return { events: [], pendingChoice: PENDING_UNCHANGED };
  return {
    events: chosenUids.map(uid => ({
      type: 'CARD_PLAYED_FROM_DISCARD' as const,
      payload: { cardUid: uid },
    })),
    pendingChoice: null,
  };
}

// ─── Coût de défausse ─────────────────────────────────────────────────────────

/**
 * Résout un coût de défausse step-by-step (`discard_for_cost`).
 *
 * - Collecte la carte choisie dans `collectedUids`.
 * - S'il reste des scopes à résoudre, suspend sur le scope suivant.
 * - Quand tous les coûts sont collectés, délègue à `computeResolveAction`
 *   avec la liste complète des UIDs défaussés.
 */
export function computeResolveDiscardCost(
  state: GameState,
  chosenUid: string,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, StickerDef>,
): ActionResult {
  const pending = state.pendingChoice;
  if (!pending || pending.kind !== 'discard_for_cost')
    return { events: [], pendingChoice: PENDING_UNCHANGED };
  const { actionCardUid, actionId, remainingScopes, collectedUids } = pending;
  const newCollected = [...collectedUids, chosenUid];

  if (remainingScopes.length > 0) {
    const nextScope = remainingScopes[0];
    const candidates = resolveTargets(nextScope, state).filter(
      uid => uid !== actionCardUid && !newCollected.includes(uid),
    );
    return {
      events: [],
      pendingChoice: {
        kind: 'discard_for_cost',
        actionCardUid,
        actionId,
        candidates,
        remainingScopes: remainingScopes.slice(1),
        collectedUids: newCollected,
      },
    };
  }

  // Tous les coûts collectés → exécuter l'action
  return computeResolveAction(state, actionCardUid, actionId, defs, stickerDefs, newCollected);
}
