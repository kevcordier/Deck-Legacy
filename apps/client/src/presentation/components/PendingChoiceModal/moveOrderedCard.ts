/** The cards being re-arranged and the one dropped on the destroy slot (Performance). */
export type CardOrder = { order: number[]; destroyed: number | null };

/**
 * Moves `cardId` to the slot `target` of the order, or onto the destroy slot: a card already there
 * goes back at the end of the order.
 */
export function moveOrderedCard(
  { order, destroyed }: CardOrder,
  cardId: number,
  target: number | 'destroy',
): CardOrder {
  const rest = order.filter(id => id !== cardId);
  const previous = destroyed === cardId ? null : destroyed;
  if (target === 'destroy') {
    return { order: previous === null ? rest : [...rest, previous], destroyed: cardId };
  }
  const index = Math.max(0, Math.min(target, rest.length));
  return { order: [...rest.slice(0, index), cardId, ...rest.slice(index)], destroyed: previous };
}
