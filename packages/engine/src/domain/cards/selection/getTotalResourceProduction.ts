import { type ResourceType, TargetScope } from '../../enums';
import type { CardDef, GameState, Resources, Sticker } from '../../types';
import { cardSelector } from './cardSelector';
import { getActiveState } from './getActiveState';
import { getEffectiveProductions } from './getEffectiveProductions';

export function getTotalResourceProduction(
  instanceId: number,
  resourceType: ResourceType,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): number {
  return cardSelector(
    { scope: [TargetScope.ANY], produces: [resourceType] },
    instanceId,
    gameState,
    defs,
    stickerDefs,
  ).reduce((total, id) => {
    const state = getActiveState(gameState.instances[id], defs);
    const prodKeyCount = ((state.productions as Resources[]) || [{}])
      .map(p => {
        return (
          getEffectiveProductions(p, gameState, defs, gameState.instances[id], stickerDefs, false)[
            resourceType
          ] ?? 0
        );
      })
      .reduce((a, b) => Math.max(a, b), -Infinity);
    return total + prodKeyCount;
  }, 0);
}
