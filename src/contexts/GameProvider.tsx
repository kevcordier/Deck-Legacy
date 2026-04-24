import { GameContext } from '@contexts/GameContext';
import deckData from '@data/deck.json';
import { EMPTY_STATE, GameAggregate } from '@engine/application/aggregates/GameAggregate';
import {
  canAffordResources,
  cardIsBlocked,
  getActiveState,
  getEffectiveProductions,
} from '@engine/application/cardHelpers';
import { cardSelector } from '@engine/application/cardSelector';
import { resolveCost } from '@engine/application/costResolver';
import { resolveActionEffect } from '@engine/application/effectResolver';
import { createInstance } from '@engine/application/factory';
import { mergeResources } from '@engine/application/gameStateHelper';
import { ActionType, GameEventType, PendingChoiceType } from '@engine/domain/enums';
import type {
  CardAction,
  CardDef,
  GameEvent,
  GameState,
  PendingChoice,
  ResolvedAction,
  ResolvedCost,
  Resources,
  StepDef,
  TriggerEntry,
  UseCardEffectEvent,
} from '@engine/domain/types';
import {
  loadCardDefs,
  loadInitialStickerStock,
  loadStickerDefs,
} from '@engine/infrastructure/loaders';
import { deleteSave, loadSave, saveGame } from '@engine/infrastructure/persistence';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

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
    trackStep?: StepDef;
    trackTargetId?: number;
  } | null>(null);

  // ─── Sync ───────────────────────────────────────────────────────────────

  const emptyResolvedCost: ResolvedCost = {
    resources: {},
    discardedCardIds: [],
    destroyedCardIds: [],
  };

  const buildEffectsToApply = (
    effect: CardAction['actionEffects'][number],
    resolvedAction: ResolvedAction,
  ): ResolvedAction[] => {
    const effectsToApply: ResolvedAction[] = [resolvedAction];
    if (
      effect.type !== ActionType.TRACK_ADVANCE ||
      resolvedAction.instanceIds?.[0] === undefined ||
      resolvedAction.stepId === undefined
    ) {
      return effectsToApply;
    }

    const currentGs = aggRef.current.getGameState();
    const trackTargetId = resolvedAction.instanceIds[0];
    const targetInst = currentGs.instances[trackTargetId];
    if (!targetInst) {
      return effectsToApply;
    }

    const targetState = getActiveState(targetInst, defs);
    const step = targetState.track?.steps.find(s => s.id === resolvedAction.stepId);
    for (const stepEff of step?.effects ?? []) {
      const [stepResolved] = resolveActionEffect(stepEff, trackTargetId, currentGs, defs, true);
      effectsToApply.push({
        ...stepResolved,
        instanceIds: stepResolved.instanceIds ?? [trackTargetId],
      });
    }

    return effectsToApply;
  };

  const triggerAction = (
    instanceId: number,
    cardAction: CardAction,
    resolvedCost: ResolvedCost,
    triggerId: string,
    startEffectIndex = 0,
  ): GameState | undefined => {
    const initialGs = aggRef.current.getGameState();
    const inst = initialGs.instances[instanceId];
    if (!inst || cardIsBlocked(instanceId, initialGs)) return;
    if (!cardAction) return;
    if (cardAction.onTime && inst.usedActionIds.includes(cardAction.id)) return;

    const def = defs[inst.cardId];

    for (let i = startEffectIndex; i < cardAction.actionEffects.length; i++) {
      const gs = aggRef.current.getGameState();
      const eff = cardAction.actionEffects[i];
      const [resolvedAction, choices] = resolveActionEffect(eff, instanceId, gs, defs, true);
      const isLast = i === cardAction.actionEffects.length - 1;

      if (choices.length > 0) {
        currentActionRef.current = {
          instanceId,
          action: cardAction,
          resolvedCost,
          resolvedAction: [resolvedAction],
          triggerId,
          nextEffectIndex: i,
        };
        setPendingChoices(choices);
        return undefined;
      }

      const effectsToApply = buildEffectsToApply(eff, resolvedAction);

      aggRef.current.applyCardEffect(
        cardAction.id,
        effectsToApply,
        isLast ? resolvedCost : emptyResolvedCost,
        triggerId,
        {
          isDiscarded: isLast && !cardAction.passive && !cardAction.trigger && !def.permanent,
          isDestroyed: isLast && !!def.parchmentCard,
          endsTurn: isLast && !!cardAction.endsTurn,
          consumeAction: isLast && !!cardAction.onTime,
        },
      );
    }

    return aggRef.current.getGameState();
  };

  const sync = (newState: GameState) => {
    setGameState(newState);
    saveGame(aggRef.current.getEvents());

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
    const agg = makeAggregate(EMPTY_STATE, defs);
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

  const applyTrackStep = (
    instanceId: number,
    action: CardAction,
    targetId: number,
    step: StepDef,
    resolvedCost: ResolvedCost,
    triggerId: string,
  ) => {
    const gs = aggRef.current.getGameState();
    const def = defs[gs.instances[instanceId].cardId];

    if (action.onTime && gs.instances[instanceId].usedActionIds.includes(action.id)) return;

    const trackEffect = action.actionEffects.find(e => e.type === ActionType.TRACK_ADVANCE);
    if (!trackEffect) return;

    const trackResolvedAction: ResolvedAction = {
      id: `${instanceId}-${trackEffect.id}`,
      type: ActionType.TRACK_ADVANCE,
      sourceInstanceId: instanceId,
      instanceIds: [targetId],
      stepId: step.id,
    };

    const stepResolvedActions: ResolvedAction[] = [];
    const stepPendingChoices: PendingChoice[] = [];
    for (const stepEffect of step.effects ?? []) {
      const [resolved, choices] = resolveActionEffect(stepEffect, targetId, gs, defs, true);
      stepPendingChoices.push(...choices);
      stepResolvedActions.push({ ...resolved, instanceIds: resolved.instanceIds ?? [targetId] });
    }

    const allEffects = [trackResolvedAction, ...stepResolvedActions];

    if (stepPendingChoices.length > 0) {
      currentActionRef.current = {
        instanceId,
        action,
        resolvedCost,
        resolvedAction: allEffects,
        triggerId,
      };
      setPendingChoices(stepPendingChoices);
      return;
    }

    const newState = aggRef.current.applyCardEffect(
      action.id,
      allEffects,
      resolvedCost,
      triggerId,
      {
        isDiscarded: !action.passive && !action.trigger && !def.permanent,
        isDestroyed: !!def.parchmentCard,
        endsTurn: !!action.endsTurn,
        explicitSourceInstanceId: instanceId,
        consumeAction: !!action.onTime,
      },
    );
    sync(newState);
  };

  const executeTrackStep = (
    instanceId: number,
    action: CardAction,
    targetId: number,
    step: StepDef,
    triggerId: string,
  ) => {
    const gs = aggRef.current.getGameState();
    if (!canAffordResources(gs.resources, step.cost)) return;
    if (!canAffordResources(gs.resources, action.cost)) return;

    const [stepResolvedCost, stepPendingChoices] = resolveCost(
      step.cost ?? {},
      instanceId,
      gs,
      defs,
    );
    const [actionResolvedCost, actionPendingChoices] = resolveCost(
      action.cost ?? {},
      instanceId,
      gs,
      defs,
    );
    const resolvedCost: ResolvedCost = {
      resources: mergeResources(stepResolvedCost.resources, actionResolvedCost.resources),
      discardedCardIds: [
        ...stepResolvedCost.discardedCardIds,
        ...actionResolvedCost.discardedCardIds,
      ],
      destroyedCardIds: [
        ...stepResolvedCost.destroyedCardIds,
        ...actionResolvedCost.destroyedCardIds,
      ],
    };
    const costPendingChoices = [...stepPendingChoices, ...actionPendingChoices];

    if (costPendingChoices.length > 0) {
      currentActionRef.current = {
        instanceId,
        action,
        resolvedCost,
        resolvedAction: [],
        triggerId,
        trackStep: step,
        trackTargetId: targetId,
      };
      setPendingChoices(costPendingChoices);
      return;
    }

    applyTrackStep(instanceId, action, targetId, step, resolvedCost, triggerId);
  };

  const resolveTrackAdvanceAction = (instanceId: number, action: CardAction, triggerId: string) => {
    const gs = aggRef.current.getGameState();
    const trackEffect = action.actionEffects.find(e => e.type === ActionType.TRACK_ADVANCE);
    if (!trackEffect?.cards) return;

    const targetIds = cardSelector(trackEffect.cards, instanceId, gs, defs);
    if (targetIds.length === 0) return;

    const targetId = targetIds[0];
    const targetInst = gs.instances[targetId];
    const targetState = getActiveState(targetInst, defs);
    const track = targetState.track;
    if (!track) return;

    const availableSteps = track.steps.filter(s => !targetInst.trackProgress.includes(s.id));
    if (availableSteps.length === 0) return;

    if (track.inOrder) {
      const step = availableSteps.reduce((min, s) => (s.id < min.id ? s : min), availableSteps[0]);
      executeTrackStep(instanceId, action, targetId, step, triggerId);
    } else {
      currentActionRef.current = {
        instanceId,
        action,
        resolvedCost: emptyResolvedCost,
        resolvedAction: [],
        triggerId,
      };
      setPendingChoices([
        {
          id: `${instanceId}-${action.id}`,
          kind: ActionType.TRACK_ADVANCE,
          type: PendingChoiceType.CHOOSE_STEP,
          sourceInstanceId: instanceId,
          targetInstanceId: targetId,
          choices: availableSteps.map(s => s.id),
          pickCount: 1,
          isMandatory: true,
        },
      ]);
    }
  };

  const resolveAction = (instanceId: number, actionId: string, triggerId?: string) => {
    const gs = aggRef.current.getGameState();
    const inst = gs.instances[instanceId];
    if (!inst || cardIsBlocked(instanceId, gs)) return;
    const cs = getActiveState(inst, defs);
    const action = cs.actions?.find(ce => ce.id === actionId);
    if (!action) return;
    if (action.onTime && inst.usedActionIds.includes(action.id)) return;

    // TRACK_ADVANCE cost lives on the step, not the CardAction — handle separately.
    // For pure TRACK_ADVANCE actions, use the dedicated path that handles step costs.
    // For mixed actions (other effects alongside TRACK_ADVANCE), fall through to the
    // normal flow so all effects are resolved in order (step costs not supported there).
    if (
      action.actionEffects.some(e => e.type === ActionType.TRACK_ADVANCE) &&
      action.actionEffects.length === 1
    ) {
      resolveTrackAdvanceAction(instanceId, action, triggerId ?? crypto.randomUUID());
      return;
    }

    if (!canAffordResources(gs.resources, action.cost ?? {})) return;

    const [resolvedCost, costPendingChoices] = resolveCost(action.cost ?? {}, instanceId, gs, defs);

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

  const setCardName = (instanceId: number, chosenName: string) => {
    sync(aggRef.current.setCardName(instanceId, chosenName));
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
    return current.map(ra => {
      if (ra.id !== newPart.id) return ra;
      return {
        ...ra,
        ...newPart,
        resources:
          ra.resources || newPart.resources
            ? mergeResources(ra.resources ?? {}, newPart.resources ?? {})
            : undefined,
      };
    });
  };

  const resolveCardSourcedActionChoice = (
    choice: ResolvedAction,
    resolvedAction: ResolvedAction,
    resolvedActionType: ActionType,
    gs: GameState,
  ): boolean => {
    const actionCurrent = currentActionRef.current;
    const instanceId = choice.instanceIds?.[0];
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
    if (resolvedAction?.type !== ActionType.ADD_BOARD_EFFECT || !choice.instanceIds?.length) {
      return false;
    }

    const currentAction = currentActionRef.current;
    if (!currentAction) return false;

    const instanceIds = [...(resolvedAction.instanceIds ?? []), ...choice.instanceIds];
    const mergedChoice: ResolvedAction = {
      ...choice,
      instanceIds,
    };
    currentAction.resolvedAction = mergeResolvedChoice(currentAction.resolvedAction, mergedChoice);

    const remaining = (pendingChoices ?? []).slice(1).map(pc => ({
      ...pc,
      choices: pc.choices.filter(c => !choice.instanceIds?.includes(c as number)),
    }));

    if (remaining.length === 0) {
      const resolvedActions = currentAction.resolvedAction;
      const resolvedCost = currentAction.resolvedCost;
      const triggerId = currentAction.triggerId;
      const { action: currentCardAction } = currentAction;
      const currentDef = defs[gs.instances[instanceId].cardId];
      currentActionRef.current = null;
      setPendingChoices(null);
      sync(
        aggRef.current.applyCardEffect(
          currentCardAction.id,
          resolvedActions,
          resolvedCost ?? { resources: {}, discardedCardIds: [], destroyedCardIds: [] },
          triggerId,
          {
            isDiscarded:
              !currentCardAction.passive && !currentCardAction.trigger && !currentDef.permanent,
            isDestroyed: currentDef.parchmentCard,
            endsTurn: currentCardAction.endsTurn,
          },
        ),
      );
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
      const isLast = nextEffectIndex === action.actionEffects.length - 1;

      currentActionRef.current = null;
      setPendingChoices(null);

      aggRef.current.applyCardEffect(
        action.id,
        resolvedAction,
        isLast ? (resolvedCost ?? emptyResolvedCost) : emptyResolvedCost,
        triggerId,
        {
          isDiscarded: isLast && !action.passive && !action.trigger && !def.permanent,
          isDestroyed: isLast && !!def.parchmentCard,
          endsTurn: isLast && !!action.endsTurn,
          consumeAction: isLast && !!action.onTime,
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

  const handleTrackStepChoice = (
    choice: ResolvedAction,
    gs: GameState,
    instanceId: number,
    action: CardAction,
    triggerId: string,
  ): boolean => {
    if (choice.type !== ActionType.TRACK_ADVANCE || choice.stepId === undefined) return false;
    const trackEffect = action.actionEffects.find(e => e.type === ActionType.TRACK_ADVANCE);
    if (!trackEffect?.cards) return false;
    const targetIds = cardSelector(trackEffect.cards, instanceId, gs, defs);
    if (targetIds.length === 0) return false;
    const targetId = targetIds[0];
    const step = getActiveState(gs.instances[targetId], defs).track?.steps.find(
      s => s.id === choice.stepId,
    );
    if (!step) return false;
    currentActionRef.current = null;
    setPendingChoices(null);
    executeTrackStep(instanceId, action, targetId, step, triggerId);
    return true;
  };

  const resolvePlayerChoice = (choice: ResolvedAction) => {
    const gs = aggRef.current.getGameState();

    handleProductionChoice(choice, gs);

    if (!currentActionRef.current) return;
    const { instanceId, action, triggerId } = currentActionRef.current;
    const inst = gs.instances[instanceId];
    if (!inst || cardIsBlocked(instanceId, gs)) return;
    if (!action) return;

    if (handleTrackStepChoice(choice, gs, instanceId, action, triggerId)) return;

    const resolvedAction = currentActionRef.current.resolvedAction.find(ra => ra.id === choice.id);
    const resolvedActionType = resolvedAction?.type;
    if (
      resolvedAction !== undefined &&
      resolvedActionType !== undefined &&
      [ActionType.ADD_RESOURCES, ActionType.BOOST_CARD].includes(resolvedActionType) &&
      choice.instanceIds?.[0]
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

    const {
      instanceId,
      action,
      resolvedCost: mergedCost,
      triggerId,
      trackStep,
      trackTargetId,
    } = currentActionRef.current;

    if (trackStep !== undefined && trackTargetId !== undefined) {
      currentActionRef.current = null;
      applyTrackStep(
        instanceId,
        action,
        trackTargetId,
        trackStep,
        mergedCost ?? emptyResolvedCost,
        triggerId,
      );
      return;
    }

    const newState = triggerAction(instanceId, action, mergedCost, triggerId);

    if (newState) {
      sync(newState);
    }
  };

  // ── Dev cheat ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    (globalThis as unknown as Record<string, unknown>).__cheat = {
      addResources: (resources: Record<string, number>) => {
        sync(aggRef.current.cardProduced(0, resources));
      },
      getState: () => aggRef.current.getGameState(),
      getEvents: () => aggRef.current.getEvents(),
      setEvents: (events: GameEvent[]) => {
        try {
          const agg = makeAggregate(EMPTY_STATE, defs);
          agg.loadFromHistory(events);
          aggRef.current = agg;
          sync(agg.getGameState());
        } catch (e) {
          console.error('Failed to set events', e);
        }
      },
      drawCard: (instanceId: number) => {
        sync(
          aggRef.current.applyCardEffect(
            `cheat-draw-${instanceId}-${Date.now()}`,
            [
              {
                id: `draw-${instanceId}-${Date.now()}`,
                type: ActionType.PLAY_CARD,
                sourceInstanceId: instanceId,
                instanceIds: [instanceId],
              },
            ],
            { resources: {}, discardedCardIds: [], destroyedCardIds: [] },
            `cheat-trigger-${instanceId}-${Date.now()}`,
            {
              isDiscarded: false,
              isDestroyed: false,
              endsTurn: false,
            },
          ),
        );
      },
      discardCard: (instanceId: number) => {
        sync(
          aggRef.current.applyCardEffect(
            `cheat-discard-${instanceId}-${Date.now()}`,
            [
              {
                id: `discard-${instanceId}-${Date.now()}`,
                type: ActionType.DISCARD_CARD,
                sourceInstanceId: instanceId,
                instanceIds: [instanceId],
              },
            ],
            { resources: {}, discardedCardIds: [], destroyedCardIds: [] },
            `cheat-trigger-${instanceId}-${Date.now()}`,
            {
              isDiscarded: false,
              isDestroyed: false,
              endsTurn: false,
            },
          ),
        );
      },
      destroyCard: (instanceId: number) => {
        sync(
          aggRef.current.applyCardEffect(
            `cheat-destroy-${instanceId}-${Date.now()}`,
            [
              {
                id: `destroy-${instanceId}-${Date.now()}`,
                type: ActionType.DESTROY_CARD,
                sourceInstanceId: instanceId,
                instanceIds: [instanceId],
              },
            ],
            { resources: {}, discardedCardIds: [], destroyedCardIds: [] },
            `cheat-trigger-${instanceId}-${Date.now()}`,
            {
              isDiscarded: false,
              isDestroyed: false,
              endsTurn: false,
            },
          ),
        );
      },
      discoverCard: (instanceId: number) => {
        sync(
          aggRef.current.applyCardEffect(
            `cheat-discover-${instanceId}-${Date.now()}`,
            [
              {
                id: `discover-${instanceId}-${Date.now()}`,
                type: ActionType.DISCOVER_CARD,
                sourceInstanceId: instanceId,
                instanceIds: [instanceId],
              },
            ],
            { resources: {}, discardedCardIds: [], destroyedCardIds: [] },
            `cheat-trigger-${instanceId}-${Date.now()}`,
            {
              isDiscarded: false,
              isDestroyed: false,
              endsTurn: false,
            },
          ),
        );
      },
      setCardState: (instanceId: number, stateId: number) => {
        aggRef.current.applyCardEffect(
          `cheat-update-${instanceId}-${Date.now()}`,
          [
            {
              id: `update-${instanceId}-${Date.now()}`,
              type: ActionType.UPGRADE_CARD,
              sourceInstanceId: instanceId,
              instanceIds: [instanceId],
              stateId,
            },
          ],
          { resources: {}, discardedCardIds: [], destroyedCardIds: [] },
          `cheat-trigger-${instanceId}-${Date.now()}`,
          {
            isDiscarded: false,
            isDestroyed: false,
            endsTurn: false,
          },
        );
        sync(
          aggRef.current.applyCardEffect(
            `cheat-draw-${instanceId}-${Date.now()}`,
            [
              {
                id: `draw-${instanceId}-${Date.now()}`,
                type: ActionType.PLAY_CARD,
                sourceInstanceId: instanceId,
                instanceIds: [instanceId],
              },
            ],
            { resources: {}, discardedCardIds: [], destroyedCardIds: [] },
            `cheat-trigger-${instanceId}-${Date.now()}`,
            {
              isDiscarded: false,
              isDestroyed: false,
              endsTurn: false,
            },
          ),
        );
      },
    };
    return () => {
      delete (globalThis as unknown as Record<string, unknown>).__cheat;
    };
  });

  // ── Rewind  ───────────────────────────────────────────────────────────

  const canRewind = () => {
    const events = aggRef.current.getEvents();
    return events.length > 0;
  };

  const rewindEvent = () => {
    const events = aggRef.current.getEvents();
    if (events.length === 0) return;

    const last = events[events.length - 1];
    let cutIndex = events.length - 1;

    if (last.type === GameEventType.USE_CARD_EFFECT) {
      const { actionId } = last as UseCardEffectEvent;
      while (
        cutIndex > 0 &&
        events[cutIndex - 1].type === GameEventType.USE_CARD_EFFECT &&
        (events[cutIndex - 1] as UseCardEffectEvent).actionId === actionId
      ) {
        cutIndex--;
      }
    }

    const agg = makeAggregate(EMPTY_STATE, defs);
    agg.loadFromHistory(events.slice(0, cutIndex));
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
        setCardName,
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
