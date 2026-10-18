import type { CardDef, CardInstance, CardState, GameState, Sticker } from '../../types';
import { countValuePerElement } from './countValuePerElement';
import { evaluateCondition } from './evaluateCondition';

export function getEffectiveGlory(
  activeState: CardState,
  gameState: GameState,
  defs: Record<number, CardDef>,
  instance: CardInstance,
  stickerDefs: Record<number, Sticker> = {},
): number {
  const conditionPasses =
    !activeState.glory?.condition ||
    evaluateCondition(activeState.glory.condition, gameState, instance.id, defs, stickerDefs);

  const baseGlory = activeState.glory && conditionPasses ? activeState.glory.amount : 0;
  const stickerGlory = (instance.stickers[instance.stateId] ?? []).reduce(
    (acc, stickerId) => acc + (stickerDefs[stickerId]?.glory ?? 0),
    0,
  );
  const additionalGlory = instance.glories.reduce((acc, glory) => acc + glory, 0);

  let passiveGlory = 0;

  if (activeState.glory?.valuePerElement && conditionPasses) {
    const count = countValuePerElement(
      activeState.glory.valuePerElement,
      gameState,
      instance.id,
      defs,
      stickerDefs,
    );
    passiveGlory = activeState.glory.valuePerElement.amount * count;
  }

  return baseGlory + stickerGlory + passiveGlory + additionalGlory;
}
