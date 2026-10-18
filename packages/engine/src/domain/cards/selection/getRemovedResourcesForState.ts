import type { CardInstance, Resources } from '../../types';

export function getRemovedResourcesForState(
  instance: CardInstance,
  stateId: number,
  scope: 'production' | 'actionCost' | 'upgradeCost',
): (keyof Resources)[] {
  return instance.removedResourcesByState?.[stateId]?.[scope] ?? [];
}
