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
  ResolvedAction,
  TriggerEntry,
  Effect,
} from '@engine/domain/types';
import { PendingChoiceType } from '@engine/domain/enums';
import {
  loadCardDefs,
  loadStickerDefs,
  loadInitialStickerStock,
} from '@engine/infrastructure/loaders';
import { createInstance } from '@engine/infrastructure/factory';
import { saveGame, loadSave, deleteSave, hasSave } from '@engine/infrastructure/persistence';
import {
  getActiveState,
  getEffectiveProductions,
  canAffordResources,
} from '@engine/application/cardHelpers';
import { computeScore } from '@engine/application/gameStateHelper';
import { mergeResources } from '@engine/application/resourceHelpers';
import deckData from '@data/deck.json';
import { resolveActionEffect } from '@engine/application/effectResolver';
import { resolveCost } from '@engine/application/costResolver';

// ─── Types ───────────────────────────────────────────────────────────────────

export type GameHook = {
  state: GameState;
  events: GameEvent[];
  defs: Record<number, CardDef>;
  stickerDefs: Record<number, Sticker>;
  score: number;
  pendingChoices: PendingChoice[] | null;
  triggerPile: Record<string, TriggerEntry> | null;
  hasSave: boolean;
  loadGame: () => void;
  deleteSave: () => void;
  startGame: () => void;
  startRound: () => void;
  startTurn: () => void;
  resolveProduction: (instanceId: number, chosenResource?: Resources) => void;
  resolveAction: (instanceId: number, actionId: string) => void;
  resolveUpgrade: (instanceId: number, chosenUpgradeTo?: number) => void;
  progress: () => void;
  endTurnVoluntary: () => void;
  resolvePlayerChoice: (choice: ResolvedAction) => void;
  resolvePayCost: (resolved: ResolvedCost) => void;
  skipTrigger: (uuid: string) => void;
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
  const [pendingChoices, setPendingChoices] = useState<PendingChoice[] | null>(null);
  const [triggerPile, setTriggerPile] = useState<Record<string, TriggerEntry> | null>(null);
  const currentProductionRef = useRef<{
    instanceId: number;
    resources: Resources;
  } | null>(null);
  const currentActionRef = useRef<{
    instanceId: number;
    action: Effect;
    resolvedCost: ResolvedCost | null;
    resolvedAction: ResolvedAction[];
    triggerId: string;
  } | null>(null);

  const triggerAction = useCallback(
    (instanceId: number, effect: Effect, resolvedCost: ResolvedCost, triggerId: string) => {
      const gs = aggRef.current.getGameState();
      const inst = gs.instances[instanceId];
      if (!inst || Object.values(gs.blockingCards).includes(instanceId)) return;
      if (!effect) return;

      // Resolve all effects of the action and gather any pending choices needed to resolve them
      const effects: ResolvedAction[] = [];
      const choices: PendingChoice[] = [];
      for (const eff of effect.actions) {
        const [resolvedAction, pendingChoices] = resolveActionEffect(eff, instanceId, gs, defs);

        effects.push(resolvedAction);
        choices.push(...pendingChoices);
      }

      // If there are pending choices to resolve the effects, set them and return early to wait for resolution
      if (choices.length > 0) {
        currentActionRef.current = {
          instanceId,
          action: effect,
          resolvedCost,
          resolvedAction: effects,
          triggerId,
        };
        setPendingChoices(choices);
        return;
      }

      // If no pending choices are needed to resolve the effects, proceed to trigger the action immediately
      return aggRef.current.useCardEffect(
        effects,
        resolvedCost,
        !effect.passive && !effect.trigger,
        triggerId,
      );
    },
    [defs],
  );

  // ── Synchronisation aggregate → React state ───────────────────────────────

  const sync = useCallback(() => {
    const gs = aggRef.current.getGameState();
    setLiveState(gs);
    saveGame(aggRef.current.getEvents(), aggRef.current.getSaveState());

    // If there's only one trigger in the trigger pile, automatically set it as the only pending choice. Otherwise, if there are multiple triggers, set a pending choice to ask the player to choose which one to resolve.
    if (Object.entries(gs.triggerPile).length === 1) {
      const [triggerId, trigger] = Object.entries(gs.triggerPile)[0];

      const event = triggerAction(
        trigger.sourceInstanceId,
        trigger.effectDef,
        {
          destroyedCardIds: [],
          discardedCardIds: [],
          resources: {},
        },
        triggerId,
      );

      if (event) setEvents([...events, event]);
    } else if (Object.entries(gs.triggerPile).length > 1) {
      setTriggerPile(gs.triggerPile);
    }
  }, [events, triggerAction]);

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
    setEvents([...agg.getEvents()]);
    sync();
  }, [sync]);

  const deleteSaveCallback = useCallback(() => {
    deleteSave();
    aggRef.current = makeAggregate();
    setEvents([]);
    setLiveState({ ...EMPTY_STATE });
  }, []);

  // ── Démarrage ─────────────────────────────────────────────────────────────

  const startGame = useCallback(() => {
    const deckEntries = (deckData.deck as { id: number; cardId: number }[]).sort(
      (a, b) => a.id - b.id,
    );
    const starterEntries = deckEntries.slice(0, 10);
    const discoveryEntries = deckEntries.filter(e => e.id > 10);

    const allInstances = [...starterEntries, ...discoveryEntries].map(entry =>
      createInstance(entry.id, entry.cardId, defs[entry.cardId].states[0].id, defs),
    );

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

  const startRound = useCallback(() => {
    const event = aggRef.current.roundStarted();
    setEvents([...events, event]);
    sync();
  }, [events, sync]);

  const startTurn = useCallback(() => {
    const event = aggRef.current.turnStarted();
    if (!event) return;
    setEvents([...events, event]);
    sync();
  }, [events, sync]);

  // ── Actions de carte ──────────────────────────────────────────────────────

  const triggerProduction = useCallback(
    (instanceId: number, resourcesGained: Record<string, number>) => {
      const event = aggRef.current.cardProduced(instanceId, resourcesGained);
      setEvents([...events, event]);
      sync();
    },
    [events, sync],
  );

  const resolveProduction = useCallback(
    (instanceId: number) => {
      const gs = aggRef.current.getGameState();
      const inst = gs.instances[instanceId];
      if (!inst || Object.values(gs.blockingCards).includes(instanceId)) return;

      const cs = getActiveState(inst, defs);
      const productions = cs.productions ?? [];

      // If there are multiple possible productions and the player hasn't chosen one yet, set a pending choice to ask them to choose
      if (productions.length > 1) {
        currentProductionRef.current = { instanceId, resources: {} };
        setPendingChoices([
          {
            id: `${instanceId}-production`,
            kind: 'production',
            type: PendingChoiceType.CHOOSE_RESOURCE,
            sourceInstanceId: instanceId,
            choices: productions,
            pickCount: 1,
          },
        ]);
        return;
      }

      // If there's only one possible production proceed to apply the production immediately
      const raw = cs.productions;
      const base: Resources = (raw as Resources[] | undefined)?.[0] ?? {};
      const resourcesGained = getEffectiveProductions(base, inst, stickerDefs);
      triggerProduction(instanceId, resourcesGained);
    },
    [defs, triggerProduction, stickerDefs],
  );

  const resolveAction = useCallback(
    (instanceId: number, actionId: string) => {
      const gs = aggRef.current.getGameState();
      const inst = gs.instances[instanceId];
      if (!inst || Object.values(gs.blockingCards).includes(instanceId)) return;
      const cs = getActiveState(inst, defs);
      const action = cs.cardEffects?.find(ce => ce.label === actionId);
      if (!action) return;
      if (!canAffordResources(gs.resources, action.cost ?? {})) return;

      // get resolved cost and check if any pending choices are needed to pay it
      const [resolvedCost, costPendingChoices] = resolveCost(
        action.cost ?? {},
        instanceId,
        gs,
        defs,
      );

      // if there are pending choices to pay the cost, set them and return early to wait for resolution
      if (costPendingChoices.length > 0) {
        currentActionRef.current = {
          instanceId,
          action,
          resolvedCost,
          resolvedAction: [],
          triggerId: crypto.randomUUID(),
        };
        setPendingChoices(costPendingChoices);
        return;
      }

      // if no pending choices are needed to pay the cost, proceed to trigger the action immediately
      const event = triggerAction(instanceId, action, resolvedCost, crypto.randomUUID());
      if (event) setEvents([...events, event]);
      sync();
    },
    [triggerAction, defs, events, sync],
  );

  const resolveUpgrade = useCallback(
    (instanceId: number, chosenUpgradeTo?: number) => {
      const gs = aggRef.current.getGameState();
      const inst = gs.instances[instanceId];
      if (!inst || Object.values(gs.blockingCards).includes(instanceId)) return;
      const cs = getActiveState(inst, defs);
      const upgrades = cs.upgrade ?? [];
      if (upgrades.length === 0) return;

      const upgrade =
        chosenUpgradeTo !== undefined
          ? upgrades.find(u => u.upgradeTo === chosenUpgradeTo)
          : upgrades[0];
      if (!upgrade) return;
      if (!canAffordResources(gs.resources, upgrade.cost)) return;

      const event = aggRef.current.upgradeCard(
        instanceId,
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

  // This function is called when the player has made a choice needed.
  const resolvePlayerChoice = useCallback(
    (choice: ResolvedAction) => {
      // This function handles the resolution of a pending choice, whether it's for choosing a production, paying an action cost, or any other type of choice. It checks the current pending choice and applies the appropriate logic to resolve it, then triggers any resulting events and synchronizes the state.
      if (currentProductionRef.current) {
        const { instanceId } = currentProductionRef.current;
        const gs = aggRef.current.getGameState();
        const inst = gs.instances[instanceId];
        if (!inst || Object.values(gs.blockingCards).includes(instanceId)) return;

        const base = choice.resources || {};
        const resourcesGained = getEffectiveProductions(base, inst, stickerDefs);
        triggerProduction(instanceId, resourcesGained);
        currentProductionRef.current = null;
      }

      // If the resolved choice is for an action, merge any resolved cost with the current resolved cost and check if there are any pending choices left to resolve for the action. If not, trigger the action.
      if (currentActionRef.current) {
        const { instanceId, action } = currentActionRef.current;
        const gs = aggRef.current.getGameState();
        const inst = gs.instances[instanceId];
        if (!inst || Object.values(gs.blockingCards).includes(instanceId)) return;
        if (!action) return;

        // Merge the resolved choice with any previously resolved part of the action
        currentActionRef.current.resolvedAction = currentActionRef.current.resolvedAction.map(
          ra => {
            if (ra.id === choice.id) {
              return { ...ra, ...choice };
            }
            return ra;
          },
        );

        pendingChoices?.shift();
        // If there are no more pending choices to resolve for the action, trigger it
        if (pendingChoices?.length === 0) {
          const resolvedAction = currentActionRef.current.resolvedAction;
          const resolvedCost = currentActionRef.current.resolvedCost;
          const triggerId = currentActionRef.current.triggerId;
          currentActionRef.current = null;
          const event = aggRef.current.useCardEffect(
            resolvedAction,
            resolvedCost ?? { resources: {}, discardedCardIds: [], destroyedCardIds: [] },
            !action.passive && !action.trigger,
            triggerId,
          );
          setEvents([...events, event]);
          sync();
          setPendingChoices(pendingChoices);
        }
      }
    },
    [events, sync, pendingChoices, triggerProduction, stickerDefs],
  );

  // This function is called when the player has made a choice needed to pay an action's cost.
  const resolvePayCost = useCallback(
    (resolved: ResolvedCost) => {
      if (!resolved) return;
      if (!currentActionRef.current) return;

      // Merge resolved cost with any previously resolved part of the cost
      currentActionRef.current.resolvedCost = {
        resources: mergeResources(
          currentActionRef.current.resolvedCost?.resources ?? {},
          resolved.resources,
        ),
        discardedCardIds: [
          ...(currentActionRef.current.resolvedCost?.discardedCardIds ?? []),
          ...resolved.discardedCardIds,
        ],
        destroyedCardIds: [
          ...(currentActionRef.current.resolvedCost?.destroyedCardIds ?? []),
          ...resolved.destroyedCardIds,
        ],
      };

      setPendingChoices(prev => {
        const updated = prev ? [...prev] : [];
        updated.shift();
        return updated.length ? updated : null;
      });
      const event = triggerAction(
        currentActionRef.current.instanceId,
        currentActionRef.current.action,
        currentActionRef.current.resolvedCost,
        currentActionRef.current.triggerId,
      );
      if (event) setEvents([...events, event]);
      sync();
    },
    [triggerAction, events, sync],
  );

  // ── Rembobinage ───────────────────────────────────────────────────────────

  // const skipTrigger = useCallback((uuid: string) => {
  //   setTriggerPile(prev => {
  //     const updated = { ...prev };
  //     delete updated[uuid];
  //     return Object.keys(updated).length > 0 ? updated : null;
  //   });
  // }, []);

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
  }, [events, sync]);

  // ── Résultat ──────────────────────────────────────────────────────────────

  return {
    state: liveState,
    events,
    defs,
    stickerDefs,
    score,
    pendingChoices,
    triggerPile,
    hasSave: hasSave(),
    loadGame,
    deleteSave: deleteSaveCallback,
    startGame,
    startRound,
    startTurn,
    resolveProduction,
    resolveAction,
    resolveUpgrade,
    progress,
    endTurnVoluntary,
    resolvePlayerChoice,
    resolvePayCost,
    skipTrigger: () => {}, // skipTrigger, --- IGNORE ---
    canRewind,
    rewindEvent,
  };
}
