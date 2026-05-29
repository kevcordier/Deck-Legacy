import {
  getActiveState,
  getEffectiveActionCost,
  getEffectiveProductions,
  getEffectiveUpgradeCost,
} from '@engine/application/cardHelpers';
import { mergeResources } from '@engine/application/gameStateHelper';
import type { PlayerChoiceStrategy } from '@engine/application/playerChoice/PlayerChoiceStrategy';
import { ActionEffectType, PendingChoiceType } from '@engine/domain/enums';
import type {
  CardDef,
  Cost,
  GameState,
  PendingChoice,
  RemovedResourceScope,
  ResolvedActionEffect,
  Resources,
  Sticker,
} from '@engine/domain/types';

export class CardChoiceStrategy implements PlayerChoiceStrategy {
  constructor(
    private readonly defs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

  private getEffectiveProductionResourceKeys(instanceId: number, gs: GameState): Set<string> {
    const instance = gs.instances[instanceId];
    if (!instance) return new Set();
    const state = getActiveState(instance, this.defs);
    const keys = (state?.productions ?? []).flatMap(prod =>
      Object.entries(getEffectiveProductions(prod, gs, this.defs, instance, this.stickerDefs))
        .filter(([, value]) => (value ?? 0) > 0)
        .map(([resourceKey]) => resourceKey),
    );
    return new Set(keys);
  }

  private getCostResourceKeys(cost: Cost | undefined): Set<string> {
    if (!cost?.resources?.length) return new Set();

    const keys = cost.resources.flatMap(resourceCost =>
      Object.entries(resourceCost)
        .filter(([, value]) => (value ?? 0) > 0)
        .map(([resourceKey]) => resourceKey),
    );

    return new Set(keys);
  }

  private getActionCostResourceKeys(instanceId: number, gs: GameState): Set<string> {
    const instance = gs.instances[instanceId];
    if (!instance) return new Set();
    const state = getActiveState(instance, this.defs);
    if (!state.actions?.length) return new Set();

    const keys = state.actions.flatMap(action => [
      ...this.getCostResourceKeys(getEffectiveActionCost(action.cost, instance)),
    ]);

    return new Set(keys);
  }

  private getUpgradeCostResourceKeys(instanceId: number, gs: GameState): Set<string> {
    const instance = gs.instances[instanceId];
    if (!instance) return new Set();
    const state = getActiveState(instance, this.defs);
    if (!state.upgrade?.length) return new Set();

    const keys = state.upgrade.flatMap(upgrade => [
      ...this.getCostResourceKeys(
        getEffectiveUpgradeCost(upgrade.cost, gs, this.defs, this.stickerDefs, instanceId),
      ),
    ]);

    return new Set(keys);
  }

  private getCandidateResourceKeys(
    instanceId: number,
    resourceScopes: RemovedResourceScope[] | undefined,
    gs: GameState,
  ): Set<string> {
    const scopes = resourceScopes?.length
      ? resourceScopes
      : (['production', 'actionCost', 'upgradeCost'] as RemovedResourceScope[]);

    return scopes.reduce((acc, scope) => {
      let keys = new Set<string>();
      if (scope === 'production') {
        keys = this.getEffectiveProductionResourceKeys(instanceId, gs);
      } else if (scope === 'actionCost') {
        keys = this.getActionCostResourceKeys(instanceId, gs);
      } else if (scope === 'upgradeCost') {
        keys = this.getUpgradeCostResourceKeys(instanceId, gs);
      }

      keys.forEach(key => acc.add(key));
      return acc;
    }, new Set<string>());
  }

  private filterRemoveResourceChoicesByEffectiveProduction(
    choice: ResolvedActionEffect,
    resolvedAction: ResolvedActionEffect,
    pendingChoices: PendingChoice[],
    gs: GameState,
  ): [ResolvedActionEffect, PendingChoice[]] {
    const remainingPendingChoices = pendingChoices.slice(1);
    const targetInstanceId = choice.instanceIds?.[0];

    const targetIndex = remainingPendingChoices.findIndex(
      pendingChoice =>
        pendingChoice.type === PendingChoiceType.CHOOSE_RESOURCE &&
        pendingChoice.kind === ActionEffectType.REMOVE_RESOURCE_ON_CARD,
    );

    const nextResolvedAction: ResolvedActionEffect = {
      ...resolvedAction,
      instanceIds: choice.instanceIds,
    };

    if (targetIndex === -1) {
      return [nextResolvedAction, remainingPendingChoices];
    }

    const targetChoice = remainingPendingChoices[targetIndex];
    const candidateResourceKeys =
      targetInstanceId === undefined
        ? new Set<string>()
        : this.getCandidateResourceKeys(targetInstanceId, targetChoice.resourceScopes, gs);
    const filteredChoices = targetChoice.choices
      .filter((option): option is Resources => typeof option === 'object' && !Array.isArray(option))
      .filter(option => {
        const resourceEntries = Object.entries(option).filter(([, value]) => (value ?? 0) > 0);
        if (resourceEntries.length === 0) {
          return false;
        }

        return resourceEntries.every(([resourceKey]) => candidateResourceKeys.has(resourceKey));
      });

    if (filteredChoices.length === 0) {
      return [
        nextResolvedAction,
        remainingPendingChoices.filter((_, index) => index !== targetIndex),
      ];
    }

    if (filteredChoices.length === 1) {
      return [
        {
          ...nextResolvedAction,
          resources: mergeResources(nextResolvedAction.resources ?? {}, filteredChoices[0]),
        },
        remainingPendingChoices.filter((_, index) => index !== targetIndex),
      ];
    }

    const nextPendingChoices = [...remainingPendingChoices];
    nextPendingChoices[targetIndex] = {
      ...targetChoice,
      choices: filteredChoices,
      pickMax: Math.min(targetChoice.pickMax, filteredChoices.length),
      pickMin: Math.min(targetChoice.pickMin, filteredChoices.length),
    };

    return [nextResolvedAction, nextPendingChoices];
  }

  private addResourceFromCardChoice(
    productions: Resources[] | undefined,
    choice: ResolvedActionEffect,
    resolvedAction: ResolvedActionEffect,
    pendingChoices: PendingChoice[],
    gs: GameState,
    instanceId: number,
  ): [ResolvedActionEffect, PendingChoice[]] {
    if (productions && productions.length > 0) {
      if (productions.length > 1) {
        const newPendingChoice = pendingChoices.slice(1);
        newPendingChoice.push({
          id: choice.id,
          type: PendingChoiceType.CHOOSE_RESOURCE,
          sourceInstanceId: choice.sourceInstanceId,
          kind: choice.type,
          choices: productions.map(p =>
            getEffectiveProductions(p, gs, this.defs, gs.instances[instanceId], this.stickerDefs),
          ),
          pickMin: 1,
          pickMax: 1,
          isMandatory: true,
        });

        return [resolvedAction, newPendingChoice];
      }

      return [
        {
          ...resolvedAction,
          resources: mergeResources(
            resolvedAction.resources ?? {},
            getEffectiveProductions(
              productions[0],
              gs,
              this.defs,
              gs.instances[instanceId],
              this.stickerDefs,
            ),
          ),
        },
        pendingChoices.slice(1),
      ];
    }

    return [resolvedAction, pendingChoices.slice(1)];
  }

  private boostCardFromCardChoice(
    productions: Resources[] | undefined,
    choice: ResolvedActionEffect,
    resolvedAction: ResolvedActionEffect,
    pendingChoices: PendingChoice[],
    gs: GameState,
  ): [ResolvedActionEffect, PendingChoice[]] {
    if (productions && productions.length > 0) {
      const stickerChoices = Object.keys(productions[0])
        .map(rt => Object.values(this.stickerDefs).find(s => s.production === rt)?.id)
        .filter((id): id is number => id !== undefined && (gs.stickerStock[id] ?? 0) > 0);
      if (stickerChoices.length > 1) {
        const newPendingChoice = pendingChoices.slice(1);
        newPendingChoice.push({
          id: choice.id,
          type: PendingChoiceType.CHOOSE_STICKER,
          sourceInstanceId: choice.sourceInstanceId,
          kind: choice.type,
          choices: stickerChoices,
          pickMin: 1,
          pickMax: 1,
          isMandatory: true,
        });

        return [
          {
            ...resolvedAction,
            instanceIds: choice.instanceIds,
            stickerIds: stickerChoices,
          },
          newPendingChoice,
        ];
      }

      return [
        {
          ...resolvedAction,
          instanceIds: choice.instanceIds,
          stickerIds: stickerChoices,
        },
        pendingChoices.slice(1),
      ];
    }
    return [resolvedAction, pendingChoices.slice(1)];
  }

  private setUpgradeStateFromCardChoice(
    choice: ResolvedActionEffect,
    resolvedAction: ResolvedActionEffect,
    gs: GameState,
    pendingChoices: PendingChoice[],
  ): [ResolvedActionEffect, PendingChoice[]] {
    const remainingPendingChoices = pendingChoices.slice(1);
    if (resolvedAction.stateId !== undefined) {
      return [
        {
          ...resolvedAction,
          instanceIds: choice.instanceIds,
        },
        remainingPendingChoices,
      ];
    }

    const hasPendingStateChoice = remainingPendingChoices.some(
      pendingChoice =>
        pendingChoice.type === PendingChoiceType.CHOOSE_STATE &&
        pendingChoice.kind === ActionEffectType.UPGRADE_CARD,
    );
    if (hasPendingStateChoice) {
      return [
        {
          ...resolvedAction,
          instanceIds: choice.instanceIds,
        },
        remainingPendingChoices,
      ];
    }

    const targetId = choice.instanceIds?.[0];
    if (targetId === undefined) {
      return [
        {
          ...resolvedAction,
          instanceIds: choice.instanceIds,
        },
        remainingPendingChoices,
      ];
    }

    const targetInstance = gs.instances[targetId];
    if (!targetInstance) {
      return [
        {
          ...resolvedAction,
          instanceIds: choice.instanceIds,
        },
        remainingPendingChoices,
      ];
    }

    const targetState = getActiveState(targetInstance, this.defs);
    const upgradeChoices = [
      ...new Set((targetState.upgrade ?? []).map(upgrade => upgrade.upgradeTo)),
    ];

    if (upgradeChoices.length === 1) {
      return [
        {
          ...resolvedAction,
          instanceIds: choice.instanceIds,
          stateId: upgradeChoices[0],
        },
        remainingPendingChoices,
      ];
    }

    if (upgradeChoices.length > 1) {
      return [
        {
          ...resolvedAction,
          instanceIds: choice.instanceIds,
        },
        [
          ...remainingPendingChoices,
          {
            id: choice.id,
            type: PendingChoiceType.CHOOSE_STATE,
            sourceInstanceId: choice.sourceInstanceId,
            targetInstanceId: targetId,
            kind: ActionEffectType.UPGRADE_CARD,
            choices: upgradeChoices,
            pickMin: 1,
            pickMax: 1,
            isMandatory: true,
          },
        ],
      ];
    }

    return [
      {
        ...resolvedAction,
        instanceIds: choice.instanceIds,
      },
      remainingPendingChoices,
    ];
  }

  apply(
    choice: ResolvedActionEffect,
    resolvedAction: ResolvedActionEffect,
    gs: GameState,
    pendingChoices: PendingChoice[],
  ): [ResolvedActionEffect, PendingChoice[]] {
    if (!choice.instanceIds || choice.instanceIds.length === 0) {
      return [resolvedAction, pendingChoices.slice(1)];
    }

    const state = getActiveState(gs.instances[choice.instanceIds[0]], this.defs);
    if (choice.type === ActionEffectType.ADD_RESOURCES) {
      return this.addResourceFromCardChoice(
        state.productions,
        choice,
        resolvedAction,
        pendingChoices,
        gs,
        choice.instanceIds[0],
      );
    } else if (choice.type === ActionEffectType.BOOST_CARD) {
      return this.boostCardFromCardChoice(
        state.productions,
        choice,
        resolvedAction,
        pendingChoices,
        gs,
      );
    } else if (choice.type === ActionEffectType.UPGRADE_CARD) {
      return this.setUpgradeStateFromCardChoice(choice, resolvedAction, gs, pendingChoices);
    } else if (choice.type === ActionEffectType.REMOVE_RESOURCE_ON_CARD) {
      return this.filterRemoveResourceChoicesByEffectiveProduction(
        choice,
        resolvedAction,
        pendingChoices,
        gs,
      );
    } else {
      return [
        {
          ...resolvedAction,
          instanceIds: choice.instanceIds,
        },
        pendingChoices.slice(1),
      ];
    }
  }
}
