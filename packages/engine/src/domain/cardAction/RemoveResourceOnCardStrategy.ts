import { ActionEffectType, type ResourceType } from '../enums';
import type { GameState, RemovedResourceScope, ResolvedActionEffect } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

const DEFAULT_SCOPES: RemovedResourceScope[] = ['production', 'actionCost', 'upgradeCost'];

function extractResourceKeys(payload: ResolvedActionEffect): ResourceType[] {
  return Object.entries(payload.resources ?? {})
    .filter(([, value]) => (value ?? 0) > 0)
    .map(([key]) => key as ResourceType);
}

export class RemoveResourceOnCardStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    if (payload.type !== ActionEffectType.REMOVE_RESOURCE_ON_CARD) return gameState;
    if (!payload.instanceIds?.length) return gameState;

    const removedKeys = extractResourceKeys(payload);
    if (removedKeys.length === 0) return gameState;

    const scopes = payload.resourceScopes?.length ? payload.resourceScopes : DEFAULT_SCOPES;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;

    payload.instanceIds.forEach(targetId => {
      const target = gs.instances[targetId];
      if (!target) return;
      const targetStateId = payload.stateId ?? target.stateId;

      target.removedResourcesByState ??= {};
      target.removedResourcesByState[targetStateId] ??= {};

      const byScope = target.removedResourcesByState[targetStateId];
      scopes.forEach(scope => {
        const current = byScope[scope] ?? [];
        // value (e.g. from valuePerElement) crosses out the resources several times
        byScope[scope] = [
          ...current,
          ...Array.from({ length: payload.value ?? 1 }, () => removedKeys).flat(),
        ];
      });
    });

    return {
      ...gs,
      instances: gs.instances,
    };
  }
}
