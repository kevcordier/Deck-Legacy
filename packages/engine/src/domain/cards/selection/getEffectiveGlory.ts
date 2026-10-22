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
  // Crossed out (Lady Elara): this state is worth nothing
  if (instance.crossedOutGloryStates?.includes(instance.stateId)) return 0;
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

  const gridBonus = activeState.glory?.gridBonus
    ? activeState.glory.gridBonus * countDistinctLines(instance.glories)
    : 0;

  return baseGlory + stickerGlory + passiveGlory + additionalGlory + gridBonus;
}

/** The 3×3 grid of written medals (in order): its rows, columns and diagonals of 3 different values. */
const GRID_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function countDistinctLines(medals: number[]): number {
  if (medals.length < 9) return 0;
  return GRID_LINES.filter(line => new Set(line.map(cell => medals[cell])).size === 3).length;
}
