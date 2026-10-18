import { ActionEffectType } from '../enums';
import type { CardAction, CardDef, CardInstance, GameState, Sticker } from '../types';
import { canAffordCost } from './canAffordCost';
import { getFirstAvailableTrackStep } from './getFirstAvailableTrackStep';
import { getActiveState } from './selection/getActiveState';

export function canAffordTrackAdvanceCost(
  action: CardAction,
  instance: CardInstance,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): boolean {
  const cs = getActiveState(instance, defs);
  const payableTrackEffects = action.actionEffects.filter(
    e => e.type === ActionEffectType.TRACK_ADVANCE && e.payingCost !== false,
  );
  const hasTrackAdvance = payableTrackEffects.length > 0 && cs?.track;

  if (!hasTrackAdvance) return true;

  return payableTrackEffects.every(trackEffect => {
    if (defs[instance.cardId].states.find(s => s.id === instance.stateId)?.track?.inOrder) {
      const firstTrackStep = getFirstAvailableTrackStep(
        [trackEffect],
        instance.id,
        gameState,
        defs,
        stickerDefs,
      );

      return (
        !!firstTrackStep &&
        canAffordCost(firstTrackStep.cost, instance.id, gameState, defs, stickerDefs)
      );
    }

    const trackSteps = cs.track?.steps ?? [];
    return trackSteps.some(step => {
      if (instance.trackProgress.includes(step.id)) return false;
      return canAffordCost(step.cost, instance.id, gameState, defs, stickerDefs);
    });
  });
}
