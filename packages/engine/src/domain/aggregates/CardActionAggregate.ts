import { CardActionContext } from '../cardAction';
import { canAffordTrackAdvanceCost } from '../cards/canAffordTrackAdvanceCost';
import { cardIsBlocked } from '../cards/cardIsBlocked';
import { getEffectiveActionCost } from '../cards/getEffectiveActionCost';
import { getEffectiveUpgradeCost } from '../cards/getEffectiveUpgradeCost';
import { getInstancesTriggerEffects } from '../cards/getInstancesTriggerEffects';
import { hasUsesLeft } from '../cards/hasUsesLeft';
import { cardSelector } from '../cards/selection/cardSelector';
import { countValuePerElement } from '../cards/selection/countValuePerElement';
import { evaluateCondition } from '../cards/selection/evaluateCondition';
import { getActiveState } from '../cards/selection/getActiveState';
import { getStateActions } from '../cards/selection/getStateActions';
import { isPermanent } from '../cards/selection/isPermanent';
import { turnUseKey } from '../cards/turnUseKey';
import { resolveCost } from '../costResolver';
import { resolveActionEffect } from '../effects/resolveActionEffect';
import { ActionEffectType, PendingChoiceType, Phase, Trigger } from '../enums';
import { environment } from '../environment/environment';
import { CardChoiceStrategy } from '../playerChoice/CardChoiceStrategy';
import { ChooseActionEffectStrategy } from '../playerChoice/ChooseActionEffectStrategy';
import type { PlayerChoiceStrategy } from '../playerChoice/PlayerChoiceStrategy';
import { ResourceChoiceStrategy } from '../playerChoice/ResourceChoiceStrategy';
import { StateChoiceStrategy } from '../playerChoice/StateChoiceStrategy';
import { StepChoiceStrategy } from '../playerChoice/StepChoiceStrategy';
import { StickerChoiceStrategy } from '../playerChoice/StickerChoiceStrategy';
import { hasAnyAmountCost } from '../resources/hasAnyAmountCost';
import { mergeResources } from '../resources/mergeResources';
import { destroyCards } from '../state/destroyCards';
import { discardCards } from '../state/discardCards';
import { discardCardsMissingRequirement } from '../state/discardCardsMissingRequirement';
import { removeFromDiscovery } from '../state/removeFromDiscovery';
import { spendResources } from '../state/spendResources';
import type {
  ActionEffect,
  CardAction,
  CardDef,
  CardInstance,
  GameState,
  PendingChoice,
  ResolvedActionEffect,
  ResolvedCost,
  Resources,
  Sticker,
} from '../types';

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
  private pendingEffectCost: {
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
  private readonly selectedResourcesByChoiceKey: Record<string, Resources[]> = {};
  private readonly action: CardAction;
  private endTurn: boolean;
  private readonly endRound: boolean;
  /** Amount paid for an `'any'` resource cost: the action's effects apply once per unit. */
  private readonly amount: number;

  // triger Action
  constructor(
    readonly cardDefs: Record<number, CardDef>,
    readonly stickerDefs: Record<number, Sticker>,
    readonly initGameState: GameState,
    readonly instance: CardInstance,
    readonly _action: CardAction,
    readonly triggerId?: string,
    amount = 1,
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
      // A split is a cost: paid by resolveCostChoice, like the other cost choices.
      [PendingChoiceType.SPLIT_RESOURCES]: new ResourceChoiceStrategy(),
    };
    this.amount = hasAnyAmountCost(this.action.cost) ? amount : 1;
    const effects = this.action.actionEffects.reduce((acc, effect) => {
      const effectiveEffects = this.getEffectiveActionEffects(effect);
      return [...acc, ...effectiveEffects];
    }, [] as ActionEffect[]);
    this.effects = Array.from({ length: Math.max(0, this.amount) }, () => effects).flat();
    const triggerEntry = this.gameState.triggerPile[this.triggerId ?? ''];
    this.endTurn =
      !!this.action.endsTurn ||
      !!triggerEntry?.endsTurn ||
      triggerEntry?.effectDef.trigger === Trigger.END_OF_TURN;
    this.endRound =
      this.gameState.triggerPile[this.triggerId ?? '']?.effectDef.trigger === Trigger.END_OF_ROUND;
  }

  private getEffectiveActionEffects(effect: ActionEffect): ActionEffect[] {
    if (effect.cards?.each) {
      // "Cross out 1 production on each land in play": one copy for each card.
      const { each: _each, ...cards } = effect.cards;
      return cardSelector(
        cards,
        this.instance.id,
        this.gameState,
        this.cardDefs,
        this.stickerDefs,
      ).map(id => ({ ...effect, cards: { ...cards, ids: [id] } }));
    }
    if (!effect.repeat) {
      return [effect];
    }

    if (effect.repeat === 'valuePerElement') {
      // "For every 3 enemies, cross out 1 production": each copy picks its own card.
      const { valuePerElement, repeat: _repeat, ...single } = effect;
      const count = valuePerElement
        ? valuePerElement.amount *
          countValuePerElement(
            valuePerElement,
            this.gameState,
            this.instance.id,
            this.cardDefs,
            this.stickerDefs,
          )
        : 0;
      return new Array(Math.max(0, count)).fill(single);
    }

    const repeat =
      typeof effect.repeat === 'number'
        ? effect.repeat
        : (this.gameState.instances[this.instance.id].cumulated ?? 0);

    return new Array(repeat).fill(effect);
  }

  /** Inserts effects after `index`; they resolve for the same card as the effect there. */
  private insertEffects(index: number, newEffects: ActionEffect[]) {
    const sourceId = this.effects[index]?.sourceInstanceId;
    const effectiveEffects = newEffects
      .map(effect =>
        sourceId === undefined || effect.sourceInstanceId !== undefined
          ? effect
          : { ...effect, sourceInstanceId: sourceId },
      )
      .flatMap(effect => this.getEffectiveActionEffects(effect));
    this.effects.splice(index + 1, 0, ...effectiveEffects);
  }

  /** USE_CARD_ACTION: pays the used action's cost, for the card that owns it. */
  private tryResolveUsedActionCost(
    resolvedAction: ResolvedActionEffect,
    effectIndex: number,
  ): 'continue' | 'wait' {
    const usedAction = this.effects[effectIndex]?.usedAction;
    if (resolvedAction.type !== ActionEffectType.USE_CARD_ACTION || !usedAction) {
      return 'continue';
    }
    const owner = this.gameState.instances[usedAction.instanceId];
    const action = getStateActions(owner, this.cardDefs, this.stickerDefs).find(
      a => a.id === usedAction.actionId,
    );
    const [resolvedCost, costPendingChoices] = resolveCost(
      getEffectiveActionCost(action?.cost, owner),
      owner.id,
      this.gameState,
      this.cardDefs,
      this.stickerDefs,
      true,
    );
    if (costPendingChoices.length > 0) {
      this.pendingEffectCost = { resolvedAction, resolvedCost, effectIndex };
      this.pendingChoices = costPendingChoices;
      return 'wait';
    }
    this.resolvePayCost(resolvedCost);
    return 'continue';
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

  private getPendingChoiceKey(choice: PendingChoice): string {
    return [
      choice.kind,
      choice.sourceInstanceId,
      choice.actionId ?? '',
      choice.effectId ?? '',
      choice.sourceStepId ?? '',
    ].join(':');
  }

  private decoratePendingChoices(pendingChoices: PendingChoice[]): PendingChoice[] {
    // The player can cancel an action they started; triggers and parchment cards must resolve.
    const isPlayerAction = !this.triggerId && this.initGameState.phase !== Phase.PARCHMENT;
    return pendingChoices.map(pendingChoice => {
      const choice = isPlayerAction ? { ...pendingChoice, isMandatory: false } : pendingChoice;
      if (choice.type !== PendingChoiceType.CHOOSE_RESOURCE) {
        return choice;
      }

      const selectedChoices = this.selectedResourcesByChoiceKey[this.getPendingChoiceKey(choice)];
      if (!selectedChoices || selectedChoices.length === 0) {
        return choice;
      }

      return {
        ...choice,
        selectedChoices,
      };
    });
  }

  private recordSelectedResourceChoice(choice: PendingChoice, resources?: Resources) {
    if (choice.type !== PendingChoiceType.CHOOSE_RESOURCE || !resources) {
      return;
    }

    const key = this.getPendingChoiceKey(choice);
    this.selectedResourcesByChoiceKey[key] = [
      ...(this.selectedResourcesByChoiceKey[key] ?? []),
      resources,
    ];
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
      this.pendingEffectCost = {
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
    if (!hasUsesLeft(this.action, this.gameState.instances[this.instance.id], this.gameState)) {
      return;
    }

    if (!Number.isInteger(this.amount) || this.amount < 1) return;

    const currentInstance = this.gameState.instances[this.instance.id];
    const effectiveActionCost = getEffectiveActionCost(
      this.action.cost,
      currentInstance,
      this.amount,
    );

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

    if (
      !this.triggerId &&
      this.action.condition &&
      !evaluateCondition(
        this.action.condition,
        this.gameState,
        this.instance.id,
        this.cardDefs,
        this.stickerDefs,
      )
    ) {
      this.cancelled = true;
      return;
    }

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
      const sourceId = effect.sourceInstanceId ?? this.instance.id;
      if (
        effect.condition &&
        !evaluateCondition(
          effect.condition,
          this.gameState,
          sourceId,
          this.cardDefs,
          this.stickerDefs,
        )
      ) {
        index++;
        continue;
      }
      const [resolvedAction, choices] = resolveActionEffect(
        effect,
        sourceId,
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
        this.pendingChoices = this.decoratePendingChoices(choices);
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
    if (this.action.perTurn !== undefined) {
      this.gameState.turnUsedActions = [
        ...(this.gameState.turnUsedActions ?? []),
        turnUseKey(this.instance.id, this.action.id),
      ];
    }

    if (this.action.defeat) {
      this.queueDefeatTriggers();
    }
    this.gameState = discardCardsMissingRequirement(
      this.gameState,
      this.cardDefs,
      this.stickerDefs,
    );

    if (this.def.parchmentCard) {
      this.gameState = { ...this.gameState };
      removeFromDiscovery(this.gameState, [this.instance.id]);
    }

    if (this.triggerId) {
      const { [this.triggerId]: _used, ...restTriggers } = this.gameState.triggerPile;
      this.gameState.triggerPile = restTriggers;
    }
  }

  private queueDefeatTriggers() {
    const inPlay = [...new Set([...this.gameState.board, ...this.gameState.permanents])]
      .map(id => this.gameState.instances[id])
      .filter(Boolean);
    getInstancesTriggerEffects(
      inPlay,
      this.cardDefs,
      this.stickerDefs,
      Trigger.ON_DEFEAT,
      this.gameState,
    ).forEach(entry => {
      this.gameState.triggerPile[environment.newId()] = entry;
    });
  }

  private processResolvedAction(
    resolvedAction: ResolvedActionEffect,
    index: number,
  ): 'wait' | 'next' {
    if (resolvedAction.type === ActionEffectType.END_TURN) {
      this.endTurn = true;
    }
    if (resolvedAction.newActionEffects) {
      this.insertEffects(index, resolvedAction.newActionEffects);
    }

    const usedActionCostResolution = this.tryResolveUsedActionCost(resolvedAction, index);
    if (usedActionCostResolution === 'wait') {
      return 'wait';
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
    const activePendingChoice = this.pendingChoices[0];

    if (activePendingChoice) {
      this.recordSelectedResourceChoice(activePendingChoice, choice.resources);
    }

    const [mergedResolvedAction, nextPendingChoices] = strategy.apply(
      choice,
      this.pendingResolvedAction,
      this.gameState,
      this.pendingChoices,
    );

    this.pendingResolvedAction = mergedResolvedAction;
    this.pendingChoices = this.decoratePendingChoices(nextPendingChoices);

    if (this.pendingResolvedAction.newActionEffects) {
      this.insertEffects(this.pendingEffectIndex, this.pendingResolvedAction.newActionEffects);
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

    if (this.pendingEffectCost) {
      const mergedResolvedCost: ResolvedCost = {
        resources: mergeResources(
          this.pendingEffectCost.resolvedCost.resources,
          resolvedCost.resources,
        ),
        discardedCardIds: [
          ...this.pendingEffectCost.resolvedCost.discardedCardIds,
          ...resolvedCost.discardedCardIds,
        ],
        destroyedCardIds: [
          ...this.pendingEffectCost.resolvedCost.destroyedCardIds,
          ...resolvedCost.destroyedCardIds,
        ],
      };

      const remainingChoices = this.pendingChoices.slice(1);
      if (remainingChoices.length > 0) {
        this.pendingEffectCost = {
          ...this.pendingEffectCost,
          resolvedCost: mergedResolvedCost,
        };
        this.pendingChoices = remainingChoices;
        return;
      }

      this.resolvePayCost(mergedResolvedCost);
      this.updateLastSelectedIds(this.pendingEffectCost.resolvedAction);
      this.apply(this.pendingEffectCost.resolvedAction);
      const nextIndex = this.pendingEffectCost.effectIndex + 1;
      this.pendingEffectCost = null;
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

  private payCost(cost: ResolvedCost) {
    const paid = spendResources(this.gameState, cost.resources);
    // Without a card to discard, the cards just discarded (read by ON_DISCARD triggers) stay known.
    const afterDiscard =
      cost.discardedCardIds.length > 0
        ? discardCards(paid, cost.discardedCardIds, this.cardDefs, this.stickerDefs)
        : paid;
    this.gameState = destroyCards(afterDiscard, cost.destroyedCardIds);
  }

  /**
   * Without argument, pays the action cost (and discards the played card). With a step or
   * upgrade cost, pays only that cost: the action cost was already paid.
   */
  resolvePayCost(resolvedCost?: ResolvedCost) {
    if (resolvedCost) {
      this.payCost(resolvedCost);
      return;
    }

    if (
      !this.triggerId &&
      !this.action.unlimited &&
      !isPermanent(getActiveState(this.instance, this.cardDefs)) &&
      !this.def.parchmentCard
    ) {
      this.gameState = discardCards(
        this.gameState,
        [this.instance.id],
        this.cardDefs,
        this.stickerDefs,
      );
    }

    this.payCost(this.resolvedCost);
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
