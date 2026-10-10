/**
 * Display order of the cards: the order chosen by drag and drop, without the cards that left,
 * then the cards new to the row. Every id of `ids` appears exactly once.
 */
export function mergeOrder(order: number[], ids: number[]): number[] {
  return [...order.filter(id => ids.includes(id)), ...ids.filter(id => !order.includes(id))];
}
