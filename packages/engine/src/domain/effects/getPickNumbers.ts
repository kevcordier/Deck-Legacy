export function getPickNumbers(
  picks: {
    pickNumber?: number;
    pickMin?: number;
    pickMax?: number;
  },
  choiceNumber?: number,
): { pickMin: number; pickMax: number } {
  let min = 1;
  let max = 1;
  if (!!picks.pickNumber || !!picks.pickMin || !!picks.pickMax) {
    min = picks.pickMin ?? picks.pickNumber ?? min;
    max = picks.pickMax ?? picks.pickNumber ?? max;
  }

  const pickMax = Math.min(max, choiceNumber ?? max);
  // Fewer choices than asked: pick as many as possible (3 steps to mark, 1 left)
  return { pickMin: Math.min(min, pickMax), pickMax };
}
