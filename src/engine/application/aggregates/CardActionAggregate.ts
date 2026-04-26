import { CardActionContext } from '@engine/application/cardAction';
import {
  canAffordCardCost,
  canAffordResources,
  cardIsBlocked,
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
import { ActionEffectType, PendingChoiceType } from '@engine/domain/enums';
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
  private readonly action: CardAction;

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
    this.effects = this.action.actionEffects;
  }

  // Apply an action effect to the game state
  private apply(resolvedAction: ResolvedActionEffect) {
    this.gameState = this.cardActionContext.apply(this.gameState, resolvedAction);
  }

  resolveAction() {
    if (this.action.onTime) {
      if (this.instance.usedActionIds.includes(this.action.id)) return;
    }

    if (!canAffordResources(this.gameState.resources, this.action.cost ?? {})) {
      return;
    }

    if (
      !canAffordCardCost(
        this.action.cost,
        this.instance.id,
        this.gameState,
        this.cardDefs,
        this.stickerDefs,
      )
    ) {
      return;
    }

    if (cardIsBlocked(this.instance.id, this.gameState)) return;

    const [resolvedCost, costPendingChoices] = resolveCost(
      this.action.cost ?? {},
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
        true,
      );

      if (choices.length > 0) {
        this.pendingEffectIndex = index;
        this.pendingResolvedAction = resolvedAction;
        this.pendingChoices = choices;
        return;
      }

      if (resolvedAction.newActionEffects) {
        this.effects.splice(index + 1, 0, ...resolvedAction.newActionEffects);
      }

      this.apply(resolvedAction);
      index++;
    }

    this.pendingEffectIndex = -1;
    this.pendingResolvedAction = null;

    if (this.action.onTime) {
      this.gameState.instances[this.instance.id].usedActionIds.push(this.action.id);
    }

    if (!this.triggerId && !this.action.passive && !this.def.permanent && !this.def.parchmentCard) {
      this.gameState = discardCards(this.gameState, [this.instance.id]);
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

    if (mergedResolvedAction.type !== ActionEffectType.CHOOSE_EFFECT) {
      this.apply(mergedResolvedAction);
    }
    this.pendingChoices = [];
    this.pendingResolvedAction = null;
    this.resolveEffectsFrom(this.pendingEffectIndex + 1);
  }

  resolveCostChoice(resolvedCost: ResolvedCost) {
    this.pendingChoices = [];
    this.resolvePayCost(resolvedCost);
    this.resolveEffectsFrom(0);
  }

  resolvePayCost(resolvedCost?: ResolvedCost) {
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
      ),
      this.resolvedCost.destroyedCardIds,
    );
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
    return !!this.action.endsTurn;
  }
}
