import { matchHaving } from './cardSelector';
import type { CardDef, GameState, StateSelector, Sticker } from './types';

export { matchHaving } from './cardSelector';

export function stateSelector(
  selector: StateSelector,
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): number[] {
  const { ids } = selector;

  return (
    ids?.filter(id => matchHaving(instanceId, id, { gameState, defs, stickerDefs, selector })) ?? []
  );
}
