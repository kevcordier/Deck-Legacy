import { getUsableActionEffects } from '../cards/getUsableActionEffects';
import { PendingChoiceType } from '../enums';
import type { CardDef, GameState, PendingChoice, ResolvedActionEffect, Sticker } from '../types';

/**
 * Once the card of a USE_CARD_ACTION is known: its only usable action follows directly, or the
 * player chooses among them (`template` gives the pending choice its ids).
 */
export function chooseUsedAction(
  resolvedAction: ResolvedActionEffect,
  targetId: number | undefined,
  template: Omit<PendingChoice, 'type' | 'choices' | 'pickMin' | 'pickMax'>,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): [ResolvedActionEffect, PendingChoice[]] {
  const options =
    targetId === undefined ? [] : getUsableActionEffects(targetId, gameState, defs, stickerDefs);
  const resolved = { ...resolvedAction, instanceIds: targetId === undefined ? [] : [targetId] };
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
