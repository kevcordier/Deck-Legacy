import { getStateActions } from '../cards/selection/getStateActions';
import { ActionEffectType, PendingChoiceType } from '../enums';
import type {
  ActionEffect,
  CardDef,
  GameState,
  PendingChoice,
  ResolvedActionEffect,
  Sticker,
} from '../types';

/**
 * Once the card of a CROSS_OUT_ACTION is known: its activated effects ({{action}}: no trigger,
 * does not end the turn) are the options; a single one is crossed out directly.
 */
export function chooseCrossedOutAction(
  resolvedAction: ResolvedActionEffect,
  targetId: number | undefined,
  template: Omit<PendingChoice, 'type' | 'choices' | 'pickMin' | 'pickMax'>,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): [ResolvedActionEffect, PendingChoice[]] {
  const instance = targetId === undefined ? undefined : gameState.instances[targetId];
  const options: ActionEffect[] = instance
    ? getStateActions(instance, defs, stickerDefs)
        .filter(action => !action.trigger && !action.endsTurn)
        .map((action, index) => ({
          id: index + 1,
          type: ActionEffectType.CROSS_OUT_ACTION,
          usedAction: { instanceId: instance.id, actionId: action.id },
        }))
    : [];
  const resolved = { ...resolvedAction, instanceIds: instance ? [instance.id] : [] };
  if (options.length <= 1) return [{ ...resolved, newActionEffects: options }, []];
  return [
    resolved,
    [
      {
        ...template,
        type: PendingChoiceType.CHOOSE_ACTION_EFFECT,
        targetInstanceId: targetId,
        choices: options,
        pickMin: 1,
        pickMax: 1,
      },
    ],
  ];
}
