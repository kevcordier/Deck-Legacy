/**
 * @file cardActions.ts
 * Logique de résolution des interactions joueur sur les cartes.
 *
 * Les trois actions principales :
 * - `computeActivateCard`   : activer une carte pour produire des ressources.
 * - `computeResolveAction`  : déclencher une action textuelle d'une carte (coût + effets).
 * - `computeResolveUpgrade` : améliorer une carte vers un état supérieur.
 *
 * Toutes ces fonctions sont pures : elles reçoivent l'état courant et retournent
 * un `ActionResult` sans jamais muter l'état.
 */

import {
  type GameState,
  type CardDef,
  type StickerDef,
  type Resources,
  type ActionEffect,
  type ResourceChoice,
  type UpgradeDef,
  type ActionResult,
  PENDING_UNCHANGED,
  getActiveState,
  canAffordCost,
  mergeResources,
  resolveTargets,
} from './types';
import { buildTurnStartedEvent, buildTurnEndedEvent, buildTrackAdvancedEvent } from './init';
import { reducer } from './reducer';

// ─── Activation de carte ──────────────────────────────────────────────────────

/**
 * Active une carte du tableau pour produire ses ressources.
 *
 * - Si la carte a plusieurs options de production, suspend sur `choose_resource`
 *   jusqu'à ce que le joueur choisisse (rappelé ensuite avec `chosenResource`).
 * - Applique les bonus de passifs (`increase_production`) avant de retourner l'événement.
 * - Les cartes non-permanentes sont défaussées immédiatement après activation.
 * - Aucune action possible si la carte est bloquée ou déjà activée ce tour.
 */
export function computeActivateCard(
  state: GameState,
  cardUid: string,
  defs: Record<number, CardDef>,
  chosenResource?: Resources,
): ActionResult {
  const instance = state.instances[cardUid];
  if (!instance || instance.blockedBy) return { events: [], pendingChoice: PENDING_UNCHANGED };
  if (state.activated.includes(cardUid)) return { events: [], pendingChoice: PENDING_UNCHANGED };
  const cs = getActiveState(instance, defs);

  if ((cs.productions?.length ?? 0) > 1) {
    if (chosenResource === undefined) {
      return {
        events: [],
        pendingChoice: {
          kind: 'choose_resource',
          source: 'activation',
          cardUid,
          options: cs.productions || [],
        },
      };
    }
    return {
      events: [{ type: 'CARD_ACTIVATED', payload: { cardUid, resourcesGained: chosenResource } }],
      pendingChoice: null,
    };
  }

  const passiveBonus = (cs.passives ?? cs.passifs ?? []).reduce<Resources>((acc, passive) => {
    for (const eff of passive.effects) {
      if (eff.type === 'increase_production') {
        const zones =
          eff.card_scope === 'in_play'
            ? [...state.tableau, ...state.permanents]
            : (state[eff.card_scope as 'tableau' | 'deck' | 'discard'] as string[]);
        const count = zones.filter(uid => {
          const inst = state.instances[uid];
          if (!inst) return false;
          const s = getActiveState(inst, defs);
          return !eff.tags || eff.tags.every((t: string) => s.tags.includes(t));
        }).length;
        acc = mergeResources(acc, { [eff.resource]: eff.amount_per_card * count });
      }
    }
    return acc;
  }, {});

  const baseResources = cs.productions?.[0] ?? {};
  const totalResources = mergeResources(baseResources, passiveBonus);
  const isPermanent = state.permanents.includes(cardUid);

  return {
    events: [
      {
        type: 'CARD_ACTIVATED',
        payload: {
          cardUid,
          resourcesGained: totalResources,
          discardedUid: isPermanent ? undefined : cardUid,
        },
      },
    ],
    pendingChoice: PENDING_UNCHANGED,
  };
}

// ─── Résolution d'action ──────────────────────────────────────────────────────

/**
 * Résout une action d'une carte (identifiée par `actionId` = son `label` dans la définition).
 *
 * Pipeline de résolution :
 * 1. Vérifie que la carte existe, n'est pas bloquée, et que le coût est payable.
 * 2. Collecte les coûts de défausse un par un (via `discard_for_cost`).
 * 3. Calcule les ressources immédiates et sépare les effets différés.
 * 4. Produit l'événement `ACTION_RESOLVED` (inclut défausse des cartes activées).
 * 5. Traite les effets différés : piste, choix de ressource, découverte, blocage, etc.
 * 6. Si `endsTurn`, enchaîne avec `TURN_ENDED` + `TURN_STARTED`.
 *
 * @param costDiscardedUids - UIDs déjà collectés pour les coûts de défausse (appels récursifs via choiceHandlers).
 */
export function computeResolveAction(
  state: GameState,
  actionCardUid: string,
  actionId: string,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, StickerDef>,
  costDiscardedUids: string[] = [],
): ActionResult {
  const instance = state.instances[actionCardUid];
  if (!instance || instance.blockedBy) return { events: [], pendingChoice: PENDING_UNCHANGED };
  const cs = getActiveState(instance, defs);
  const action = cs.actions?.find(a => a.label === actionId);
  if (!action) return { events: [], pendingChoice: PENDING_UNCHANGED };
  if (action.cost && !canAffordCost(state.resources, action.cost)) {
    return { events: [], pendingChoice: PENDING_UNCHANGED };
  }

  // Vérifier le coût de défausse : collecter les cartes une par une
  const discardScopes = action.cost?.discard ?? [];
  if (costDiscardedUids.length < discardScopes.length) {
    const nextScopeIdx = costDiscardedUids.length;
    const nextScope = discardScopes[nextScopeIdx];
    const candidates = resolveTargets(nextScope, state).filter(
      uid => uid !== actionCardUid && !costDiscardedUids.includes(uid),
    );
    if (candidates.length === 0) return { events: [], pendingChoice: PENDING_UNCHANGED };
    return {
      events: [],
      pendingChoice: {
        kind: 'discard_for_cost',
        actionCardUid,
        actionId,
        candidates,
        remainingScopes: discardScopes.slice(nextScopeIdx + 1),
        collectedUids: costDiscardedUids,
      },
    };
  }

  const isPermanent = (uid: string) => state.permanents.includes(uid);
  const allInvolved = [...state.activated, actionCardUid];
  const discardedUids = allInvolved.filter(uid => !isPermanent(uid) && state.tableau.includes(uid));

  // Calculer les ressources immédiates et effets différés
  let resourcesGained: Resources = {};
  let upgradeEffect: { cardUid: string; toStateId: number } | undefined;
  const deferredEffects: typeof action.effects = [];

  for (const effect of action.effects) {
    if (effect.type === 'add_resources') {
      const choices: ResourceChoice[] = effect.resources;
      const cardTargets = choices.filter(
        (r): r is Extract<ResourceChoice, { card: unknown }> => 'card' in r,
      );
      const resourceOptions = choices.filter((r): r is Resources => !('card' in r));
      if (cardTargets.length === 0 && resourceOptions.length === 1) {
        resourcesGained = mergeResources(resourcesGained, resourceOptions[0]);
        continue;
      }
    }
    if (effect.type === 'add_resource' && 'amount_per_card' in effect) {
      const e = effect as Extract<ActionEffect, { amount_per_card: number }>;
      const zones =
        e.card_scope === 'in_play'
          ? [...state.tableau, ...state.permanents]
          : (state[e.card_scope as 'tableau' | 'deck' | 'discard'] as string[]);
      const tags: string[] = e.tags ?? [];
      const count = zones.filter(uid => {
        const inst = state.instances[uid];
        if (!inst) return false;
        const s = getActiveState(inst, defs);
        return tags.length === 0 || tags.every(t => s.tags.includes(t));
      }).length;
      resourcesGained = mergeResources(resourcesGained, {
        [e.resource]: e.amount_per_card * count,
      });
      continue;
    }
    if (effect.type === 'upgrade_card') {
      const targetUid = effect.cardId === 'self' ? actionCardUid : null;
      if (targetUid) upgradeEffect = { cardUid: targetUid, toStateId: effect.upgradeTo };
      continue;
    }
    deferredEffects.push(effect);
  }

  const mainEvent = {
    type: 'ACTION_RESOLVED' as const,
    payload: {
      activatedUids: state.activated,
      actionCardUid,
      actionId,
      cost: action.cost ?? {},
      discardedUids,
      costDiscardedUids,
      endsTurn: action.endsTurn ?? false,
      resourcesGained,
      upgradeEffect,
    },
  };

  const events = [mainEvent];
  let pendingChoice: ActionResult['pendingChoice'] = PENDING_UNCHANGED;

  // Traiter les effets différés
  for (const effect of deferredEffects) {
    if (effect.type === 'advance_track') {
      const trackEvent = buildTrackAdvancedEvent(
        actionCardUid,
        instance.trackProgress,
        effect.steps,
        defs,
        state.instances,
      );
      if (trackEvent) events.push(trackEvent);
      continue;
    }
    if (effect.type === 'add_resource' && Array.isArray(effect.resource)) {
      const e = effect as Extract<ActionEffect, { amount: number }>;
      pendingChoice = {
        kind: 'choose_resource',
        source: 'action',
        cardUid: actionCardUid,
        options: (e.resource as string[]).map(r => ({ [r]: e.amount })),
      };
      continue;
    }
    if (effect.type === 'add_resources') {
      const choices: ResourceChoice[] = effect.resources;
      const cardTargets = choices.filter(
        (r): r is Extract<ResourceChoice, { card: unknown }> => 'card' in r,
      );
      const resourceOptions = choices.filter((r): r is Resources => !('card' in r));
      if (cardTargets.length > 0) {
        const scope = cardTargets[0].card.card_scope ?? 'in_play';
        const tags = cardTargets[0].card.tags as string[] | undefined;
        const zoneUids =
          scope === 'in_play'
            ? [...state.tableau, ...state.permanents]
            : scope === 'discard'
              ? state.discard
              : state.tableau;
        const candidates = tags
          ? zoneUids.filter(uid => {
              const inst = state.instances[uid];
              if (!inst) return false;
              const cs2 = getActiveState(inst, defs);
              return tags.every((t: string) => cs2.tags.includes(t));
            })
          : zoneUids;
        pendingChoice = { kind: 'copy_production', actionCardUid, candidates };
      } else if (resourceOptions.length > 0) {
        pendingChoice = {
          kind: 'choose_resource',
          source: 'action',
          cardUid: actionCardUid,
          options: resourceOptions,
        };
      }
      continue;
    }
    if (effect.type === 'play_from_discard') {
      const candidates = state.discard.filter(uid => {
        if (!effect.tags || effect.tags.length === 0) return true;
        const inst = state.instances[uid];
        if (!inst) return false;
        const cs2 = getActiveState(inst, defs);
        return effect.tags.some((tag: string) => cs2.tags.includes(tag));
      });
      pendingChoice = {
        kind: 'play_from_discard',
        actionCardUid,
        candidates,
        pickCount: effect.number,
      };
      continue;
    }
    if (effect.type === 'discover_card') {
      pendingChoice = {
        actionCardUid,
        actionLabel: action.label,
        kind: 'discover_card',
        candidates: effect.cards,
        pickCount: effect.number,
      };
      continue;
    }
  }

  if (action.endsTurn) {
    const newTableau = state.tableau.filter(uid => !discardedUids.includes(uid));
    const endEvt = buildTurnEndedEvent(newTableau, state.instances, defs, 'action');
    events.push(endEvt);
    const stateAfterTurn = reducer(state, endEvt, defs, stickerDefs);
    if (stateAfterTurn.deck.length > 0) {
      events.push(buildTurnStartedEvent(stateAfterTurn.turn + 1, stateAfterTurn.deck));
    }
  }

  return { events, pendingChoice };
}

// ─── Résolution d'upgrade ─────────────────────────────────────────────────────

/**
 * Améliore une carte vers un état supérieur (upgrade).
 *
 * - Si plusieurs upgrades possibles, suspend sur `choose_upgrade` (rappelé avec `chosenUpgradeTo`).
 * - Vérifie que le coût est payable.
 * - Défausse toutes les cartes activées (sauf la carte upgradée elle-même).
 * - Termine toujours le tour (TURN_ENDED + TURN_STARTED si deck non vide).
 * - Les cartes permanentes restent dans les permanents après upgrade.
 */
export function computeResolveUpgrade(
  state: GameState,
  cardUid: string,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, StickerDef>,
  chosenUpgradeTo?: number,
): ActionResult {
  const instance = state.instances[cardUid];
  if (!instance || instance.blockedBy) return { events: [], pendingChoice: PENDING_UNCHANGED };
  const cs = getActiveState(instance, defs);
  if (!cs.upgrade || cs.upgrade.length === 0)
    return { events: [], pendingChoice: PENDING_UNCHANGED };

  const isPermanent = (uid: string) => state.permanents.includes(uid);
  const allInvolved = [...state.activated, cardUid];

  if (cs.upgrade.length > 1) {
    if (chosenUpgradeTo === undefined) {
      return {
        events: [],
        pendingChoice: { kind: 'choose_upgrade', cardUid, options: cs.upgrade as UpgradeDef[] },
      };
    }
    const chosen = cs.upgrade.find(u => u.upgradeTo === chosenUpgradeTo);
    if (!chosen || !canAffordCost(state.resources, chosen.cost)) {
      return { events: [], pendingChoice: PENDING_UNCHANGED };
    }
    const discardedUids = allInvolved.filter(
      uid => !isPermanent(uid) && uid !== cardUid && state.tableau.includes(uid),
    );
    const upgradeEvent = {
      type: 'UPGRADE_RESOLVED' as const,
      payload: {
        activatedUids: state.activated,
        cardUid,
        fromStateId: instance.stateId,
        toStateId: chosenUpgradeTo,
        cost: chosen.cost,
        discardedUids,
      },
    };
    const newTableau = state.tableau.filter(uid => !discardedUids.includes(uid) && uid !== cardUid);
    const endEvt = buildTurnEndedEvent(newTableau, state.instances, defs, 'upgrade');
    return { events: [upgradeEvent, endEvt], pendingChoice: PENDING_UNCHANGED };
  }

  const upgrade = cs.upgrade[0];
  if (!canAffordCost(state.resources, upgrade.cost))
    return { events: [], pendingChoice: PENDING_UNCHANGED };

  const discardedUids = allInvolved.filter(
    uid => !isPermanent(uid) && uid !== cardUid && state.tableau.includes(uid),
  );
  const upgradeEvent = {
    type: 'UPGRADE_RESOLVED' as const,
    payload: {
      activatedUids: state.activated,
      cardUid,
      fromStateId: instance.stateId,
      toStateId: upgrade.upgradeTo,
      cost: upgrade.cost,
      discardedUids,
    },
  };
  const newTableau = state.tableau.filter(uid => !discardedUids.includes(uid) && uid !== cardUid);
  const endEvt = buildTurnEndedEvent(newTableau, state.instances, defs, 'upgrade');
  const stateAfterTurn = reducer(
    reducer(state, upgradeEvent, defs, stickerDefs),
    endEvt,
    defs,
    stickerDefs,
  );

  const events = [upgradeEvent, endEvt];
  if (stateAfterTurn.deck.length > 0) {
    events.push(buildTurnStartedEvent(stateAfterTurn.turn + 1, stateAfterTurn.deck));
  }

  return { events, pendingChoice: PENDING_UNCHANGED };
}
