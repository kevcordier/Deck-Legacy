import { getActiveState } from '@engine/application/cardHelpers';
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
    private defs: Record<number, CardDef>,
    private stickerDefs: Record<number, Sticker>,
  ) {}

  private addResourceFromCardChoice(
    productions: Resources[] | undefined,
    choice: ResolvedActionEffect,
    resolvedAction: ResolvedActionEffect,
    pendingChoices: PendingChoice[],
  ): [ResolvedActionEffect, PendingChoice[]] {
    if (productions && productions.length > 0) {
      if (productions.length > 1) {
        const newPendingChoice = pendingChoices.slice(1);
        newPendingChoice.push({
          id: choice.id,
          type: PendingChoiceType.CHOOSE_RESOURCE,
          sourceInstanceId: choice.sourceInstanceId,
          kind: choice.type,
          choices: productions,
          pickCount: 1,
          isMandatory: true,
        });

        return [resolvedAction, newPendingChoice];
      }

      return [
        {
          ...resolvedAction,
          resources: mergeResources(resolvedAction.resources ?? {}, productions?.[0] ?? {}),
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
          pickCount: 1,
          isMandatory: true,
        });

        return [
          {
            ...resolvedAction,
            instanceIds: choice.instanceIds,
            stickerId: stickerChoices[0],
          },
          newPendingChoice,
        ];
      }

      return [
        {
          ...resolvedAction,
          instanceIds: choice.instanceIds,
          stickerId: stickerChoices[0],
        },
        pendingChoices.slice(1),
      ];
    }
    return [resolvedAction, pendingChoices.slice(1)];
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
      );
    } else if (choice.type === ActionEffectType.BOOST_CARD) {
      return this.boostCardFromCardChoice(
        state.productions,
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
