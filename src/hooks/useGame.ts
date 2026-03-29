import { useState, useCallback, useMemo, useRef } from 'react';
import { EMPTY_STATE, GameAggregate } from '@engine/application/aggregates/GameAggregate';
import type {
  GameState,
  GameEvent,
  CardDef,
  Sticker,
  Resources,
  PendingChoice,
  ResolvedCost,
} from '@engine/domain/types';
import { EffectType } from '@engine/domain/enums';
import {
  loadCardDefs,
  loadStickerDefs,
  loadInitialStickerStock,
} from '@engine/infrastructure/loaders';
import { createInstance, resetUidCounter, shuffle } from '@engine/infrastructure/factory';
import { saveGame, loadSave, deleteSave, hasSave } from '@engine/infrastructure/persistence';
import {
  getActiveState,
  getEffectiveProductions,
  canAffordResources,
} from '@engine/application/cardHelpers';
import { computeScore } from '@engine/application/gameStateHelper';
import { mergeResources } from '@engine/application/resourceHelpers';
import deckData from '@data/deck.json';

// ─── Types ───────────────────────────────────────────────────────────────────

export type GameHook = {
  state: GameState;
  events: GameEvent[];
  defs: Record<number, CardDef>;
  stickerDefs: Record<number, Sticker>;
  score: number;
  pendingChoice: PendingChoice | null;
  hasSave: boolean;
  loadGame: () => void;
  deleteSave: () => void;
  startGame: () => void;
  startRound: () => void;
  startTurn: () => void;
  activateCard: (cardUid: string, chosenResource?: Resources) => void;
  resolveAction: (cardUid: string, actionId: string) => void;
  resolveUpgrade: (cardUid: string, chosenUpgradeTo?: number) => void;
  progress: () => void;
  endTurnVoluntary: () => void;
  resolveChoice: (chosenCardIds: number[]) => void;
  resolvePlayFromDiscard: (chosenUids: string[]) => void;
  resolveResourceChoice: (chosen: Resources) => void;
  resolveCopyProduction: (targetUid: string) => void;
  resolveChooseState: (chosenStateId: number) => void;
  resolveBlockCard: (targetUid: string) => void;
  resolveDiscardCost: (chosenUid: string) => void;
  cancelDiscardCost: () => void;
  canRewind: () => boolean;
  rewindEvent: () => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeAggregate(state?: GameState): GameAggregate {
  return new GameAggregate(
    [],
    state ? (JSON.parse(JSON.stringify(state)) as GameState) : { ...EMPTY_STATE },
    loadCardDefs(),
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGame(): GameHook {
  const defs = useMemo(() => loadCardDefs(), []);
  const stickerDefs = useMemo(() => loadStickerDefs(), []);
  const aggRef = useRef<GameAggregate>(makeAggregate());
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [liveState, setLiveState] = useState<GameState>({ ...EMPTY_STATE });
  const [pendingChoice, setPendingChoice] = useState<PendingChoice | null>(null);

  // ── Synchronisation aggregate → React state ───────────────────────────────

  const sync = useCallback(() => {
    const gs = aggRef.current.getGameState();
    setLiveState(gs);
    saveGame(aggRef.current.getEvents(), aggRef.current.getSaveState());
  }, []);

  // ── Score ─────────────────────────────────────────────────────────────────

  const score = useMemo(
    () => computeScore(liveState, defs, stickerDefs),
    [liveState, defs, stickerDefs],
  );

  // ── Persistance ───────────────────────────────────────────────────────────

  const loadGame = useCallback(() => {
    const save = loadSave();
    if (!save) return;
    const agg = makeAggregate(save.saveState);
    agg.loadFromHistory(save.events);
    aggRef.current = agg;
    setLiveState(agg.getGameState());
    setEvents([...agg.getEvents()]);
  }, []);

  const deleteSaveCallback = useCallback(() => {
    deleteSave();
    aggRef.current = makeAggregate();
    setEvents([]);
    setLiveState({ ...EMPTY_STATE });
  }, []);

  // ── Démarrage ─────────────────────────────────────────────────────────────

  const startGame = useCallback(() => {
    resetUidCounter();
    const deckEntries = (deckData.deck as { id: number; cardId: number }[]).sort(
      (a, b) => a.id - b.id,
    );
    const starterEntries = deckEntries.slice(0, 10);
    const discoveryEntries = shuffle(deckEntries.filter(e => e.id > 10));

    const allInstances = [...starterEntries, ...discoveryEntries].map(entry => ({
      ...createInstance(entry.cardId, defs[entry.cardId].states[0].id, defs),
      deckEntryId: entry.id,
    }));

    const initialDeck = starterEntries.map((_, i) => allInstances[i].id);
    const discoveryPile = discoveryEntries.map(
      (_, i) => allInstances[starterEntries.length + i].id,
    );

    const agg = makeAggregate();
    const startEvent = agg.gameStarted(
      allInstances,
      initialDeck,
      loadInitialStickerStock() as Record<string, number>,
      discoveryPile,
    );

    const roundEvent = agg.roundStarted();
    const turnEvent = agg.turnStarted();
    const events: GameEvent[] = [startEvent, roundEvent];
    if (turnEvent) events.push(turnEvent);
    aggRef.current = agg;
    setEvents(events);
    sync();
  }, [defs, sync]);

  const startTurn = useCallback(() => {
    const event = aggRef.current.turnStarted();
    if (!event) return;
    setEvents([...events, event]);
    const evts = aggRef.current.getEvents();
    const gs = aggRef.current.getGameState();

    setLiveState(gs);
    setEvents([...evts]);
  }, [events]);

  const startRound = useCallback(() => {
    const event = aggRef.current.roundStarted();
    setEvents([...events, event]);
    sync();
  }, [events, sync]);

  // ── Actions de carte ──────────────────────────────────────────────────────

  const activateCard = useCallback(
    (cardUid: string, chosenResource?: Resources) => {
      const gs = aggRef.current.getGameState();
      const inst = gs.instances[cardUid];
      if (!inst || Object.values(gs.blockingCards).includes(cardUid)) return;

      const cs = getActiveState(inst, defs);
      const productions = cs.productions ?? [];

      if (productions.length > 1 && chosenResource === undefined) {
        setPendingChoice({
          kind: 'choose_resource',
          source: 'activation',
          cardUid,
          options: productions,
        });
        return;
      }

      const resourcesGained = chosenResource ?? getEffectiveProductions(cs, inst, stickerDefs);
      const event = aggRef.current.cardProduced(cardUid, resourcesGained as Record<string, number>);
      setEvents([...events, event]);
      sync();
    },
    [events, defs, stickerDefs, sync],
  );

  const resolveAction = useCallback(
    (cardUid: string, actionId: string) => {
      const gs = aggRef.current.getGameState();
      const inst = gs.instances[cardUid];
      if (!inst || Object.values(gs.blockingCards).includes(cardUid)) return;
      const cs = getActiveState(inst, defs);
      const action = cs.cardEffects?.find(ce => ce.label === actionId);
      if (!action) return;
      if (!canAffordResources(gs.resources, action.cost ?? {})) return;

      if ((action.cost?.discard?.length ?? 0) > 0) {
        const candidates = gs.board.filter(uid => uid !== cardUid);
        if (candidates.length === 0) return;
        setPendingChoice({
          kind: 'discard_for_cost',
          actionCardUid: cardUid,
          actionId,
          candidates,
          remainingScopes: (action.cost?.discard ?? []).slice(1),
          collectedUids: [],
        });
        return;
      }

      // Effets différés nécessitant un choix
      for (const eff of action.effects) {
        if (eff.type === EffectType.DISCOVER_CARD) {
          const e = eff as { cards?: number[]; number?: number };
          setPendingChoice({
            kind: 'discover_card',
            actionCardUid: cardUid,
            actionLabel: actionId,
            candidates: e.cards ?? [],
            pickCount: e.number ?? 1,
          });
          return;
        }
        if (eff.type === EffectType.ADD_RESOURCES) {
          const e = eff as { resources?: Resources[] };
          if ((e.resources?.length ?? 0) > 1) {
            setPendingChoice({
              kind: 'choose_resource',
              source: 'action',
              cardUid,
              options: e.resources ?? [],
            });
            return;
          }
        }
      }

      const resolvedCost: ResolvedCost = {
        resources: action.cost?.resources?.[0] ?? {},
        discardedCardIds: [],
        destroyedCardIds: [],
      };
      const effects = action.effects.map(e => ({ type: e.type, payload: e }));
      const event = aggRef.current.useCardEffect(effects, resolvedCost, `${cardUid}_${actionId}`);
      setEvents([...events, event]);
      sync();
    },
    [events, defs, sync],
  );

  const resolveUpgrade = useCallback(
    (cardUid: string, chosenUpgradeTo?: number) => {
      const gs = aggRef.current.getGameState();
      const inst = gs.instances[cardUid];
      if (!inst || Object.values(gs.blockingCards).includes(cardUid)) return;
      const cs = getActiveState(inst, defs);
      const upgrades = cs.upgrade ?? [];
      if (upgrades.length === 0) return;

      if (upgrades.length > 1 && chosenUpgradeTo === undefined) {
        setPendingChoice({ kind: 'choose_upgrade', cardUid, options: upgrades });
        return;
      }

      const upgrade =
        chosenUpgradeTo !== undefined
          ? upgrades.find(u => u.upgradeTo === chosenUpgradeTo)
          : upgrades[0];
      if (!upgrade) return;
      if (!canAffordResources(gs.resources, upgrade.cost)) return;

      const event = aggRef.current.upgradeCard(
        cardUid,
        upgrade.upgradeTo,
        upgrade.cost.resources?.[0] ?? {},
      );
      setEvents([...events, event]);
      sync();
    },
    [events, defs, sync],
  );

  // ── Flux de tour ──────────────────────────────────────────────────────────

  const progress = useCallback(() => {
    const event = aggRef.current.advance();
    if (!event) return;
    setEvents([...events, event]);
    sync();
  }, [events, sync]);

  const endTurnVoluntary = useCallback(() => {
    const event = aggRef.current.pass();
    setEvents([...events, event]);
    sync();
  }, [events, sync]);

  // ── Résolution de choix ───────────────────────────────────────────────────

  const resolveChoice = useCallback(
    (chosenCardIds: number[]) => {
      if (!pendingChoice || pendingChoice.kind !== 'discover_card') return;
      // La découverte de carte : déplacer de discoveryPile vers drawPile
      // On utilise PLACE_CARD_IN_DRAW_PILE via useCardEffect
      for (const cardId of chosenCardIds) {
        const gs = aggRef.current.getGameState();
        const uid = gs.discoveryPile.find(u => gs.instances[u]?.cardId === cardId);
        if (!uid) continue;
        const resolvedCost: ResolvedCost = {
          resources: {},
          discardedCardIds: [],
          destroyedCardIds: [],
        };
        aggRef.current.useCardEffect(
          [
            {
              type: EffectType.PLACE_CARD_IN_DRAW_PILE,
              payload: { cardId: uid, position: 'bottom' },
            },
          ],
          resolvedCost,
          `discover_${uid}`,
        );
      }
      sync();
    },
    [pendingChoice, sync],
  );

  const resolveChooseState = useCallback(
    (chosenStateId: number) => {
      if (!pendingChoice || pendingChoice.kind !== 'choose_state') return;
      const inst = { ...pendingChoice.instance, stateId: chosenStateId };
      const resolvedCost: ResolvedCost = {
        resources: {},
        discardedCardIds: [],
        destroyedCardIds: [],
      };
      const effectType =
        pendingChoice.addedTo === 'permanents'
          ? EffectType.PLAY_CARD
          : EffectType.PLACE_CARD_IN_DRAW_PILE;
      aggRef.current.useCardEffect(
        [{ type: effectType, payload: { cardId: inst.id, position: 'bottom' } }],
        resolvedCost,
        `choose_state_${inst.id}`,
      );
      // Enchaîner sur le prochain choose_state si présent
      const remaining = pendingChoice.remaining ?? [];
      if (remaining.length > 0) {
        const [next, ...rest] = remaining;
        setPendingChoice({ kind: 'choose_state', ...next, remaining: rest });
      } else {
        sync();
      }
    },
    [pendingChoice, sync],
  );

  const resolveResourceChoice = useCallback(
    (chosen: Resources) => {
      if (!pendingChoice || pendingChoice.kind !== 'choose_resource') return;
      if (pendingChoice.source === 'activation') {
        activateCard(pendingChoice.cardUid, chosen);
      } else {
        // Source action : ajouter les ressources directement
        const resolvedCost: ResolvedCost = {
          resources: {},
          discardedCardIds: [],
          destroyedCardIds: [],
        };
        aggRef.current.useCardEffect(
          [{ type: EffectType.ADD_RESOURCES, payload: { resources: chosen } }],
          resolvedCost,
          `resource_choice_${Date.now()}`,
        );
        sync();
      }
    },
    [pendingChoice, activateCard, sync],
  );

  const resolveCopyProduction = useCallback(
    (targetUid: string) => {
      if (!pendingChoice || pendingChoice.kind !== 'copy_production') return;
      const gs = aggRef.current.getGameState();
      const inst = gs.instances[targetUid];
      if (!inst) {
        sync();
        return;
      }
      const cs = getActiveState(inst, defs);
      const productions = getEffectiveProductions(cs, inst, stickerDefs);
      const resolvedCost: ResolvedCost = {
        resources: {},
        discardedCardIds: [],
        destroyedCardIds: [],
      };
      aggRef.current.useCardEffect(
        [{ type: EffectType.ADD_RESOURCES, payload: { resources: productions } }],
        resolvedCost,
        `copy_production_${targetUid}`,
      );
      sync();
    },
    [pendingChoice, defs, stickerDefs, sync],
  );

  const resolveBlockCard = useCallback(
    (targetUid: string) => {
      if (!pendingChoice || pendingChoice.kind !== 'block_card') return;
      const resolvedCost: ResolvedCost = {
        resources: {},
        discardedCardIds: [],
        destroyedCardIds: [],
      };
      aggRef.current.useCardEffect(
        [
          {
            type: EffectType.BLOCK_CARD,
            payload: { blockingCardId: pendingChoice.blockerUid, blockedCardId: targetUid },
          },
        ],
        resolvedCost,
        `block_${pendingChoice.blockerUid}`,
      );
      sync();
    },
    [pendingChoice, sync],
  );

  const resolvePlayFromDiscard = useCallback(
    (chosenUids: string[]) => {
      if (!pendingChoice || pendingChoice.kind !== 'play_from_discard') return;
      const resolvedCost: ResolvedCost = {
        resources: {},
        discardedCardIds: [],
        destroyedCardIds: [],
      };
      for (const uid of chosenUids) {
        aggRef.current.useCardEffect(
          [{ type: EffectType.PLAY_CARD, payload: { cardId: uid } }],
          resolvedCost,
          `play_from_discard_${uid}`,
        );
      }
      sync();
    },
    [pendingChoice, sync],
  );

  const resolveDiscardCost = useCallback(
    (chosenUid: string) => {
      if (!pendingChoice || pendingChoice.kind !== 'discard_for_cost') return;
      const { actionCardUid, actionId, remainingScopes, collectedUids } = pendingChoice;
      const newCollected = [...collectedUids, chosenUid];

      if (remainingScopes.length > 0) {
        const gs = aggRef.current.getGameState();
        const candidates = gs.board.filter(
          uid => uid !== actionCardUid && !newCollected.includes(uid),
        );
        setPendingChoice({
          kind: 'discard_for_cost',
          actionCardUid,
          actionId,
          candidates,
          remainingScopes: remainingScopes.slice(1),
          collectedUids: newCollected,
        });
        return;
      }

      // Tous les coûts collectés → exécuter l'action
      const gs = aggRef.current.getGameState();
      const inst = gs.instances[actionCardUid];
      if (!inst) {
        sync();
        return;
      }
      const cs = getActiveState(inst, defs);
      const action = cs.cardEffects?.find(ce => ce.label === actionId);
      if (!action) {
        sync();
        return;
      }

      const resolvedCost: ResolvedCost = {
        resources: action.cost?.resources?.[0] ?? {},
        discardedCardIds: newCollected,
        destroyedCardIds: [],
      };
      const effects = action.effects.map(e => ({ type: e.type, payload: e }));
      aggRef.current.useCardEffect(effects, resolvedCost, `${actionCardUid}_${actionId}`);
      sync();
    },
    [pendingChoice, defs, sync],
  );

  const cancelDiscardCost = useCallback(() => {
    setPendingChoice(null);
  }, []);

  // ── Rembobinage ───────────────────────────────────────────────────────────

  const canRewind = useCallback(() => {
    const events = aggRef.current.getEvents();
    return events.length > 0;
  }, [aggRef]);

  const rewindEvent = useCallback(() => {
    const aggEvent = aggRef.current.getEvents();
    if (aggEvent.length === 0) return;
    const saveState = aggRef.current.getSaveState();
    const agg = makeAggregate(saveState);
    agg.loadFromHistory(aggEvent.slice(0, -1));
    aggRef.current = agg;
    const truncated = events.slice(0, -1);
    setEvents([...truncated]);
    sync();
  }, [events]);

  // ── Résultat ──────────────────────────────────────────────────────────────

  return {
    state: liveState,
    events,
    defs,
    stickerDefs,
    score,
    pendingChoice,
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
    resolveChoice,
    resolvePlayFromDiscard,
    resolveResourceChoice,
    resolveCopyProduction,
    resolveChooseState,
    resolveBlockCard,
    resolveDiscardCost,
    cancelDiscardCost,
    canRewind,
    rewindEvent,
  };
}

// Export pour compatibilité
export { mergeResources };
