import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { ActionEffectType, type ResourceType } from '@engine/domain/enums';
import type { GameState, RemovedResourceScope, ResolvedActionEffect } from '@engine/domain/types';

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

      if (!target.removedResourcesByState) {
        target.removedResourcesByState = {};
      }
      if (!target.removedResourcesByState[targetStateId]) {
        target.removedResourcesByState[targetStateId] = {};
      }

      const byScope = target.removedResourcesByState[targetStateId];
      scopes.forEach(scope => {
        const current = byScope[scope] ?? [];
        byScope[scope] = [...new Set([...current, ...removedKeys])];
      });
    });

    return {
      ...gs,
      instances: gs.instances,
    };
  }
}
