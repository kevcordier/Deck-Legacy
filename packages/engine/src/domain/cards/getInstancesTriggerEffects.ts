import type { Trigger } from '../enums';
import type { CardAction, CardDef, CardInstance, GameState, Sticker, TriggerEntry } from '../types';
import { canAffordCost } from './canAffordCost';
import { canAffordTrackAdvanceCost } from './canAffordTrackAdvanceCost';
import { cardSelector } from './selection/cardSelector';
import { evaluateCondition } from './selection/evaluateCondition';
import { getActiveState } from './selection/getActiveState';

/** Actions of the cards in play (not among `sources`) whose `triggeredBy` matches a card. */
function getTriggeredByEffects(
  sources: CardInstance[],
  defs: Record<number, CardDef>,
  gameState: GameState,
  canFire: (ce: CardAction, instance: CardInstance) => boolean,
  stickerDefs: Record<number, Sticker>,
): TriggerEntry[] {
  const sourceIds = new Set(sources.map(instance => instance.id));
  return [...new Set([...gameState.board, ...gameState.permanents])]
    .filter(id => !sourceIds.has(id))
    .map(id => gameState.instances[id])
    .filter(Boolean)
    .flatMap(instance =>
      (getActiveState(instance, defs).actions ?? [])
        .filter(
          ce =>
            ce.triggeredBy &&
            canFire(ce, instance) &&
            cardSelector(ce.triggeredBy, instance.id, gameState, defs, stickerDefs).length > 0,
        )
        .map(effectDef => ({ effectDef, sourceInstanceId: instance.id })),
    );
}

export function getInstancesTriggerEffects(
  instances: CardInstance[],
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  effect: Trigger,
  gameState: GameState,
): TriggerEntry[] {
  const canFire = (ce: CardAction, instance: CardInstance) =>
    ce.trigger === effect &&
    (!ce.condition || evaluateCondition(ce.condition, gameState, instance.id, defs, stickerDefs)) &&
    canAffordCost(ce.cost, instance.id, gameState, defs, stickerDefs) &&
    canAffordTrackAdvanceCost(ce, instance, gameState, defs, stickerDefs) &&
    !instance.usedActionIds?.includes(ce.id);

  const effects = instances.reduce<TriggerEntry[]>((acc, instance) => {
    const state = getActiveState(instance, defs);
    const effects = state.actions?.filter(ce => canFire(ce, instance)) ?? [];

    return [...acc, ...effects.map(effectDef => ({ effectDef, sourceInstanceId: instance.id }))];
  }, [] as TriggerEntry[]);

  effects.push(...getTriggeredByEffects(instances, defs, gameState, canFire, stickerDefs));

  return effects;
}
