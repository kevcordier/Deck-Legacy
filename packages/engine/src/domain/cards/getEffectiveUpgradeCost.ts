import { PassiveType, TargetScope } from '../enums';
import { fixResources } from '../resources/fixResources';
import { mergeResources } from '../resources/mergeResources';
import type { CardDef, Cost, GameState, Resources, Sticker } from '../types';
import { removeResourceKeysFromCost } from './removeResourceKeysFromCost';
import { cardSelector } from './selection/cardSelector';
import { getRemovedResourcesForState } from './selection/getRemovedResourcesForState';

export function sanitizeResources(resources: Resources): Resources {
  return Object.entries(resources).reduce<Resources>((acc, [key, value]) => {
    const clampedValue = Math.max(0, Number(value) || 0);
    if (clampedValue > 0) {
      acc[key as keyof Resources] = clampedValue;
    }
    return acc;
  }, {});
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
    for (const passive of passives.filter(
      p => p.type === PassiveType.ADJUST_UPDATE_COST && p.resources,
    )) {
      const affectedInstanceIds = cardSelector(
        passive.cards ?? { scope: [TargetScope.ANY] },
        Number(passiveSourceId),
        gameState,
        defs,
        stickerDefs,
      );

      if (!affectedInstanceIds.includes(instanceId) || !passive.resources) {
        continue;
      }

      const resourceCosts = adjustedCost.resources?.length ? adjustedCost.resources : [{}];
      adjustedCost.resources = resourceCosts.map(cost =>
        sanitizeResources(mergeResources(fixResources(cost), passive.resources as Resources)),
      );
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
