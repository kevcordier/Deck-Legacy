import { CardActionContext } from '@engine/application/cardAction';
import {
  canAffordTrackAdvanceCost,
  cardIsBlocked,
  getActiveState,
  getEffectiveActionCost,
  getEffectiveUpgradeCost,
} from '@engine/application/cardHelpers';
import { resolveCost } from '@engine/application/costResolver';
import { resolveActionEffect } from '@engine/application/effectResolver';
import {
  destroyCards,
  discardCards,
  mergeResources,
  spendResources,
} from '@engine/application/gameStateHelper';
import { CardChoiceStrategy } from '@engine/application/playerChoice/CardChoiceStrategy';
import { ChooseActionEffectStrategy } from '@engine/application/playerChoice/ChooseActionEffectStrategy';
import type { PlayerChoiceStrategy } from '@engine/application/playerChoice/PlayerChoiceStrategy';
import { ResourceChoiceStrategy } from '@engine/application/playerChoice/ResourceChoiceStrategy';
import { StateChoiceStrategy } from '@engine/application/playerChoice/StateChoiceStrategy';
import { StepChoiceStrategy } from '@engine/application/playerChoice/StepChoiceStrategy';
import { StickerChoiceStrategy } from '@engine/application/playerChoice/StickerChoiceStrategy';
import { ActionEffectType, PendingChoiceType, Trigger } from '@engine/domain/enums';
import type {
  ActionEffect,
  CardAction,
  CardDef,
  CardInstance,
  GameState,
  PendingChoice,
  ResolvedActionEffect,
  ResolvedCost,
  Sticker,
} from '@engine/domain/types';

export class CardActionAggregate {
  readonly def: CardDef;

  gameState: GameState;
  pendingChoices: PendingChoice[];
  private readonly cardActionContext: CardActionContext;
  private readonly playerChoiceStrategies: Record<PendingChoiceType, PlayerChoiceStrategy>;
  effects: ActionEffect[] = [];
  private resolvedCost: ResolvedCost = {
    resources: {},
    discardedCardIds: [],
    destroyedCardIds: [],
  };
  private pendingEffectIndex = -1;
  private pendingResolvedAction: ResolvedActionEffect | null = null;
  private cancelled = false;
  private pendingUpgradeCost: {
    resolvedAction: ResolvedActionEffect;
    resolvedCost: ResolvedCost;
    effectIndex: number;
  } | null = null;
  private pendingTrackCost: {
    resolvedAction: ResolvedActionEffect;
    resolvedCost: ResolvedCost;
    effectIndex: number;
  } | null = null;
  private lastSelectedIds: number[] = [];
  private readonly action: CardAction;
  private readonly endTurn: boolean;
  private readonly endRound: boolean;

  // triger Action
  constructor(
    readonly cardDefs: Record<number, CardDef>,
    readonly stickerDefs: Record<number, Sticker>,
    readonly initGameState: GameState,
    readonly instance: CardInstance,
    readonly _action: CardAction,
    readonly triggerId?: string,
  ) {
    this.def = cardDefs[this.instance.cardId];
    this.gameState = JSON.parse(JSON.stringify(initGameState)) as GameState;
    this.action = JSON.parse(JSON.stringify(_action)) as CardAction;
    this.pendingChoices = [];
    this.cardActionContext = new CardActionContext(cardDefs, stickerDefs);
    this.playerChoiceStrategies = {
      [PendingChoiceType.CHOOSE_CARD]: new CardChoiceStrategy(cardDefs, stickerDefs),
      [PendingChoiceType.CHOOSE_RESOURCE]: new ResourceChoiceStrategy(),
      [PendingChoiceType.CHOOSE_STATE]: new StateChoiceStrategy(),
      [PendingChoiceType.CHOOSE_STICKER]: new StickerChoiceStrategy(),
      [PendingChoiceType.CHOOSE_STEP]: new StepChoiceStrategy(cardDefs),
      [PendingChoiceType.CHOOSE_ACTION_EFFECT]: new ChooseActionEffectStrategy(),
    };
    this.effects = this.action.actionEffects.reduce((acc, effect) => {
      if (effect.repeat) {
        const repeat =
          typeof effect.repeat === 'number'
            ? effect.repeat
            : (this.gameState.instances[this.instance.id].cumulated ?? 0);

        const repeatedEffects = new Array(repeat).fill(effect);
        return [...acc, ...repeatedEffects];
      }
      return [...acc, effect];
    }, [] as ActionEffect[]);
    this.endTurn =
      !!this.action.endsTurn ||
      this.gameState.triggerPile[this.triggerId ?? '']?.effectDef.trigger === Trigger.END_OF_TURN;
    this.endRound =
      this.gameState.triggerPile[this.triggerId ?? '']?.effectDef.trigger === Trigger.END_OF_ROUND;
  }

  // Apply an action effect to the game state
  private apply(resolvedAction: ResolvedActionEffect) {
    this.gameState = this.cardActionContext.apply(
      JSON.parse(JSON.stringify(this.gameState)) as GameState,
      resolvedAction,
    );
  }

  private updateLastSelectedIds(resolvedAction: ResolvedActionEffect) {
    if (resolvedAction.instanceIds && resolvedAction.instanceIds.length > 0) {
      this.lastSelectedIds = resolvedAction.instanceIds;
    }
  }

  private tryResolveUpgradeCost(
    resolvedAction: ResolvedActionEffect,
    effectIndex: number,
  ): 'continue' | 'wait' | 'skip' {
    if (resolvedAction.type !== ActionEffectType.UPGRADE_CARD || !resolvedAction.payingCost) {
      return 'continue';
    }

    const targetId = resolvedAction.instanceIds?.[0];
    if (targetId === undefined) return 'skip';

    const targetInstance = this.gameState.instances[targetId];
    if (!targetInstance) return 'skip';

    const currentState = getActiveState(targetInstance, this.cardDefs);
    const targetStateId = resolvedAction.stateId ?? currentState?.upgrade?.[0]?.upgradeTo;
    if (targetStateId === undefined || !currentState?.upgrade) return 'skip';

    const targetUpgrade = currentState.upgrade.find(u => u.upgradeTo === targetStateId);
    if (!targetUpgrade) return 'skip';

    const effectiveUpgradeCost = getEffectiveUpgradeCost(
      targetUpgrade.cost,
      this.gameState,
      this.cardDefs,
      this.stickerDefs,
      targetId,
    );

    const [resolvedCost, costPendingChoices] = resolveCost(
      effectiveUpgradeCost,
      targetId,
      this.gameState,
      this.cardDefs,
      this.stickerDefs,
      true,
      resolvedAction.sourceInstanceId,
    );

    if (costPendingChoices.length > 0) {
      this.pendingUpgradeCost = {
        resolvedAction,
        resolvedCost,
        effectIndex,
      };
      this.pendingChoices = costPendingChoices;
      return 'wait';
    }

    this.resolvePayCost(resolvedCost);
    return 'continue';
  }

  private tryResolveTrackStepCost(
    resolvedAction: ResolvedActionEffect,
    effectIndex: number,
  ): 'continue' | 'wait' | 'skip' {
    if (resolvedAction.type !== ActionEffectType.TRACK_ADVANCE) return 'continue';
    if (resolvedAction.payingCost === false) return 'continue';

    const targetId = resolvedAction.instanceIds?.[0];
    if (targetId === undefined) return 'skip';

    const targetInstance = this.gameState.instances[targetId];
    if (!targetInstance) return 'skip';

    const targetState = getActiveState(targetInstance, this.cardDefs);
    const track = targetState.track;
    if (!track || !resolvedAction.stepIds || resolvedAction.stepIds.length === 0) {
      return 'continue';
    }

    let simulatedState = this.gameState;
    let mergedResolvedCost: ResolvedCost = {
      resources: {},
      discardedCardIds: [],
      destroyedCardIds: [],
    };
    const costPendingChoices: PendingChoice[] = [];

    for (const stepId of resolvedAction.stepIds) {
      const step = track.steps.find(s => s.id === stepId);
      if (!step) continue;

      const [stepResolvedCost, stepPendingChoices] = resolveCost(
        step.cost ?? {},
        resolvedAction.sourceInstanceId,
        simulatedState,
        this.cardDefs,
        this.stickerDefs,
        true,
      );

      mergedResolvedCost = {
        resources: mergeResources(mergedResolvedCost.resources, stepResolvedCost.resources),
        discardedCardIds: [
          ...mergedResolvedCost.discardedCardIds,
          ...stepResolvedCost.discardedCardIds,
        ],
        destroyedCardIds: [
          ...mergedResolvedCost.destroyedCardIds,
          ...stepResolvedCost.destroyedCardIds,
        ],
      };

      costPendingChoices.push(...stepPendingChoices);

      simulatedState = destroyCards(
        discardCards(
          spendResources(simulatedState, stepResolvedCost.resources),
          stepResolvedCost.discardedCardIds,
          this.cardDefs,
          this.stickerDefs,
        ),
        stepResolvedCost.destroyedCardIds,
      );
    }

    if (costPendingChoices.length > 0) {
      this.pendingTrackCost = {
        resolvedAction,
        resolvedCost: mergedResolvedCost,
        effectIndex,
      };
      this.pendingChoices = costPendingChoices;
      return 'wait';
    }

    this.resolvePayCost(mergedResolvedCost);
    return 'continue';
  }

  resolveAction() {
    if (this.action.limitedTime !== undefined) {
      const currentUsageCount = this.gameState.instances[this.instance.id].usedActionIds.filter(
        usedId => usedId === this.action.id,
      ).length;
      if (currentUsageCount >= this.action.limitedTime) return;
    }

    const currentInstance = this.gameState.instances[this.instance.id];
    const effectiveActionCost = getEffectiveActionCost(this.action.cost, currentInstance);

    if (
      !canAffordTrackAdvanceCost(
        this.action,
        this.instance,
        this.gameState,
        this.cardDefs,
        this.stickerDefs,
      )
    ) {
      return;
    }

    if (cardIsBlocked(this.instance.id, this.gameState)) return;

    const [resolvedCost, costPendingChoices] = resolveCost(
      effectiveActionCost,
      this.instance.id,
      this.gameState,
      this.cardDefs,
      this.stickerDefs,
    );
    this.resolvedCost = resolvedCost;

    // If there are pending choices to resolve the cost, we can't proceed with the action yet.
    if (costPendingChoices.length > 0) {
      this.pendingChoices = costPendingChoices;
      return;
    }

    this.resolvePayCost();

    this.resolveEffectsFrom(0);
  }

  private resolveEffectsFrom(startIndex: number) {
    this.pendingChoices = [];
    let index = startIndex;
    while (index < this.effects.length) {
      const effect = this.effects[index];
      const [resolvedAction, choices] = resolveActionEffect(
        effect,
        this.instance.id,
        this.gameState,
        this.cardDefs,
        this.stickerDefs,
        {
          isMandatory: true,
          parentActionId: this.action.id,
          lastSelectedIds: this.lastSelectedIds,
        },
      );

      if (choices.length > 0) {
        this.pendingEffectIndex = index;
        this.pendingResolvedAction = resolvedAction;
        this.pendingChoices = choices;
        return;
      }

      if (resolvedAction.unresolvable) {
        this.cancelled = true;
        this.gameState = JSON.parse(JSON.stringify(this.initGameState)) as GameState;
        return;
      }

      const outcome = this.processResolvedAction(resolvedAction, index);
      if (outcome === 'wait') {
        return;
      }

      this.updateLastSelectedIds(resolvedAction);

      index++;
    }

    this.pendingEffectIndex = -1;
    this.pendingResolvedAction = null;

    if (this.action.limitedTime !== undefined) {
      this.gameState.instances[this.instance.id].usedActionIds.push(this.action.id);
    }

    if (this.def.parchmentCard) {
      this.gameState = {
        ...this.gameState,
        discoveryPile: this.gameState.discoveryPile.filter(id => id !== this.instance.id),
      };
    }

    if (this.triggerId) {
      const { [this.triggerId]: _used, ...restTriggers } = this.gameState.triggerPile;
      this.gameState.triggerPile = restTriggers;
    }
  }

  private processResolvedAction(
    resolvedAction: ResolvedActionEffect,
    index: number,
  ): 'wait' | 'next' {
    if (resolvedAction.newActionEffects) {
      this.effects.splice(index + 1, 0, ...resolvedAction.newActionEffects);
    }

    const trackCostResolution = this.tryResolveTrackStepCost(resolvedAction, index);
    if (trackCostResolution === 'wait') {
      return 'wait';
    }
    if (trackCostResolution === 'skip') {
      return 'next';
    }

    const upgradeCostResolution = this.tryResolveUpgradeCost(resolvedAction, index);
    if (upgradeCostResolution === 'wait') {
      return 'wait';
    }
    if (upgradeCostResolution === 'skip') {
      return 'next';
    }

    this.apply(resolvedAction);
    return 'next';
  }

  resolvePlayerChoice(choice: ResolvedActionEffect, choiceType?: PendingChoiceType) {
    if (this.pendingChoices.length === 0 || !this.pendingResolvedAction) {
      return;
    }

    const currentChoiceType = choiceType ?? this.pendingChoices[0]?.type;

    const strategy = this.playerChoiceStrategies[currentChoiceType];

    const [mergedResolvedAction, nextPendingChoices] = strategy.apply(
      choice,
      this.pendingResolvedAction,
      this.gameState,
      this.pendingChoices,
    );

    this.pendingResolvedAction = mergedResolvedAction;
    this.pendingChoices = nextPendingChoices;

    if (this.pendingResolvedAction.newActionEffects) {
      this.effects.splice(
        this.pendingEffectIndex + 1,
        0,
        ...this.pendingResolvedAction.newActionEffects,
      );
    }

    if (this.pendingChoices.length > 0) {
      return;
    }

    this.updateLastSelectedIds(mergedResolvedAction);

    const trackCostResolution = this.tryResolveTrackStepCost(
      mergedResolvedAction,
      this.pendingEffectIndex,
    );
    if (trackCostResolution === 'wait') {
      this.pendingResolvedAction = null;
      return;
    }

    const upgradeCostResolution = this.tryResolveUpgradeCost(
      mergedResolvedAction,
      this.pendingEffectIndex,
    );
    if (upgradeCostResolution === 'wait') {
      this.pendingResolvedAction = null;
      return;
    }

    if (
      mergedResolvedAction.type !== ActionEffectType.CHOOSE_EFFECT &&
      trackCostResolution !== 'skip' &&
      upgradeCostResolution !== 'skip'
    ) {
      this.apply(mergedResolvedAction);
    }
    this.pendingChoices = [];
    this.pendingResolvedAction = null;
    this.resolveEffectsFrom(this.pendingEffectIndex + 1);
  }

  resolveCostChoice(resolvedCost: ResolvedCost) {
    if (this.pendingTrackCost) {
      const mergedResolvedCost: ResolvedCost = {
        resources: mergeResources(
          this.pendingTrackCost.resolvedCost.resources,
          resolvedCost.resources,
        ),
        discardedCardIds: [
          ...this.pendingTrackCost.resolvedCost.discardedCardIds,
          ...resolvedCost.discardedCardIds,
        ],
        destroyedCardIds: [
          ...this.pendingTrackCost.resolvedCost.destroyedCardIds,
          ...resolvedCost.destroyedCardIds,
        ],
      };

      const remainingChoices = this.pendingChoices.slice(1);
      if (remainingChoices.length > 0) {
        this.pendingTrackCost = {
          ...this.pendingTrackCost,
          resolvedCost: mergedResolvedCost,
        };
        this.pendingChoices = remainingChoices;
        return;
      }

      this.resolvePayCost(mergedResolvedCost);
      this.updateLastSelectedIds(this.pendingTrackCost.resolvedAction);
      this.apply(this.pendingTrackCost.resolvedAction);
      const nextIndex = this.pendingTrackCost.effectIndex + 1;
      this.pendingTrackCost = null;
      this.pendingChoices = [];
      this.resolveEffectsFrom(nextIndex);
      return;
    }

    if (this.pendingUpgradeCost) {
      const mergedResolvedCost: ResolvedCost = {
        resources: mergeResources(
          this.pendingUpgradeCost.resolvedCost.resources,
          resolvedCost.resources,
        ),
        discardedCardIds: [
          ...this.pendingUpgradeCost.resolvedCost.discardedCardIds,
          ...resolvedCost.discardedCardIds,
        ],
        destroyedCardIds: [
          ...this.pendingUpgradeCost.resolvedCost.destroyedCardIds,
          ...resolvedCost.destroyedCardIds,
        ],
      };

      const remainingChoices = this.pendingChoices.slice(1);
      if (remainingChoices.length > 0) {
        this.pendingUpgradeCost = {
          ...this.pendingUpgradeCost,
          resolvedCost: mergedResolvedCost,
        };
        this.pendingChoices = remainingChoices;
        return;
      }

      this.resolvePayCost(mergedResolvedCost);
      this.updateLastSelectedIds(this.pendingUpgradeCost.resolvedAction);
      this.apply(this.pendingUpgradeCost.resolvedAction);
      const nextIndex = this.pendingUpgradeCost.effectIndex + 1;
      this.pendingUpgradeCost = null;
      this.pendingChoices = [];
      this.resolveEffectsFrom(nextIndex);
      return;
    }

    // Regular action cost: accumulate the resolved choice and handle remaining choices
    this.resolvedCost = {
      resources: mergeResources(this.resolvedCost.resources, resolvedCost.resources),
      discardedCardIds: [...this.resolvedCost.discardedCardIds, ...resolvedCost.discardedCardIds],
      destroyedCardIds: [...this.resolvedCost.destroyedCardIds, ...resolvedCost.destroyedCardIds],
    };

    const remainingChoices = this.pendingChoices.slice(1);
    if (remainingChoices.length > 0) {
      this.pendingChoices = remainingChoices;
      return;
    }

    this.pendingChoices = [];
    this.resolvePayCost();
    this.resolveEffectsFrom(0);
  }

  resolvePayCost(resolvedCost?: ResolvedCost) {
    if (
      !this.triggerId &&
      !this.action.unlimited &&
      !getActiveState(this.instance, this.cardDefs)?.permanent &&
      !this.def.parchmentCard
    ) {
      this.gameState = discardCards(
        this.gameState,
        [this.instance.id],
        this.cardDefs,
        this.stickerDefs,
      );
    }

    this.resolvedCost = {
      resources: mergeResources(this.resolvedCost.resources, resolvedCost?.resources),
      discardedCardIds: [
        ...this.resolvedCost.discardedCardIds,
        ...(resolvedCost?.discardedCardIds ?? []),
      ],
      destroyedCardIds: [
        ...this.resolvedCost.destroyedCardIds,
        ...(resolvedCost?.destroyedCardIds ?? []),
      ],
    };

    this.gameState = destroyCards(
      discardCards(
        spendResources(this.gameState, this.resolvedCost.resources),
        this.resolvedCost.discardedCardIds,
        this.cardDefs,
        this.stickerDefs,
      ),
      this.resolvedCost.destroyedCardIds,
    );
  }

  isCancelled(): boolean {
    return this.cancelled;
  }

  // Use when all effects are resolved and we want to update the game state
  getGameState(): GameState {
    return this.gameState;
  }

  getPendingChoices(): PendingChoice[] {
    return this.pendingChoices;
  }

  getSourceInstanceId(): number {
    return this.instance.id;
  }

  getActionId(): string {
    return this.action.id;
  }

  isEndTurn(): boolean {
    return this.endTurn;
  }

  isEndRound(): boolean {
    return this.endRound;
  }

  getTriggerId(): string | undefined {
    return this.triggerId;
  }
}
