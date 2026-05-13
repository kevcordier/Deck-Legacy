import { GameContext } from '@contexts/GameContext';
import deckData from '@data/deck.json';
import { EMPTY_STATE, GameAggregate } from '@engine/application/aggregates/GameAggregate';
import {
  cardIsBlocked,
  getActiveState,
  getEffectiveProductions,
  getEffectiveUpgradeCost,
} from '@engine/application/cardHelpers';
import { resolveCost } from '@engine/application/costResolver';
import { createInstance } from '@engine/application/factory';
import { computeScore, mergeResources } from '@engine/application/gameStateHelper';
import { ActionEffectType, GameEventType, type PendingChoiceType } from '@engine/domain/enums';
import { ActionCancelledError } from '@engine/domain/errors/ActionCancelledError';
import { CorruptedSaveError } from '@engine/domain/errors/CorruptedSaveError';
import { CostResolutionError } from '@engine/domain/errors/CostResolutionError';
import {
  type CardAction,
  type CardDef,
  type GameEvent,
  type GameState,
  type PendingChoice,
  Phase,
  type ResolvedActionEffect,
  type ResolvedCost,
  type Sticker,
  type TriggerEntry,
} from '@engine/domain/types';
import {
  loadCardDefs,
  loadInitialStickerStock,
  loadStickerDefs,
} from '@engine/infrastructure/loaders';
import { deleteSave, getCardName, saveGame, setCardName } from '@engine/infrastructure/persistence';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function makeAggregate(
  state: GameState,
  cardDefs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): GameAggregate {
  return new GameAggregate(JSON.parse(JSON.stringify(state)) as GameState, cardDefs, stickerDefs);
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
  const { t } = useTranslation();
  const defs = useMemo(() => loadCardDefs(), []);
  const stickerDefs = useMemo(() => loadStickerDefs(), []);

  const agg = useMemo(
    () => makeAggregate(initialState ?? EMPTY_STATE, defs, stickerDefs),
    [initialState, defs, stickerDefs],
  );
  const initState = useMemo(() => {
    try {
      return agg.loadFromHistory(initialEvents);
    } catch (error) {
      throw new CorruptedSaveError(error instanceof Error ? error.message : String(error));
    }
  }, [initialEvents, agg]);
  const aggRef = useRef<GameAggregate>(agg);
  const [gameState, setGameState] = useState<GameState>(initState);
  const [pendingChoices, setPendingChoices] = useState<PendingChoice[] | null>(() => {
    return agg.getCurrentCardAction()?.getPendingChoices() ?? null;
  });
  const [displayNewCards, setDisplayNewCards] = useState<boolean>(false);
  const [pendingUpgrade, setPendingUpgrade] = useState<{
    instanceId: number;
    upgradeTo: number;
    resolvedCost: ResolvedCost;
  } | null>(null);
  const [parameters, setParameters] = useState(agg.getParameters());

  const getParchmentCardDefFromPhase = (
    state: GameState,
    defs: Record<number, CardDef>,
  ): CardDef | null => {
    // If in PARCHMENT phase, find and return the parchment card's definition
    if (state.phase !== Phase.PARCHMENT || !state.onGoingParchment) {
      return null;
    }

    const inst = state.instances[state.onGoingParchment];
    return defs[inst.cardId];
  };

  const [parchmentTextPending, setParchmentTextPending] = useState<CardDef | null>(() =>
    getParchmentCardDefFromPhase(agg.getGameState(), defs),
  );

  const [triggerPile, setTriggerPile] = useState<Record<string, TriggerEntry> | null>(
    parchmentTextPending ? null : agg.getGameState().triggerPile,
  );

  // ─── Sync ───────────────────────────────────────────────────────────────

  const syncAggregatePending = () => {
    const current = aggRef.current.getCurrentCardAction();
    const choices = current?.getPendingChoices() ?? [];
    setGameState(aggRef.current.getGameState());
    setPendingChoices(choices.length > 0 ? choices : null);
    setParameters(aggRef.current.getParameters());
    return choices.length > 0;
  };

  const cancelPendingAction = () => {
    aggRef.current.cancelCurrentCardAction();
    setPendingUpgrade(null);
    setPendingChoices(null);
  };

  const handleActionError = (error: unknown) => {
    cancelPendingAction();
    let message = 'errors.unknown';
    if (error instanceof ActionCancelledError || error instanceof CostResolutionError) {
      message = t(error.message);
    } else if (error instanceof Error) {
      message = error.message;
    }
    toast.error(message);
  };

  const triggerAction = (instanceId: number, action: CardAction, triggerId?: string): GameState => {
    try {
      const nextState = aggRef.current.cardAction(action, instanceId, triggerId);
      if (syncAggregatePending()) {
        return gameState;
      }
      return nextState;
    } catch (error) {
      handleActionError(error);
      return gameState;
    }
  };

  const sync = (newState: GameState) => {
    if (newState.lastAddedCards.some(id => !gameState.lastAddedCards.includes(id))) {
      setDisplayNewCards(true);
    }

    setGameState(newState);
    setParameters(aggRef.current.getParameters());
    saveGame(aggRef.current.getEvents());

    const triggers = newState.triggerPile;

    const parchmentDef = getParchmentCardDefFromPhase(newState, defs);
    if (parchmentDef) {
      setParchmentTextPending(parchmentDef);
      setTriggerPile(null);
      return;
    }

    setTriggerPile(triggers);
    setParchmentTextPending(null);
    setPendingChoices(aggRef.current.getCurrentCardAction()?.getPendingChoices() ?? null);
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

    const agg = makeAggregate(gameState, defs, stickerDefs);
    aggRef.current = agg;
    const newState = aggRef.current.gameStarted(
      initialDeck,
      deckEntries,
      loadInitialStickerStock(),
      discoveryPile,
    );

    sync(newState);
  };

  const startRound = () => {
    sync(aggRef.current.roundStarted());
  };

  const startTurn = () => {
    sync(aggRef.current.turnStarted());
  };

  // ── Persistance ───────────────────────────────────────────────────────────

  const deleteSaveCallback = () => {
    deleteSave();
    aggRef.current = makeAggregate({ ...EMPTY_STATE }, defs, stickerDefs);
    setGameState(aggRef.current.getGameState());
    setParameters(aggRef.current.getParameters());
  };

  // ── Card actions ──────────────────────────────────────────────────────────

  const chooseState = (instanceId: number, stateId: number) => {
    const gs = aggRef.current.getGameState();
    const inst = gs.instances[instanceId];
    if (!inst || cardIsBlocked(instanceId, gs)) return;

    const newState = aggRef.current.chooseState(instanceId, stateId);
    sync(newState);
  };

  const triggerProduction = (instanceId: number, resourcesGained: Record<string, number>) => {
    sync(aggRef.current.cardProduced(instanceId, resourcesGained));
  };

  const resolveProduction = (instanceId: number, chosenResource: number) => {
    const gs = aggRef.current.getGameState();
    const inst = gs.instances[instanceId];
    if (!inst || cardIsBlocked(instanceId, gs)) return;

    const resourcesGained = getEffectiveProductions(
      defs[inst.cardId].states.find(s => s.id === inst.stateId)?.productions?.[chosenResource] ??
        {},
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
    const triggerEntry = triggerId ? gs.triggerPile[triggerId] : undefined;
    const isMatchingTriggerAction =
      triggerEntry?.sourceInstanceId === instanceId && triggerEntry?.effectDef.id === actionId;
    const triggerAction = isMatchingTriggerAction ? triggerEntry?.effectDef : undefined;
    const action = triggerAction ?? cs.actions?.find(ce => ce.id === actionId);
    if (!action) return;

    try {
      const newState = aggRef.current.cardAction(action, instanceId, triggerId);
      if (syncAggregatePending()) {
        return;
      }
      sync(newState);
    } catch (error) {
      handleActionError(error);
    }
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
    const effectiveUpgradeCost = getEffectiveUpgradeCost(
      upgrade.cost,
      gs,
      defs,
      stickerDefs,
      instanceId,
    );

    try {
      const [resolvedCost, costPendingChoices] = resolveCost(
        effectiveUpgradeCost,
        instanceId,
        gs,
        defs,
        stickerDefs,
        true,
      );

      if (costPendingChoices.length > 0) {
        setPendingUpgrade({
          instanceId,
          upgradeTo: upgrade.upgradeTo,
          resolvedCost,
        });
        setPendingChoices(costPendingChoices);
        return;
      }

      sync(
        aggRef.current.upgradeCard(
          instanceId,
          upgrade.upgradeTo,
          resolvedCost.resources,
          resolvedCost.discardedCardIds,
          resolvedCost.destroyedCardIds,
        ),
      );
    } catch (error) {
      handleActionError(error);
    }
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

  const resolvePlayerChoice = (choice: ResolvedActionEffect, choiceType: PendingChoiceType) => {
    try {
      const newState = aggRef.current.resolveCardActionChoice(choice, choiceType);
      if (syncAggregatePending()) {
        return;
      }
      sync(newState);
    } catch (error) {
      handleActionError(error);
    }
  };

  const dismissParchmentText = () => {
    if (gameState.onGoingParchment && parchmentTextPending?.states[0].actions?.[0]) {
      const newState = triggerAction(
        gameState.onGoingParchment,
        parchmentTextPending.states[0].actions[0],
      );
      sync(newState);
    }
  };

  const skipTrigger = (uuid: string) => {
    sync(aggRef.current.skipTrigger(uuid));
  };

  const skipChoice = () => {
    cancelPendingAction();
  };

  // This function is called when the player has made a choice needed to pay an action's cost.
  const resolvePayCost = (resolved: ResolvedCost) => {
    if (!resolved) return;

    try {
      if (pendingUpgrade) {
        const mergedResolvedCost: ResolvedCost = {
          resources: mergeResources(pendingUpgrade.resolvedCost.resources, resolved.resources),
          discardedCardIds: [
            ...pendingUpgrade.resolvedCost.discardedCardIds,
            ...resolved.discardedCardIds,
          ],
          destroyedCardIds: [
            ...pendingUpgrade.resolvedCost.destroyedCardIds,
            ...resolved.destroyedCardIds,
          ],
        };

        const remainingChoices = (pendingChoices ?? []).slice(1);
        if (remainingChoices.length > 0) {
          setPendingUpgrade({ ...pendingUpgrade, resolvedCost: mergedResolvedCost });
          setPendingChoices(remainingChoices);
          return;
        }

        const newState = aggRef.current.upgradeCard(
          pendingUpgrade.instanceId,
          pendingUpgrade.upgradeTo,
          mergedResolvedCost.resources,
          mergedResolvedCost.discardedCardIds,
          mergedResolvedCost.destroyedCardIds,
        );

        setPendingUpgrade(null);
        setPendingChoices(null);
        sync(newState);
        return;
      }

      const newState = aggRef.current.resolveCardActionCost(resolved);
      if (syncAggregatePending()) {
        return;
      }
      sync(newState);
    } catch (error) {
      handleActionError(error);
    }
  };

  // ── Rewind  ───────────────────────────────────────────────────────────

  const lastEventDrewCards = (event: GameEvent): boolean => {
    if (event.type === GameEventType.TURN_STARTED || event.type === GameEventType.ADVANCE) {
      return true;
    }

    if (event.type !== GameEventType.CARD_ACTION) {
      return false;
    }

    const gameStateChanges = (event as { gameStateChanges?: Partial<GameState> }).gameStateChanges;
    return (
      !gameStateChanges || Object.prototype.hasOwnProperty.call(gameStateChanges, 'lastDrawnCards')
    );
  };

  const canRewind = () => {
    const events = aggRef.current.getEvents();
    if (events.length === 0) return false;
    if (import.meta.env.DEV) return true;

    return !lastEventDrewCards(events[events.length - 1]);
  };

  const rewindEvent = () => {
    if (!canRewind()) return;

    const events = aggRef.current.getEvents();

    const agg = makeAggregate(EMPTY_STATE, defs, stickerDefs);
    agg.loadFromHistory(events.slice(0, events.length - 1));
    aggRef.current = agg;
    sync(agg.getGameState());
  };

  // ── Score ─────────────────────────────────────────────────────────────────

  const score = useMemo(
    () => computeScore(gameState, defs, stickerDefs),
    [gameState, defs, stickerDefs],
  );

  // ── Dev cheat ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    (globalThis as unknown as Record<string, unknown>).__cheat = {
      addResources: (resources: Record<string, number>) => {
        sync(aggRef.current.cardProduced(1, resources));
      },
      getState: () => aggRef.current.getGameState(),
      getCurrentAction: () => aggRef.current.getCurrentCardAction(),
      getEvents: () => aggRef.current.getEvents(),
      setEvents: (events: GameEvent[]) => {
        try {
          const agg = makeAggregate(EMPTY_STATE, defs, stickerDefs);
          agg.loadFromHistory(events);
          aggRef.current = agg;
          sync(agg.getGameState());
        } catch (e) {
          console.error('Failed to set events', e);
        }
      },
      drawCard: (...instanceIds: number[]) => {
        sync(
          aggRef.current.cardAction(
            {
              id: 'cheat_draw',
              unlimited: true,
              actionEffects: [
                {
                  id: 1,
                  type: ActionEffectType.PLAY_CARD,
                  cards: { ids: instanceIds, pickNumber: instanceIds.length },
                },
              ],
            },
            1,
          ),
        );
      },
      discardCard: (...instanceIds: number[]) => {
        sync(
          aggRef.current.cardAction(
            {
              id: 'cheat_discard',
              unlimited: true,
              actionEffects: [
                {
                  id: 1,
                  type: ActionEffectType.DISCARD_CARD,
                  cards: { ids: instanceIds, pickNumber: instanceIds.length },
                },
              ],
            },
            1,
          ),
        );
      },
      destroyCard: (...instanceIds: number[]) => {
        sync(
          aggRef.current.cardAction(
            {
              id: 'cheat_destroy',
              unlimited: true,
              actionEffects: [
                {
                  id: 1,
                  type: ActionEffectType.DESTROY_CARD,
                  cards: { ids: instanceIds, pickNumber: instanceIds.length },
                },
              ],
            },
            1,
          ),
        );
      },
      discoverCard: (...instanceIds: number[]) => {
        sync(
          aggRef.current.cardAction(
            {
              id: 'cheat_discover',
              unlimited: true,
              actionEffects: [
                {
                  id: 1,
                  type: ActionEffectType.DISCOVER_CARD,
                  cards: { ids: instanceIds, pickNumber: instanceIds.length },
                },
              ],
            },
            1,
          ),
        );
      },
      chooseState: (instanceId: number, stateId: number) => {
        sync(aggRef.current.chooseState(instanceId, stateId));
      },
      addSticker: (instanceId: number, stickerId: number) => {
        sync(
          aggRef.current.cardAction(
            {
              id: 'cheat_add_sticker',
              unlimited: true,
              actionEffects: [
                {
                  id: 1,
                  type: ActionEffectType.ADD_STICKER,
                  cards: { ids: [instanceId] },
                  stickers: { ids: [stickerId] },
                },
              ],
            },
            1,
          ),
        );
      },
    };
    return () => {
      delete (globalThis as unknown as Record<string, unknown>).__cheat;
    };
  });

  return (
    <GameContext
      value={{
        gameState,
        defs,
        stickerDefs,
        aggRef,
        pendingChoices,
        triggerPile,
        deleteSave: deleteSaveCallback,
        startGame,
        startRound,
        startTurn,
        chooseState,
        resolveProduction,
        resolveAction,
        resolveUpgrade,
        getCardName,
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
        score,
        displayNewCards,
        setDisplayNewCards,
        getEvents: () => aggRef.current.getEvents(),
        parameters,
      }}
    >
      {children}
    </GameContext>
  );
}
