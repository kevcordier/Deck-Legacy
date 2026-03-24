/**
 * @file turnFlow.ts
 * Fonctions de haut niveau orchestrant le flux de tour et de manche.
 *
 * Chaque fonction retourne un `ActionResult` (événements + choix en attente)
 * sans muter l'état — le dispatch est délégué au hook `useGame`.
 *
 * Flux principal :
 *   computeStartRound → [computeStartTurn → actions joueur → computeEndTurnVoluntary] × N
 */

import type { GameState, CardDef, StickerDef, PendingChoice, ActionResult } from './types';
import { PENDING_UNCHANGED, getActiveState } from './types';
import { buildRoundStartedEvent, buildTurnStartedEvent, buildTurnEndedEvent } from './init';
import { reducer } from './reducer';

// ─── On-Play Triggers ─────────────────────────────────────────────────────────

/**
 * Vérifie si des cartes nouvellement posées dans le tableau ont des actions `on_play`
 * nécessitant une interaction joueur (ex: bloquer une carte ennemie).
 *
 * Retourne le premier `PendingChoice` trouvé, ou `null` s'il n'y a rien à résoudre.
 * Seul l'effet `block_card` est géré ici ; les autres `on_play` sont résolus automatiquement.
 */
export function checkOnPlayTriggers(
  newUids: string[],
  state: GameState,
  defs: Record<number, CardDef>,
): PendingChoice | null {
  for (const uid of newUids) {
    const inst = state.instances[uid];
    if (!inst) continue;
    const cs = getActiveState(inst, defs);
    const triggers = (cs.actions ?? []).filter(a => a.trigger === 'on_play');
    for (const action of triggers) {
      for (const effect of action.effects) {
        if (effect.type === 'block_card') {
          const alreadyBlocked = Object.values(state.instances).some(i => i.blockedBy === uid);
          if (alreadyBlocked) continue;
          const candidates = state.tableau.filter(tuid => {
            if (tuid === uid) return false;
            const tinst = state.instances[tuid];
            if (!tinst) return false;
            if (tinst.blockedBy !== null) return false;
            const tcs = getActiveState(tinst, defs);
            const produces = effect.produces ?? [];
            if (produces.length === 0) return true;
            const cardResources = Object.keys(tcs.productions?.[0] ?? {});
            return produces.some((r: string) => cardResources.includes(r));
          });
          if (candidates.length === 0) continue;
          if (action.optional === false) {
            return {
              kind: 'block_card',
              blockerUid: uid,
              candidates,
              actionLabel: action.label,
            };
          }
        }
      }
    }
  }
  return null;
}

// ─── Tour de jeu ──────────────────────────────────────────────────────────────

/**
 * Démarre une nouvelle manche.
 * - Première manche : construit ROUND_STARTED + TURN_STARTED en un seul appel (aucune carte à ajouter).
 * - Manches suivantes : ajoute les 2 premières cartes de la pile de découverte.
 *   Si certaines cartes requièrent un choix d'état (`chooseState`), suspend sur `choose_state`.
 *
 * Retourne `PENDING_UNCHANGED` si des choix d'état sont en cours pour les cartes normales,
 * ou le `PendingChoice` des triggers `on_play` pour la première manche.
 */
export function computeStartRound(
  state: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, StickerDef>,
): ActionResult {
  const isFirstRound = state.round === 0;
  const addedCardUids = !isFirstRound
    ? [...state.discoveryPile]
        .sort((a, b) => {
          const idA = state.instances[a]?.deckEntryId ?? 9999;
          const idB = state.instances[b]?.deckEntryId ?? 9999;
          return idA - idB;
        })
        .slice(0, 2)
    : [];

  // Séparer les cartes qui demandent un choix d'état
  const chooseStateUids = addedCardUids.filter(uid => {
    const def = defs[state.instances[uid]?.cardId];
    return def?.chooseState && def.states.length > 1;
  });
  const normalUids = addedCardUids.filter(uid => !chooseStateUids.includes(uid));

  const roundEvent = buildRoundStartedEvent(
    state.round + 1,
    state.deck,
    state.discard,
    state.permanents,
    normalUids,
    state.instances,
    defs,
  );

  if (!isFirstRound) {
    if (chooseStateUids.length > 0) {
      const pending = chooseStateUids.map(uid => {
        const inst = state.instances[uid];
        const def = defs[inst.cardId];
        return { instance: inst, addedTo: 'deck_bottom' as const, options: def.states };
      });
      const [first, ...rest] = pending;
      return {
        events: [roundEvent],
        pendingChoice: { kind: 'choose_state', ...first, remaining: rest },
      };
    }
    return { events: [roundEvent], pendingChoice: PENDING_UNCHANGED };
  }

  // Première manche : pioche automatique
  const stateAfterRound = reducer(state, roundEvent, defs, stickerDefs);
  const turnEvent = buildTurnStartedEvent(stateAfterRound.turn + 1, stateAfterRound.deck);
  const stateAfterDraw = reducer(stateAfterRound, turnEvent, defs, stickerDefs);
  const drawnUids = (turnEvent.payload as { drawnUids: string[] }).drawnUids;
  const pending = checkOnPlayTriggers(drawnUids, stateAfterDraw, defs);

  return { events: [roundEvent, turnEvent], pendingChoice: pending };
}

/**
 * Démarre un nouveau tour dans la manche courante.
 * Pioche 4 cartes, puis vérifie les triggers `on_play` des cartes tirées.
 */
export function computeStartTurn(
  state: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, StickerDef>,
): ActionResult {
  const event = buildTurnStartedEvent(state.turn + 1, state.deck);
  const newState = reducer(state, event, defs, stickerDefs);
  const drawnUids = (event.payload as { drawnUids: string[] }).drawnUids;
  const pending = checkOnPlayTriggers(drawnUids, newState, defs);
  return { events: [event], pendingChoice: pending };
}

/**
 * Termine le tour volontairement (bouton "Fin de tour").
 * - Défausse le tableau (sauf cartes persistantes).
 * - Si le deck est vide → retourne `PENDING_UNCHANGED` (fin de manche gérée par l'UI).
 * - Sinon → enchaîne immédiatement avec `TURN_STARTED` pour le tour suivant.
 */
export function computeEndTurnVoluntary(
  state: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, StickerDef>,
): ActionResult {
  const endEvt = buildTurnEndedEvent(state.tableau, state.instances, defs, 'voluntary');
  const stateAfterTurn = reducer(state, endEvt, defs, stickerDefs);

  if (stateAfterTurn.deck.length === 0) {
    return { events: [endEvt], pendingChoice: PENDING_UNCHANGED };
  }

  const turnEvt = buildTurnStartedEvent(stateAfterTurn.turn + 1, stateAfterTurn.deck);
  const stateAfterDraw = reducer(stateAfterTurn, turnEvt, defs, stickerDefs);
  const drawnUids = (turnEvt.payload as { drawnUids: string[] }).drawnUids;
  const pending = checkOnPlayTriggers(drawnUids, stateAfterDraw, defs);

  return { events: [endEvt, turnEvt], pendingChoice: pending };
}

/**
 * Pioche 2 cartes supplémentaires depuis le deck en cours de tour ("avancer").
 * Si le deck est vide, ne fait rien. Vérifie ensuite les triggers `on_play`.
 */
export function computeProgress(
  state: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, StickerDef>,
): ActionResult {
  const { deck } = state;
  if (deck.length === 0) return { events: [], pendingChoice: PENDING_UNCHANGED };
  const count = Math.min(2, deck.length);
  const drawnUids = deck.slice(0, count);
  const remainingDeck = deck.slice(count);
  const event = { type: 'PROGRESSED' as const, payload: { drawnUids, remainingDeck } };
  const newState = reducer(state, event, defs, stickerDefs);
  const pending = checkOnPlayTriggers(drawnUids, newState, defs);
  return { events: [event], pendingChoice: pending };
}
