import { useCallback, useMemo, useContext } from 'react';
import { EMPTY_STATE, GameAggregate } from '@engine/application/aggregates/GameAggregate';
import type {
  GameState,
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
import { loadInitialStickerStock } from '@engine/infrastructure/loaders';
import { createInstance } from '@engine/application/factory';
import { saveGame, loadSave, deleteSave } from '@engine/infrastructure/persistence';
import {
  getActiveState,
  getEffectiveProductions,
  canAffordResources,
} from '@engine/application/cardHelpers';
import { computeScore, getCurrentPhase, mergeResources } from '@engine/application/gameStateHelper';
import deckData from '@data/deck.json';
import { resolveActionEffect } from '@engine/application/effectResolver';
import { resolveCost } from '@engine/application/costResolver';
import { GameContext } from '@contexts/GameContext';
import type { Phase } from '@engine/domain/types/Phase';

// ─── Types ───────────────────────────────────────────────────────────────────

export type GameHook = {
  state: GameState;
  defs: Record<number, CardDef>;
  stickerDefs: Record<number, Sticker>;
  score: number;
  pendingChoices: PendingChoice[] | null;
  triggerPile: Record<string, TriggerEntry> | null;
  phase: Phase;
  loadGame: () => void;
  deleteSave: () => void;
  startGame: () => void;
  startRound: () => void;
  startTurn: () => void;
  resolveProduction: (instanceId: number, chosenResource?: Resources) => void;
  resolveAction: (instanceId: number, actionId: string) => void;
  resolveTrackStep: (instanceId: number, stepId: number) => void;
  resolveUpgrade: (instanceId: number, chosenUpgradeTo?: number) => void;
  progress: () => void;
  endTurnVoluntary: () => void;
  resolvePlayerChoice: (choice: ResolvedAction) => void;
  resolvePayCost: (resolved: ResolvedCost) => void;
  skipTrigger: (uuid: string) => void;
  skipChoice: (uuid: string) => void;
  canRewind: () => boolean;
  rewindEvent: () => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeAggregate(
  state: GameState = { ...EMPTY_STATE },
  cardDefs: Record<number, CardDef>,
): GameAggregate {
  return new GameAggregate([], JSON.parse(JSON.stringify(state)) as GameState, cardDefs);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGame(): GameHook {
  const {
    gameState,
    setGameState,
    defs,
    stickerDefs,
    aggRef,
    pendingChoices,
    setPendingChoices,
    triggerPile,
    setTriggerPile,
    currentProductionRef,
    currentActionRef,
  } = useContext(GameContext);

  const triggerAction = useCallback(
    (instanceId: number, effect: Effect, resolvedCost: ResolvedCost, triggerId: string) => {
      const gs = aggRef.current.getGameState();
      const inst = gs.instances[instanceId];
      const def = defs[inst.cardId];
      if (!inst || Object.values(gs.blockingCards).includes(instanceId)) return;
      if (!effect) return;

      // Resolve all effects of the action and gather any pending choices needed to resolve them
      const effects: ResolvedAction[] = [];
      const choices: PendingChoice[] = [];
      for (const eff of effect.actions) {
        const [resolvedAction, pendingChoices] = resolveActionEffect(
          eff,
          instanceId,
          gs,
          defs,
          true,
        );

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
        def.parchmentCard,
        triggerId,
      );
    },
    [defs, aggRef, setPendingChoices, currentActionRef],
  );

  // ── Synchronisation aggregate → React state ───────────────────────────────

  const sync = useCallback(() => {
    const gs = aggRef.current.getGameState();

    setGameState(gs);
    saveGame(aggRef.current.getEvents(), aggRef.current.getSaveState());

    const triggers = gs.triggerPile;
    // If there's only one non optional trigger in the trigger pile, automatically set it as the only pending choice.
    if (
      Object.entries(gs.triggerPile).length === 1 &&
      gs.triggerPile[Object.keys(gs.triggerPile)[0]].effectDef.optional !== true
    ) {
      const [triggerId, trigger] = Object.entries(gs.triggerPile)[0];

      delete triggers[triggerId];
      triggerAction(
        trigger.sourceInstanceId,
        trigger.effectDef,
        {
          destroyedCardIds: [],
          discardedCardIds: [],
          resources: {},
        },
        triggerId,
      );

      setGameState(aggRef.current.getGameState());
      saveGame(aggRef.current.getEvents(), aggRef.current.getSaveState());
    }

    setTriggerPile(triggers);
  }, [triggerAction, setGameState, aggRef, setTriggerPile]);

  // ── Score ─────────────────────────────────────────────────────────────────

  const score = useMemo(
    () => computeScore(gameState, defs, stickerDefs),
    [gameState, defs, stickerDefs],
  );

  const phase = useMemo(() => getCurrentPhase(gameState), [gameState]);

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

    const agg = makeAggregate(gameState, defs);
    agg.gameStarted(
      allInstances,
      initialDeck,
      loadInitialStickerStock() as Record<string, number>,
      discoveryPile,
    );

    agg.roundStarted();
    agg.turnStarted();
    aggRef.current = agg;
    sync();
  }, [defs, sync, aggRef, gameState]);

  const startRound = useCallback(() => {
    aggRef.current.roundStarted();
    sync();
  }, [sync, aggRef]);

  const startTurn = useCallback(() => {
    const event = aggRef.current.turnStarted();
    if (!event) return;
    sync();
  }, [sync, aggRef]);

  // ── Persistance ───────────────────────────────────────────────────────────

  const loadGame = useCallback(() => {
    const save = loadSave();
    if (!save) return;
    const agg = makeAggregate(save.saveState, defs);
    agg.loadFromHistory(save.events);
    aggRef.current = agg;
    sync();
  }, [sync, aggRef, defs]);

  const deleteSaveCallback = useCallback(() => {
    deleteSave();
    aggRef.current = makeAggregate({ ...EMPTY_STATE }, defs);
    setGameState(aggRef.current.getGameState());
  }, [setGameState, aggRef, defs]);

  // ── Card actions ──────────────────────────────────────────────────────────

  const triggerProduction = useCallback(
    (instanceId: number, resourcesGained: Record<string, number>) => {
      aggRef.current.cardProduced(instanceId, resourcesGained);
      sync();
    },
    [sync, aggRef],
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
            kind: 'PRODUCTION',
            type: PendingChoiceType.CHOOSE_RESOURCE,
            sourceInstanceId: instanceId,
            choices: productions,
            pickCount: 1,
            isMandatory: false,
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
    [defs, triggerProduction, stickerDefs, aggRef, currentProductionRef, setPendingChoices],
  );

  const resolveAction = useCallback(
    (instanceId: number, actionId: string, triggerId?: string) => {
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
          triggerId: triggerId ?? crypto.randomUUID(),
        };
        setPendingChoices(costPendingChoices);
        return;
      }

      // if no pending choices are needed to pay the cost, proceed to trigger the action immediately
      triggerAction(instanceId, action, resolvedCost, triggerId ?? crypto.randomUUID());

      sync();
    },
    [triggerAction, defs, sync, aggRef, currentActionRef, setPendingChoices],
  );

  const resolveTrackStep = useCallback(
    (instanceId: number, stepId: number) => {
      const gs = aggRef.current.getGameState();
      const inst = gs.instances[instanceId];
      if (!inst || Object.values(gs.blockingCards).includes(instanceId)) return;
      const cs = getActiveState(inst, defs);
      const track = cs.track;
      if (!track) return;
      const step = track.steps.find(s => s.id === stepId);
      if (!step) return;
      if (inst.trackProgress.includes(stepId)) return;
      if (!canAffordResources(gs.resources, step.cost)) return;

      const [resolvedCost] = resolveCost(step.cost, instanceId, gs, defs);

      const effects = (step.onClick.actions ?? []).flatMap(action => {
        const [resolved] = resolveActionEffect(action, instanceId, gs, defs);
        return [resolved];
      });

      const triggerId = crypto.randomUUID();
      aggRef.current.useCardEffect(
        effects,
        resolvedCost,
        false,
        false,
        triggerId,
        stepId,
        instanceId,
      );
      sync();
    },
    [defs, sync, aggRef],
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

      aggRef.current.upgradeCard(instanceId, upgrade.upgradeTo, upgrade.cost.resources?.[0] ?? {});
      sync();
    },
    [defs, sync, aggRef],
  );

  // ── Turn flow ─────────────────────────────────────────────────────────────

  const progress = useCallback(() => {
    const event = aggRef.current.advance();
    if (!event) return;
    sync();
  }, [sync, aggRef]);

  const endTurnVoluntary = useCallback(() => {
    aggRef.current.pass();
    sync();
  }, [sync, aggRef]);

  // ── Choice resolution ─────────────────────────────────────────────────────

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
        const def = defs[inst.cardId];
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
          aggRef.current.useCardEffect(
            resolvedAction,
            resolvedCost ?? { resources: {}, discardedCardIds: [], destroyedCardIds: [] },
            !action.passive && !action.trigger,
            def.parchmentCard,
            triggerId,
          );
          sync();
          setPendingChoices(pendingChoices);
        }
      }
    },
    [
      sync,
      pendingChoices,
      triggerProduction,
      stickerDefs,
      defs,
      aggRef,
      currentActionRef,
      currentProductionRef,
      setPendingChoices,
    ],
  );

  const skipTrigger = useCallback(
    (uuid: string) => {
      setTriggerPile(prev => {
        const updated = { ...prev };
        delete updated[uuid];
        return Object.keys(updated).length > 0 ? updated : null;
      });
    },
    [setTriggerPile],
  );

  const skipChoice = useCallback(
    (uuid: string) => {
      setPendingChoices(prev => {
        if (!prev) return null;
        const updated = prev.filter(choice => choice.id !== uuid);
        return updated.length > 0 ? updated : null;
      });
    },
    [setPendingChoices],
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
      triggerAction(
        currentActionRef.current.instanceId,
        currentActionRef.current.action,
        currentActionRef.current.resolvedCost,
        currentActionRef.current.triggerId,
      );
      sync();
    },
    [triggerAction, sync, currentActionRef, setPendingChoices],
  );

  // ── Rewind  ───────────────────────────────────────────────────────────

  const canRewind = useCallback(() => {
    const events = aggRef.current.getEvents();
    return events.length > 0;
  }, [aggRef]);

  const rewindEvent = useCallback(() => {
    const aggEvent = aggRef.current.getEvents();
    if (aggEvent.length === 0) return;
    const saveState = aggRef.current.getSaveState();
    const agg = makeAggregate(saveState, defs);
    agg.loadFromHistory(aggEvent.slice(0, -1));
    aggRef.current = agg;
    sync();
  }, [sync, defs, aggRef]);

  // ── Result ──────────────────────────────────────────────────────────────

  return {
    state: gameState,
    defs,
    stickerDefs,
    score,
    pendingChoices,
    triggerPile,
    phase,
    loadGame,
    deleteSave: deleteSaveCallback,
    startGame,
    startRound,
    startTurn,
    resolveProduction,
    resolveAction,
    resolveTrackStep,
    resolveUpgrade,
    progress,
    endTurnVoluntary,
    resolvePlayerChoice,
    resolvePayCost,
    skipTrigger,
    skipChoice,
    canRewind,
    rewindEvent,
  };
}
