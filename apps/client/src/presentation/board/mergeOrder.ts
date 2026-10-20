/**
 * Display order of the cards: the cards new to the row first (in the engine order), then the
 * order already shown (or chosen by drag and drop), without the cards that left. Every id of `ids`
 * appears exactly once.
 */
export function mergeOrder(order: number[], ids: number[]): number[] {
  return [...ids.filter(id => !order.includes(id)), ...order.filter(id => ids.includes(id))];
}
