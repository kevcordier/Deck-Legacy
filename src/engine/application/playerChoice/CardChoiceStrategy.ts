import { getActiveState, getEffectiveProductions } from '@engine/application/cardHelpers';
import { mergeResources } from '@engine/application/gameStateHelper';
import type { PlayerChoiceStrategy } from '@engine/application/playerChoice/PlayerChoiceStrategy';
import { ActionEffectType, PendingChoiceType } from '@engine/domain/enums';
import type {
  CardDef,
  GameState,
  PendingChoice,
  ResolvedActionEffect,
  Resources,
  Sticker,
} from '@engine/domain/types';

export class CardChoiceStrategy implements PlayerChoiceStrategy {
  constructor(
    private readonly defs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

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
