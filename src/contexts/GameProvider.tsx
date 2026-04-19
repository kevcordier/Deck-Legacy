import { GameContext } from '@contexts/GameContext';
import deckData from '@data/deck.json';
import { EMPTY_STATE, GameAggregate } from '@engine/application/aggregates/GameAggregate';
import {
  canAffordResources,
  cardIsBlocked,
  getActiveState,
  getEffectiveProductions,
} from '@engine/application/cardHelpers';
import { resolveCost } from '@engine/application/costResolver';
import { resolveActionEffect } from '@engine/application/effectResolver';
import { createInstance } from '@engine/application/factory';
import { mergeResources } from '@engine/application/gameStateHelper';
import { ActionType, PendingChoiceType } from '@engine/domain/enums';
import type {
  CardAction,
  CardDef,
  GameEvent,
  GameState,
  PendingChoice,
  ResolvedAction,
  ResolvedCost,
  Resources,
  TriggerEntry,
} from '@engine/domain/types';
import {
  loadCardDefs,
  loadInitialStickerStock,
  loadStickerDefs,
} from '@engine/infrastructure/loaders';
import { deleteSave, loadSave, saveGame } from '@engine/infrastructure/persistence';
import { type ReactNode, useMemo, useRef, useState } from 'react';

function makeAggregate(state: GameState, cardDefs: Record<number, CardDef>): GameAggregate {
  return new GameAggregate(JSON.parse(JSON.stringify(state)) as GameState, cardDefs);
}

export function GameProvider({
  children,
  initialState,
  initialEvents = [],
}: {
  readonly children: ReactNode;
  readonly initialState?: GameState;
  readonly initialEvents?: GameEvent[];
}) {
  const defs = useMemo(() => loadCardDefs(), []);
  const stickerDefs = useMemo(() => loadStickerDefs(), []);
  const agg = makeAggregate(initialState || EMPTY_STATE, defs);
  agg.loadFromHistory(initialEvents);
  const aggRef = useRef<GameAggregate>(agg);
  const [gameState, setGameState] = useState<GameState>(agg.getGameState());
  const [pendingChoices, setPendingChoices] = useState<PendingChoice[] | null>(null);
  const [triggerPile, setTriggerPile] = useState<Record<string, TriggerEntry> | null>(null);
  const [parchmentTextPending, setParchmentTextPending] = useState<CardDef | null>(null);
  const currentProductionRef = useRef<{
    instanceId: number;
    resources: Partial<Resources>;
  } | null>(null);
  const currentActionRef = useRef<{
    instanceId: number;
    action: CardAction;
    resolvedCost: ResolvedCost | null;
    resolvedAction: ResolvedAction[];
    triggerId: string;
    nextEffectIndex?: number;
  } | null>(null);

  // ─── Sync ───────────────────────────────────────────────────────────────

  const emptyResolvedCost: ResolvedCost = {
    resources: {},
    discardedCardIds: [],
    destroyedCardIds: [],
  };

  const triggerAction = (
    instanceId: number,
    effect: CardAction,
    resolvedCost: ResolvedCost,
    triggerId: string,
    startEffectIndex = 0,
  ): GameState | undefined => {
    const initialGs = aggRef.current.getGameState();
    const inst = initialGs.instances[instanceId];
    const def = defs[inst.cardId];

    if (!inst || cardIsBlocked(instanceId, initialGs)) return;
    if (!effect) return;

    for (let i = startEffectIndex; i < effect.actions.length; i++) {
      const gs = aggRef.current.getGameState();
      const eff = effect.actions[i];
      const [resolvedAction, choices] = resolveActionEffect(eff, instanceId, gs, defs, true);
      const isLast = i === effect.actions.length - 1;

      if (choices.length > 0) {
        currentActionRef.current = {
          instanceId,
          action: effect,
          resolvedCost,
          resolvedAction: [resolvedAction],
          triggerId,
          nextEffectIndex: i,
        };
        setPendingChoices(choices);
        return undefined;
      }

      aggRef.current.applyCardEffect(
        [resolvedAction],
        isLast ? resolvedCost : emptyResolvedCost,
        triggerId,
        {
          isDiscarded: isLast && !effect.passive && !effect.trigger,
          isDestroyed: isLast && !!def.parchmentCard,
          endsTurn: isLast && !!effect.endsTurn,
        },
      );
    }

    return aggRef.current.getGameState();
  };

  const sync = (newState: GameState) => {
    setGameState(newState);
    saveGame(aggRef.current.getEvents(), aggRef.current.getSaveState());

    const triggers = newState.triggerPile;

    // If any trigger comes from a parchment card, show the text modal first.
    const parchmentTrigger = Object.values(triggers).find(t => {
      const inst = newState.instances[t.sourceInstanceId];
      return inst && defs[inst.cardId]?.parchmentCard;
    });
    if (parchmentTrigger) {
      const inst = newState.instances[parchmentTrigger.sourceInstanceId];
      setParchmentTextPending(defs[inst.cardId]);
      setTriggerPile(null);
      return;
    }

    // If there's only one non optional trigger in the trigger pile, automatically fire it and re-sync.
    if (
      Object.entries(newState.triggerPile).length === 1 &&
      newState.triggerPile[Object.keys(newState.triggerPile)[0]].effectDef.optional !== true
    ) {
      const [triggerId, trigger] = Object.entries(newState.triggerPile)[0];

      const state = triggerAction(
        trigger.sourceInstanceId,
        trigger.effectDef,
        {
          destroyedCardIds: [],
          discardedCardIds: [],
          resources: {},
        },
        triggerId,
      );
      if (state) {
        sync(state);
        return;
      }
    }

    setTriggerPile(triggers);
  };

  // ── Démarrage ─────────────────────────────────────────────────────────────

  const startGame = () => {
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
    aggRef.current = agg;
    aggRef.current.gameStarted(
      allInstances,
      initialDeck,
      loadInitialStickerStock() as Record<string, number>,
      discoveryPile,
    );

    aggRef.current.roundStarted();
    const newState = aggRef.current.turnStarted();
    sync(newState);
  };

  const startRound = () => {
    sync(aggRef.current.roundStarted());
  };

  const startTurn = () => {
    sync(aggRef.current.turnStarted());
  };

  // ── Persistance ───────────────────────────────────────────────────────────

  const loadGame = () => {
    const save = loadSave();
    if (!save) return;
    const agg = makeAggregate(save.saveState, defs);
    agg.loadFromHistory(save.events);
    aggRef.current = agg;
    sync(aggRef.current.getGameState());
  };

  const deleteSaveCallback = () => {
    deleteSave();
    aggRef.current = makeAggregate({ ...EMPTY_STATE }, defs);
    setGameState(aggRef.current.getGameState());
  };

  // ── Card actions ──────────────────────────────────────────────────────────

  const triggerProduction = (instanceId: number, resourcesGained: Record<string, number>) => {
    sync(aggRef.current.cardProduced(instanceId, resourcesGained));
  };

  const resolveProduction = (instanceId: number, chosenResource: number) => {
    const gs = aggRef.current.getGameState();
    const inst = gs.instances[instanceId];
    if (!inst || cardIsBlocked(instanceId, gs)) return;

    const resourcesGained = getEffectiveProductions(
      defs[inst.cardId].states.find(s => s.id === inst.stateId)?.productions?.[chosenResource] ||
        {},
      getActiveState(inst, defs),
      gs,
      defs,
      inst,
      stickerDefs,
    );
    triggerProduction(instanceId, resourcesGained);
  };

  const resolveAction = (instanceId: number, actionId: string, triggerId?: string) => {
    const gs = aggRef.current.getGameState();
    const inst = gs.instances[instanceId];
    if (!inst || cardIsBlocked(instanceId, gs)) return;
    const cs = getActiveState(inst, defs);
    const action = cs.actions?.find(ce => ce.id === actionId);
    if (!action) return;
    if (!canAffordResources(gs.resources, action.cost ?? {})) return;

    // get resolved cost and check if any pending choices are needed to pay it
    const [resolvedCost, costPendingChoices] = resolveCost(action.cost ?? {}, instanceId, gs, defs);

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

    const newState = triggerAction(
      instanceId,
      action,
      resolvedCost,
      triggerId ?? crypto.randomUUID(),
    );

    if (!newState) return;

    // if no pending choices are needed to pay the cost, proceed to trigger the action immediately
    sync(newState);
  };

  const resolveUpgrade = (instanceId: number, chosenUpgradeTo?: number) => {
    const gs = aggRef.current.getGameState();
    const inst = gs.instances[instanceId];
    if (!inst || cardIsBlocked(instanceId, gs)) return;
    const cs = getActiveState(inst, defs);
    const upgrades = cs.upgrade ?? [];
    if (upgrades.length === 0) return;

    const upgrade = upgrades.find(u => u.upgradeTo === chosenUpgradeTo);
    if (!upgrade) return;
    if (!canAffordResources(gs.resources, upgrade.cost)) return;

    sync(
      aggRef.current.upgradeCard(instanceId, upgrade.upgradeTo, upgrade.cost.resources?.[0] ?? {}),
    );
  };

  // ── Turn flow ─────────────────────────────────────────────────────────────

  const progress = () => {
    sync(aggRef.current.advance());
  };

  const endTurnVoluntary = () => {
    const newState = aggRef.current.turnEnded();
    sync(newState);
  };

  // ── Choice resolution ─────────────────────────────────────────────────────

  const mergeResolvedChoice = (current: ResolvedAction[], newPart: ResolvedAction) => {
    return current.map(ra => (ra.id === newPart.id ? { ...ra, ...newPart } : ra));
  };

  const resolveCardSourcedActionChoice = (
    choice: ResolvedAction,
    resolvedAction: ResolvedAction,
    resolvedActionType: ActionType,
    gs: GameState,
  ): boolean => {
    const actionCurrent = currentActionRef.current;
    const { instanceId } = choice;
    if (!actionCurrent || !instanceId) return false;

    const state = getActiveState(gs.instances[instanceId], defs);
    if (!state.productions?.length) {
      choice.resources = {};
      return false;
    }
    if (state.productions.length === 1) {
      if (resolvedActionType === ActionType.BOOST_CARD) {
        const stickerChoices = Object.keys(state.productions[0])
          .map(rt => Object.values(stickerDefs).find(s => s.production === rt)?.id)
          .filter((id): id is number => id !== undefined && (gs.stickerStock[id] ?? 0) > 0);
        if (stickerChoices.length > 1) {
          actionCurrent.resolvedAction = mergeResolvedChoice(actionCurrent.resolvedAction, choice);
          setPendingChoices([
            {
              id: resolvedAction.id,
              kind: resolvedActionType,
              type: PendingChoiceType.CHOOSE_STICKER,
              sourceInstanceId: choice.sourceInstanceId,
              choices: stickerChoices,
              pickCount: 1,
              isMandatory: true,
            },
            ...(pendingChoices?.slice(1) ?? []),
          ]);
          return true;
        }
        choice.stickerId = stickerChoices[0];
        return false;
      }
      choice.resources = state.productions[0];
      return false;
    }
    actionCurrent.resolvedAction = mergeResolvedChoice(actionCurrent.resolvedAction, choice);
    setPendingChoices([
      {
        id: resolvedAction.id,
        kind: resolvedActionType,
        type: PendingChoiceType.CHOOSE_RESOURCE,
        sourceInstanceId: instanceId,
        choices: state.productions,
        pickCount: 1,
        isMandatory: true,
      },
      ...(pendingChoices?.slice(1) ?? []),
    ]);
    return true;
  };

  const handleProductionChoice = (choice: ResolvedAction, gs: GameState) => {
    if (!currentProductionRef.current) return;
    const { instanceId } = currentProductionRef.current;
    const inst = gs.instances[instanceId];
    if (!inst || cardIsBlocked(instanceId, gs)) return;
    const base = choice.resources || {};
    const resourcesGained = getEffectiveProductions(
      base,
      getActiveState(inst, defs),
      gs,
      defs,
      inst,
      stickerDefs,
    );
    triggerProduction(instanceId, resourcesGained);
    currentProductionRef.current = null;
  };

  const handleBoardEffectChoice = (choice: ResolvedAction, gs: GameState, instanceId: number) => {
    const resolvedAction = currentActionRef.current?.resolvedAction.find(ra => ra.id === choice.id);
    if (resolvedAction?.type !== ActionType.ADD_BOARD_EFFECT || choice.instanceId === undefined) {
      return false;
    }

    const currentAction = currentActionRef.current;
    if (!currentAction) return false;

    const accumulated = [...(resolvedAction.instanceIds ?? []), choice.instanceId];
    const mergedChoice: ResolvedAction = {
      ...choice,
      instanceIds: accumulated,
      instanceId: undefined,
    };
    currentAction.resolvedAction = mergeResolvedChoice(currentAction.resolvedAction, mergedChoice);

    const remaining = (pendingChoices ?? [])
      .slice(1)
      .map(pc => ({ ...pc, choices: pc.choices.filter(c => c !== choice.instanceId) }));

    if (remaining.length === 0) {
      const {
        resolvedAction: resolvedActions,
        resolvedCost,
        triggerId,
        action: currentCardAction,
        nextEffectIndex = 0,
      } = currentAction;
      const currentDef = defs[gs.instances[instanceId].cardId];
      const isLast = nextEffectIndex === currentCardAction.actions.length - 1;

      currentActionRef.current = null;
      setPendingChoices(null);

      aggRef.current.applyCardEffect(
        resolvedActions,
        isLast ? (resolvedCost ?? emptyResolvedCost) : emptyResolvedCost,
        triggerId,
        {
          isDiscarded: isLast && !currentCardAction.passive && !currentCardAction.trigger,
          isDestroyed: isLast && !!currentDef.parchmentCard,
          endsTurn: isLast && !!currentCardAction.endsTurn,
        },
      );

      if (isLast) {
        sync(aggRef.current.getGameState());
      } else {
        const nextState = triggerAction(
          instanceId,
          currentCardAction,
          resolvedCost ?? emptyResolvedCost,
          triggerId,
          nextEffectIndex + 1,
        );
        if (nextState) sync(nextState);
      }
    } else {
      setPendingChoices(remaining);
    }
    return true;
  };

  const handleFinalChoice = (
    choice: ResolvedAction,
    gs: GameState,
    instanceId: number,
    action: CardAction,
  ) => {
    const def = defs[gs.instances[instanceId].cardId];
    if (!currentActionRef.current) return;
    currentActionRef.current.resolvedAction = mergeResolvedChoice(
      currentActionRef.current.resolvedAction,
      choice,
    );

    if (pendingChoices?.length === 1) {
      const {
        resolvedAction,
        resolvedCost,
        triggerId,
        nextEffectIndex = 0,
      } = currentActionRef.current;
      const isLast = nextEffectIndex === action.actions.length - 1;

      currentActionRef.current = null;
      setPendingChoices(null);

      aggRef.current.applyCardEffect(
        resolvedAction,
        isLast ? (resolvedCost ?? emptyResolvedCost) : emptyResolvedCost,
        triggerId,
        {
          isDiscarded: isLast && !action.passive && !action.trigger,
          isDestroyed: isLast && !!def.parchmentCard,
          endsTurn: isLast && !!action.endsTurn,
        },
      );

      if (isLast) {
        sync(aggRef.current.getGameState());
      } else {
        const nextState = triggerAction(
          instanceId,
          action,
          resolvedCost ?? emptyResolvedCost,
          triggerId,
          nextEffectIndex + 1,
        );
        if (nextState) sync(nextState);
      }
    } else {
      setPendingChoices(pendingChoices?.slice(1) ?? null);
    }
  };

  const resolvePlayerChoice = (choice: ResolvedAction) => {
    const gs = aggRef.current.getGameState();

    handleProductionChoice(choice, gs);

    if (!currentActionRef.current) return;
    const { instanceId, action } = currentActionRef.current;
    const inst = gs.instances[instanceId];
    if (!inst || cardIsBlocked(instanceId, gs)) return;
    if (!action) return;

    const resolvedAction = currentActionRef.current.resolvedAction.find(ra => ra.id === choice.id);
    const resolvedActionType = resolvedAction?.type;
    if (
      resolvedAction !== undefined &&
      resolvedActionType !== undefined &&
      [ActionType.ADD_RESOURCES, ActionType.BOOST_CARD].includes(resolvedActionType) &&
      choice.instanceId
    ) {
      if (resolveCardSourcedActionChoice(choice, resolvedAction, resolvedActionType, gs)) return;
    }

    if (handleBoardEffectChoice(choice, gs, instanceId)) return;

    handleFinalChoice(choice, gs, instanceId, action);
  };

  const dismissParchmentText = () => {
    const gs = aggRef.current.getGameState();

    const parchmentEntry = Object.entries(gs.triggerPile).find(([, t]) => {
      const inst = gs.instances[t.sourceInstanceId];
      return inst && defs[inst.cardId]?.parchmentCard;
    });

    setParchmentTextPending(null);

    if (parchmentEntry) {
      const [triggerId, trigger] = parchmentEntry;
      const newState = triggerAction(
        trigger.sourceInstanceId,
        trigger.effectDef,
        { destroyedCardIds: [], discardedCardIds: [], resources: {} },
        triggerId,
      );

      if (newState) {
        sync(newState);
      }
    }
  };

  const skipTrigger = (uuid: string) => {
    sync(aggRef.current.skipTrigger(uuid));
  };

  const skipChoice = (uuid: string) => {
    setPendingChoices(prev => {
      if (!prev) return null;
      const updated = prev.filter(choice => choice.id !== uuid);
      return updated.length > 0 ? updated : null;
    });
  };

  // This function is called when the player has made a choice needed to pay an action's cost.
  const resolvePayCost = (resolved: ResolvedCost) => {
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

    const newState = triggerAction(
      currentActionRef.current.instanceId,
      currentActionRef.current.action,
      currentActionRef.current.resolvedCost,
      currentActionRef.current.triggerId,
    );

    if (newState) {
      sync(newState);
    }
  };

  // ── Rewind  ───────────────────────────────────────────────────────────

  const canRewind = () => {
    const events = aggRef.current.getEvents();
    return events.length > 0;
  };

  const rewindEvent = () => {
    const aggEvent = aggRef.current.getEvents();
    if (aggEvent.length === 0) return;
    const saveState = aggRef.current.getSaveState();
    const agg = makeAggregate(saveState, defs);
    agg.loadFromHistory(aggEvent.slice(0, -1));
    aggRef.current = agg;
    sync(agg.getGameState());
  };

  return (
    <GameContext
      value={{
        gameState,
        defs,
        stickerDefs,
        aggRef,
        pendingChoices,
        triggerPile,
        currentProductionRef,
        currentActionRef,
        triggerAction,
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
        skipTrigger,
        skipChoice,
        parchmentTextPending,
        dismissParchmentText,
        canRewind,
        rewindEvent,
      }}
    >
      {children}
    </GameContext>
  );
}
