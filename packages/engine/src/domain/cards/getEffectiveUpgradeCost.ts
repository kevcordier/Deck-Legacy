import { PassiveType, TargetScope } from '../enums';
import { fixResources } from '../resources/fixResources';
import { mergeResources } from '../resources/mergeResources';
import type { CardDef, Cost, GameState, Passive, Sticker } from '../types';
import { removeResourceKeysFromCost } from './removeResourceKeysFromCost';
import { sanitizeResources } from './sanitizeResources';
import { cardSelector } from './selection/cardSelector';
import { getRemovedResourcesForState } from './selection/getRemovedResourcesForState';

/** An ADJUST_UPDATE_COST passive: `amount` units the player does not pay (Crane), or `resources`. */
function adjustCost(cost: Cost, passive: Passive): void {
  if (passive.amount) {
    cost.discount = (cost.discount ?? 0) + passive.amount;
    return;
  }
  if (!passive.resources) return;
  const adjustment = passive.resources;
  const resourceCosts = cost.resources?.length ? cost.resources : [{}];
  cost.resources = resourceCosts.map(resources =>
    sanitizeResources(mergeResources(fixResources(resources), adjustment)),
  );
}

export function getEffectiveUpgradeCost(
  baseCost: Cost,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  instanceId: number,
): Cost {
  const adjustedCost = { ...(JSON.parse(JSON.stringify(baseCost)) as Cost), forUpgrade: true };
  const sourceInstance = gameState.instances[instanceId];

  for (const [passiveSourceId, passives] of Object.entries(gameState.boardEffects)) {
    for (const passive of passives.filter(p => p.type === PassiveType.ADJUST_UPDATE_COST)) {
      const affectedInstanceIds = cardSelector(
        passive.cards ?? { scope: [TargetScope.ANY] },
        Number(passiveSourceId),
        gameState,
        defs,
        stickerDefs,
      );
      if (affectedInstanceIds.includes(instanceId)) adjustCost(adjustedCost, passive);
    }
  }

  if (!sourceInstance) return adjustedCost;
  const removedKeys = getRemovedResourcesForState(
    sourceInstance,
    sourceInstance.stateId,
    'upgradeCost',
  );

  return removeResourceKeysFromCost(adjustedCost, removedKeys);
}
