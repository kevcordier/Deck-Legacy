import { ActionEffectType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardState, Cost, StepDef } from '@deck-legacy/engine/domain/types';

/**
 * A track whose boxes each show a glory value: marking one keeps its value on the card, which is
 * worth the highest marked glory (Wealth Contest, Grow Houses, House of Thornfield).
 */
export function highestMarked(
  values: number[],
  cost?: (index: number) => Cost,
): Pick<CardState, 'glory' | 'track'> {
  const steps: StepDef[] = values.map((glory, index) => ({
    id: index + 1,
    ...(cost && { cost: cost(index) }),
    effects: [
      {
        id: 1,
        type: ActionEffectType.SET_CUMULATED,
        cards: { scope: [TargetScope.SELF] },
        value: glory,
      },
    ],
  }));
  return {
    glory: { amount: 0, valuePerElement: { amount: 1, accumulation: true } },
    track: { inOrder: true, steps },
  };
}
