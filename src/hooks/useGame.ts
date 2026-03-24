/**
 * @file useGame.ts
 * Hook React central — point d'entrée unique entre l'UI et le moteur de jeu.
 *
 * Responsabilités :
 * - Maintenir la liste d'événements (`events`) et l'état courant (`liveState`).
 * - Exposer des actions typées (startGame, activateCard, resolveChoice…) aux composants.
 * - Dispatcher les `ActionResult` retournés par le moteur (événements + pendingChoice + resourceDelta).
 * - Sauvegarder automatiquement dans localStorage quand l'état est stable.
 * - Gérer le rembobinage (rewindToEvent) pour l'historique interactif.
 *
 * Architecture :
 *   UI → useGame (dispatch) → moteur pur → ActionResult → reducer → nouveau state
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  type GameState,
  type GameEvent,
  type CardDef,
  type StickerDef,
  type Resources,
  type PendingChoice,
  type ActionResult,
  PENDING_UNCHANGED,
  computeScore,
  mergeResources,
  getActiveState,
  type CardPassive,
  type CardPassiveEffect,
} from '@engine/types';
import { reducer, EMPTY_STATE, replayEvents } from '@engine/reducer';
import { saveGame, loadSave, deleteSave, hasSave } from '@engine/persistence';
import { loadCardDefs, loadStickerDefs, buildGameStartedEvent } from '@engine/init';
import {
  checkOnPlayTriggers,
  computeStartRound,
  computeStartTurn,
  computeEndTurnVoluntary,
  computeProgress,
} from '@engine/turnFlow';
import {
  computeActivateCard,
  computeResolveAction,
  computeResolveUpgrade,
} from '@engine/cardActions';
import {
  computeResolveChoice,
  computeResolveChooseState,
  computeResolveResourceChoice,
  computeResolveCopyProduction,
  computeResolveBlockCard,
  computeResolvePlayFromDiscard,
  computeResolveDiscardCost,
} from '@engine/choiceHandlers';

export type GameHook = {
  state: GameState;
  events: GameEvent[];
  defs: Record<number, CardDef>;
  stickerDefs: Record<number, StickerDef>;
  score: number;
  canDiscardTopCard: boolean;
  hasSave: boolean;
  loadGame: () => void;
  deleteSave: () => void;
  startGame: () => void;
  startRound: () => void;
  startTurn: () => void;
  activateCard: (cardUid: string, chosenResource?: Resources) => void;
  resolveAction: (actionCardUid: string, actionId: string) => void;
  resolveUpgrade: (cardUid: string, chosenUpgradeTo?: number) => void;
  progress: () => void;
  endTurnVoluntary: () => void;
  discardTopCard: () => void;
  resolveChoice: (chosenCardIds: number[]) => void;
  resolvePlayFromDiscard: (chosenUids: string[]) => void;
  resolveResourceChoice: (chosen: Resources) => void;
  resolveCopyProduction: (targetUid: string) => void;
  resolveChooseState: (chosenStateId: number) => void;
  resolveBlockCard: (targetUid: string) => void;
  resolveDiscardCost: (chosenUid: string) => void;
  cancelDiscardCost: () => void;
  currentTurnStartIndex: number;
  rewindToEvent: (index: number) => void;
};

export function useGame(): GameHook {
  const defs = useMemo(() => loadCardDefs(), []);
  const stickerDefs = useMemo(() => loadStickerDefs(), []);

  const [events, setEvents] = useState<GameEvent[]>([]);
  const [liveState, setLiveState] = useState<GameState>(EMPTY_STATE);

  useEffect(() => {
    if (events.length > 0 && liveState.pendingChoice === null) saveGame(events, liveState);
  }, [events.length, liveState.pendingChoice]); // eslint-disable-line react-hooks/exhaustive-deps

  // Score recalculé uniquement quand l'état change (somme de toutes les gloires des cartes).
  const score = useMemo(() => computeScore(liveState, defs), [liveState, defs]);

  // Vrai si une carte en jeu possède l'effet passif `can_discard_top_card`.
  const canDiscardTopCard = useMemo(() => {
    const inPlay = [...liveState.tableau, ...liveState.permanents];
    return inPlay.some(uid => {
      const inst = liveState.instances[uid];
      if (!inst) return false;
      const cs = getActiveState(inst, defs);
      return (cs.passives ?? cs.passifs ?? []).some((p: CardPassive) =>
        p.effects?.some((e: CardPassiveEffect) => e.type === 'can_discard_top_card'),
      );
    });
  }, [liveState, defs]);

  // ─── Dispatch ──────────────────────────────────────────────────────────────

  const dispatch = useCallback(
    (event: GameEvent) => {
      setLiveState(prev => reducer(prev, event, defs, stickerDefs));
      setEvents(prev => [...prev, event]);
    },
    [defs, stickerDefs],
  );

  /**
   * Applique un `ActionResult` retourné par une fonction du moteur :
   * 1. Dispatche chaque événement (met à jour state + history).
   * 2. Si `pendingChoice !== PENDING_UNCHANGED`, met à jour le choix en attente.
   * 3. Si `resourceDelta` est présent, ajoute les ressources directement (sans événement).
   */
  const applyResult = useCallback(
    (result: ActionResult) => {
      for (const event of result.events) {
        dispatch(event);
      }
      const hasPending = result.pendingChoice !== PENDING_UNCHANGED;
      const hasDelta = result.resourceDelta !== undefined;
      if (hasPending || hasDelta) {
        setLiveState(prev => {
          let next = prev;
          if (hasPending)
            next = { ...next, pendingChoice: result.pendingChoice as PendingChoice | null };
          if (hasDelta)
            next = {
              ...next,
              resources: mergeResources(next.resources, result.resourceDelta ?? {}),
            };
          return next;
        });
      }
    },
    [dispatch],
  );

  // ─── Chargement ───────────────────────────────────────────────────────────

  const loadGame = useCallback(() => {
    const save = loadSave();
    if (!save || save.events.length === 0) return;
    const restored = replayEvents(save.events, defs, stickerDefs);
    setEvents(save.events);
    setLiveState(
      save.pendingChoice != null ? { ...restored, pendingChoice: save.pendingChoice } : restored,
    );
  }, [defs, stickerDefs]);

  const deleteSaveCallback = useCallback(() => {
    deleteSave();
    setEvents([]);
    setLiveState(EMPTY_STATE);
  }, []);

  // ─── Démarrage ────────────────────────────────────────────────────────────

  const startGame = useCallback(() => {
    const { event } = buildGameStartedEvent(defs);
    const newState = reducer(EMPTY_STATE, event, defs, stickerDefs);
    setLiveState(newState);
    setEvents([event]);
  }, [defs, stickerDefs]);

  const startRound = useCallback(() => {
    applyResult(computeStartRound(liveState, defs, stickerDefs));
  }, [liveState, defs, stickerDefs, applyResult]);

  const startTurn = useCallback(() => {
    applyResult(computeStartTurn(liveState, defs, stickerDefs));
  }, [liveState, defs, stickerDefs, applyResult]);

  // ─── Actions de carte ─────────────────────────────────────────────────────

  const activateCard = useCallback(
    (cardUid: string, chosenResource?: Resources) => {
      applyResult(computeActivateCard(liveState, cardUid, defs, chosenResource));
    },
    [liveState, defs, applyResult],
  );

  const resolveAction = useCallback(
    (actionCardUid: string, actionId: string) => {
      applyResult(computeResolveAction(liveState, actionCardUid, actionId, defs, stickerDefs));
    },
    [liveState, defs, stickerDefs, applyResult],
  );

  const resolveUpgrade = useCallback(
    (cardUid: string, chosenUpgradeTo?: number) => {
      applyResult(computeResolveUpgrade(liveState, cardUid, defs, stickerDefs, chosenUpgradeTo));
    },
    [liveState, defs, stickerDefs, applyResult],
  );

  // ─── Flux de tour ─────────────────────────────────────────────────────────

  const progress = useCallback(() => {
    applyResult(computeProgress(liveState, defs, stickerDefs));
  }, [liveState, defs, stickerDefs, applyResult]);

  const endTurnVoluntary = useCallback(() => {
    applyResult(computeEndTurnVoluntary(liveState, defs, stickerDefs));
  }, [liveState, defs, stickerDefs, applyResult]);

  const discardTopCard = useCallback(() => {
    if (!canDiscardTopCard || liveState.deck.length === 0) return;
    dispatch({ type: 'CARD_DESTROYED', payload: { cardUid: liveState.deck[0], fromZone: 'deck' } });
  }, [canDiscardTopCard, liveState.deck, dispatch]);

  // ─── Résolution de choix ──────────────────────────────────────────────────

  const resolveChoice = useCallback(
    (chosenCardIds: number[]) => {
      applyResult(computeResolveChoice(liveState, chosenCardIds, defs));
    },
    [liveState, defs, applyResult],
  );

  const resolveChooseState = useCallback(
    (chosenStateId: number) => {
      applyResult(computeResolveChooseState(liveState, chosenStateId));
    },
    [liveState, applyResult],
  );

  const resolveResourceChoice = useCallback(
    (chosen: Resources) => {
      applyResult(computeResolveResourceChoice(liveState, chosen));
    },
    [liveState, applyResult],
  );

  const resolveCopyProduction = useCallback(
    (targetUid: string) => {
      applyResult(computeResolveCopyProduction(liveState, targetUid, defs));
    },
    [liveState, defs, applyResult],
  );

  const resolveBlockCard = useCallback(
    (targetUid: string) => {
      applyResult(computeResolveBlockCard(liveState, targetUid));
    },
    [liveState, applyResult],
  );

  const resolvePlayFromDiscard = useCallback(
    (chosenUids: string[]) => {
      applyResult(computeResolvePlayFromDiscard(liveState, chosenUids));
    },
    [liveState, applyResult],
  );

  const resolveDiscardCost = useCallback(
    (chosenUid: string) => {
      applyResult(computeResolveDiscardCost(liveState, chosenUid, defs, stickerDefs));
    },
    [liveState, defs, stickerDefs, applyResult],
  );

  const cancelDiscardCost = useCallback(() => {
    setLiveState(prev => ({ ...prev, pendingChoice: null }));
  }, []);

  // ─── Rembobinage ──────────────────────────────────────────────────────────

  // Index du dernier TURN_STARTED ou PROGRESSED dans l'historique.
  // Limite le rembobinage : on ne peut pas revenir avant le début du tour actuel.
  const currentTurnStartIndex = useMemo(() => {
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].type === 'TURN_STARTED' || events[i].type === 'PROGRESSED') return i;
    }
    return -1;
  }, [events]);

  /**
   * Rembobine la partie jusqu'à l'événement à l'index donné.
   * - Clampe l'index au début du tour courant (on ne peut pas revenir à un tour précédent).
   * - Rejoue tous les événements jusqu'à cet index pour reconstruire l'état.
   * - Re-déclenche les `on_play` triggers du tour pour restaurer les choix en attente éventuels.
   */
  const rewindToEvent = useCallback(
    (index: number) => {
      if (currentTurnStartIndex === -1) return;
      const clampedIndex = Math.max(index, currentTurnStartIndex);
      if (clampedIndex >= events.length) return;
      const truncated = events.slice(0, clampedIndex + 1);
      const rewound = replayEvents(truncated, defs, stickerDefs);
      setEvents(truncated);
      setLiveState(rewound);
      // Re-déclencher on_play (ex: block_card du Bandit) sur l'état rembobiné
      const turnEvent = truncated
        .slice()
        .reverse()
        .find(e => e.type === 'TURN_STARTED' || e.type === 'PROGRESSED');
      if (turnEvent) {
        const drawnUids = (turnEvent.payload as { drawnUids: string[] }).drawnUids;
        const pending = checkOnPlayTriggers(drawnUids, rewound, defs);
        if (pending) setLiveState(prev => ({ ...prev, pendingChoice: pending }));
      }
    },
    [events, currentTurnStartIndex, defs, stickerDefs],
  );

  return {
    state: liveState,
    events,
    defs,
    stickerDefs,
    score,
    canDiscardTopCard,
    hasSave: hasSave(),
    loadGame,
    deleteSave: deleteSaveCallback,
    startGame,
    startRound,
    startTurn,
    activateCard,
    resolveAction,
    resolveUpgrade,
    progress,
    endTurnVoluntary,
    discardTopCard,
    resolveChoice,
    resolvePlayFromDiscard,
    resolveResourceChoice,
    resolveCopyProduction,
    resolveChooseState,
    resolveBlockCard,
    resolveDiscardCost,
    cancelDiscardCost,
    currentTurnStartIndex,
    rewindToEvent,
  };
}
