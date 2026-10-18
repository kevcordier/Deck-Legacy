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

  return {
    pickMin: min,
    pickMax: Math.min(max, choiceNumber ?? max),
  };
}
